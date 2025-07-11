import PayOS from "@payos/node";
import Fee from "../models/Fee.js";

const payos = new PayOS(
  process.env.CLIENTID,
  process.env.APIKEY,
  process.env.CHECKSUMKEY
);

export const createFeePayment = async (req, res) => {
  try {
    const { apartmentId, month } = req.body; // 🟡 truyền từ frontend
    const DOMAIN = process.env.FRONTEND_URL || "http://localhost:5173";
    const expiredTime = parseInt(process.env.EXPIREDAT_QR) || 60;

    const fee = await Fee.findOne({ apartmentId, month });
    if (!fee) {
      return res.status(404).json({ message: "Không tìm thấy phí tháng này", success: false });
    }

    const timestamp = Date.now();
    const orderCode = parseInt(`${timestamp}${Math.floor(Math.random() * 1000)}`);
    const expiredAt = Math.floor((Date.now() + expiredTime * 1000) / 1000);

    const paymentData = {
      amount: fee.total,
      description: `Thanh toán phí tháng ${month}`.slice(0, 25),
      orderCode,
      returnUrl: `${DOMAIN}/my-apartment`,
      cancelUrl: `${DOMAIN}/my-apartment`,
      expiredAt,
    };

    const response = await payos.createPaymentLink(paymentData);

    if (!response || !response.checkoutUrl) {
      return res.status(500).json({ message: "Không tạo được link thanh toán", success: false });
    }

    // Cập nhật fee
    fee.orderCode = orderCode.toString();
    fee.paymentStatus = "paid";
    await fee.save();

    res.json({
      success: true,
      message: "Tạo thanh toán thành công",
      data: {
        paymentUrl: response.checkoutUrl,
      },
    });
  } catch (error) {
    console.error("Fee Payment Error:", error);
    res.status(500).json({ message: error.message, success: false });
  }
};
export const handleFeePaymentWebhook = async (req, res) => {
    try {
      const webhookData = req.body?.data;
      if (!webhookData) return res.status(400).json({ message: "Thiếu dữ liệu webhook" });
  
      const isValid = payos.verifyPaymentWebhookData(webhookData);
      if (!isValid) return res.status(400).json({ message: "Dữ liệu webhook không hợp lệ" });
  
      const fee = await Fee.findOne({ orderCode: webhookData.orderCode.toString() });
      if (!fee) return res.status(404).json({ message: "Không tìm thấy phí tương ứng" });
  
      if (webhookData.status === "PAID") {
        fee.paymentStatus = "paid";
        fee.paymentDate = new Date();
        await fee.save();
        console.log("✅ Đã thanh toán phí:", fee._id);
      } else if (webhookData.status === "FAILED" || webhookData.status === "CANCELED") {
        fee.paymentStatus = "unpaid";
        await fee.save();
        console.log("❌ Thanh toán thất bại:", fee._id);
      }
  
      return res.status(200).json({ message: "Xử lý webhook thành công", success: true });
    } catch (error) {
      console.error("Webhook Fee Error:", error);
      res.status(500).json({ message: error.message });
    }
  };
  