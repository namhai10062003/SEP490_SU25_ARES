import PayOS from "@payos/node";
import Post from "../models/Post.js";
import mongoose from 'mongoose';

const payos = new PayOS(
    process.env.CLIENTID,
    process.env.APIKEY,
    process.env.CHECKSUMKEY
);

export const createPostPayment = async (req, res) => {
    try {
        const { postId } = req.params;
        const DOMAIN = process.env.FRONTEND_URL || "http://localhost:5173";
        const expiredTime = parseInt(process.env.EXPIREDAT_QR) || 60;

        const post = await Post.findById(postId).populate('postPackage');

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: true
            });
        }
        // Tính ngày hết hạn của bài viết dựa trên gói
        const expireDays = post.postPackage?.expireAt || 7; // đơn vị là ngày
        const paymentDate = new Date();
        const expiredDate = new Date(
            paymentDate.getTime() + expireDays * 24 * 60 * 60 * 1000
        );
        // nch muốn demo cho ai xem thì cmt 3 dòng dưới còn code chính thì mở cmt 4 dòng trên 
        // const paymentDate = new Date();
        // const expireMinutes = 1; // test cộng 1 phút
        // const expiredDate = new Date(paymentDate.getTime() + expireMinutes * 60 * 1000);
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const orderCode = parseInt(`${timestamp}${randomNum}`);

        const now = Date.now();
        const expiredAt = Math.floor((now + expiredTime * 1000) / 1000); // dùng cho PayOS QR timeout

        const paymentData = {
            amount: post.postPackage.price,
            description: `Thanh toan goi ${post.postPackage.type}`.substring(0, 25),
            orderCode,
            returnUrl: `${DOMAIN}/blog`,
            cancelUrl: `${DOMAIN}/quanlipostcustomer`,
            expiredAt,
        };

        const response = await payos.createPaymentLink(paymentData);

        if (!response || !response.checkoutUrl) {
            return res.status(500).json({
                message: "Lỗi tạo thanh toán từ payOS",
                success: false,
                error: true,
            });
        }

        // ✅ Cập nhật trạng thái và ngày hết hạn
        await Post.findByIdAndUpdate(postId, {
            paymentStatus: "paid",
            status: "active",
            isActive: true,
            paymentDate,
            expiredDate,
            orderCode,
        });

        return res.status(200).json({
            message: "Tạo thanh toán thành công",
            success: true,
            error: false,
            data: {
                paymentUrl: response.checkoutUrl,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            error: true,
        });
    }
};


export const handlePostPaymentWebhook = async (req, res) => {
    try {
        const webhookData = req.body;
        console.log('Webhook received:', webhookData);

        const isValid = payos.verifyPaymentWebhookData(webhookData);
        if (!isValid) {
            console.log('Invalid webhook data');
            return res.status(400).json({
                message: "Webhook không hợp lệ",
                success: false,
                error: true
            });
        }

        if (webhookData.status === "PAID") {
            console.log('Payment successful for order:', webhookData.orderCode);

            // Tìm post theo orderCode
            const post = await Post.findOne({ orderCode: webhookData.orderCode.toString() });

            if (!post) {
                console.log('Post not found for order:', webhookData.orderCode);
                return res.status(404).json({
                    message: "Post not found",
                    success: false,
                    error: true
                });
            }

            console.log('Updating post status for:', post._id);
            // Cập nhật trạng thái post thành active
            await Post.findByIdAndUpdate(post._id, {
                status: 'active',
                paymentStatus: 'paid',
                paymentDate: new Date()
            });

            console.log('Post status updated successfully');
            return res.status(200).json({
                message: "Cập nhật trạng thái thanh toán thành công",
                success: true,
                error: false
            });
        } else {
            console.log('Payment status:', webhookData.status);
        }

        return res.status(200).json({
            message: "Webhook received",
            success: true,
            error: false
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({
            message: error.message,
            success: false,
            error: true
        });
    }
}; 