import PayOS from "@payos/node";
import Contract from "../models/Contract.js";

const payos = new PayOS(
  process.env.CLIENTID,
  process.env.APIKEY,
  process.env.CHECKSUMKEY
);

// 👉 Tạo thanh toán hợp đồng
export const createContractPayment = async (req, res) => {
  try {
    const { contractId } = req.params;
    const DOMAIN = process.env.FRONTEND_URL || "http://localhost:5173";
    const expiredTime = parseInt(process.env.EXPIREDAT_QR) || 60;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: "Hợp đồng không tồn tại", error: true });
    }

    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const orderCode = parseInt(`${timestamp}${randomNum}`);

    const now = Date.now();
    const expiredAt = Math.floor((now + expiredTime * 1000) / 1000);

    const paymentData = {
      amount: contract.depositAmount,
      description: `Dat coc hop dong`.substring(0, 25),
      orderCode,
      cancelUrl: `${DOMAIN}/my-contracts?cancel=true&status=CANCELLED&orderCode=${orderCode}`,
    returnUrl: `${DOMAIN}/my-contracts?status=PAID&orderCode=${orderCode}`,
      expiredAt,
    };

    const response = await payos.createPaymentLink(paymentData);

    if (!response?.checkoutUrl) {
      return res.status(500).json({ message: "Tạo thanh toán thất bại", error: true });
    }

    await Contract.findByIdAndUpdate(contractId, {
      paymentStatus: "unpaid",
      paymentDate: new Date(),
      orderCode,
    });

    return res.status(200).json({
      message: "Tạo thanh toán thành công",
      data: { paymentUrl: response.checkoutUrl },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true });
  }
};

// 👉 Webhook xử lý khi thanh toán thành công
export const handleContractPaymentWebhook = async (req, res) => {
  try {
    const webhookData = req.body;

    const isValid = payos.verifyPaymentWebhookData(webhookData);
    if (!isValid) {
      return res.status(400).json({ message: "Webhook không hợp lệ", error: true });
    }

    if (webhookData.status === "PAID") {
      const contract = await Contract.findOne({ orderCode: webhookData.orderCode.toString() });

      if (!contract) {
        return res.status(404).json({ message: "Không tìm thấy hợp đồng", error: true });
      }

      await Contract.findByIdAndUpdate(contract._id, {
        paymentStatus: "paid",
        paymentDate: new Date(),
      });

      return res.status(200).json({ message: "Đã cập nhật thanh toán" });
    }

    return res.status(200).json({ message: "Webhook nhận thành công" });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true });
  }
};
// hàm return payment 
export const handlePaymentReturn = async (req, res) => {
    const { orderCode, status } = req.query;
  
    try {
      const contract = await Contract.findOne({ orderCode });
  
      if (!contract) {
        return res.redirect(`${process.env.FRONTEND_URL}/contracts?error=true`);
      }
  
      if (status === "CANCELLED") {
        await Contract.findByIdAndUpdate(contract._id, {
          paymentStatus: "failed",
        });
  
        return res.redirect(`${process.env.FRONTEND_URL}/contracts?cancel=true`);
      }
  
      if (status === "PAID") {
        await Contract.findByIdAndUpdate(contract._id, {
          paymentStatus: "paid",
          paymentDate: new Date(),
        });
  
        return res.redirect(`${process.env.FRONTEND_URL}/contracts?success=true`);
      }
  
      return res.redirect(`${process.env.FRONTEND_URL}/contracts?unknown=true`);
    } catch (error) {
      console.error(error);
      return res.redirect(`${process.env.FRONTEND_URL}/contracts?error=true`);
    }
  };