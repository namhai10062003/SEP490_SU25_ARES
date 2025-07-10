import PayOS from "@payos/node";
import Post from "../models/Post.js";

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

        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const orderCode = parseInt(`${timestamp}${randomNum}`);

        const now = Date.now();
        const expiredAt = Math.floor((now + expiredTime * 1000) / 1000); // seconds

        const paymentData = {
            amount: post.postPackage.price,
            description: `Thanh toan goi ${post.postPackage.type}`.substring(0, 25),
            orderCode,
            returnUrl: `${DOMAIN}/blog`,
            cancelUrl: `${DOMAIN}/profile/quanlipostcustomer`,
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

        // ✅ Lưu orderCode và set trạng thái pending
        await Post.findByIdAndUpdate(postId, {
            paymentStatus: "unpaid",
            status: "approved", // Hoặc "approved" nếu bạn duyệt trước khi thanh toán
            isActive: false,
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
        const webhookData = req.body?.data || req.body;

        console.log('Webhook received:', webhookData);

        if (!webhookData) {
            return res.status(200).json({
                message: "Webhook test OK",
                success: true,
                error: false
            });
        }
        const isValid = payos.verifyPaymentWebhookData(webhookData);
        if (!isValid) {
            console.log('Invalid webhook data');
            return res.status(400).json({
                message: "Webhook không hợp lệ",
                success: false,
                error: true
            });
        }

        const post = await Post.findOne({ orderCode: webhookData.orderCode.toString() }).populate("postPackage");

        if (!post) {
            console.log('Post not found for order:', webhookData.orderCode);
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: true
            });
        }

        if (webhookData.status === "PAID") {
            const paymentDate = new Date();
            const expireDays = post.postPackage?.expireAt || 7;
            const expiredDate = new Date(paymentDate.getTime() + expireDays * 24 * 60 * 60 * 1000);

            await Post.findByIdAndUpdate(post._id, {
                status: 'active',
                paymentStatus: 'paid',
                paymentDate,
                expiredDate,
                isActive: true,
            });

            console.log('✅ Payment confirmed and post activated:', post._id);
        } else if (webhookData.status === "CANCELED" || webhookData.status === "FAILED") {
            await Post.findByIdAndUpdate(post._id, {
                paymentStatus: 'unpaid',
                isActive: false,
            });
            console.log('❌ Payment failed/canceled:', post._id);
        }

        return res.status(200).json({
            message: "Webhook processed",
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
