import PayOS from "@payos/node";
import Fee from "../models/Fee.js";

const payos = new PayOS(
  process.env.CLIENTIDFEE,
  process.env.APIKEYFEE,
  process.env.CHECKSUMKEYFEE
);

// 👉 Tạo link thanh toán phí
export const createFeePayment = async (req, res) => {
  try {
    const { apartmentId, month } = req.body;
    const DOMAIN = process.env.FRONTEND_URL || "http://localhost:5173";
    const expiredTime = parseInt(process.env.EXPIREDAT_QR) || 60;

    const fee = await Fee.findOne({ apartmentId, month });
    if (!fee) {
      return res.status(404).json({
        message: "Không tìm thấy phí tháng này",
        success: false,
        error: true,
      });
    }

    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const orderCode = parseInt(`${timestamp}${randomNum}`);
    const expiredAt = Math.floor((Date.now() + expiredTime * 1000) / 1000);

    const paymentData = {
      amount: fee.total,
      description: `Phí tháng ${month}`.substring(0, 25),
      orderCode,
      returnUrl: `${DOMAIN}/my-apartment`,
      cancelUrl: `${DOMAIN}/my-apartment`,
      expiredAt,
    };

    const response = await payos.createPaymentLink(paymentData);

    if (!response?.checkoutUrl) {
      return res.status(500).json({
        message: "Lỗi tạo thanh toán từ PayOS",
        success: false,
        error: true,
      });
    }

    // Cập nhật phí
    fee.orderCode = orderCode.toString();
    fee.paymentStatus = "unpaid"; // chờ thanh toán
    await fee.save();

    return res.status(200).json({
      message: "Tạo thanh toán thành công",
      success: true,
      error: false,
      data: {
        paymentUrl: response.checkoutUrl,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi tạo thanh toán phí:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

// 👉 Xử lý webhook thanh toán phí
export const handleFeePaymentWebhook = async (req, res) => {
  try {
    const webhookData = req.body;

    console.log("📩 Webhook Fee RAW:", JSON.stringify(webhookData, null, 2));

    const orderCode = webhookData?.data?.orderCode;

    if (!orderCode) {
      return res.status(400).send("Thiếu orderCode");
    }

    const fee = await Fee.findOne({ orderCode: orderCode.toString() });

    if (!fee) {
      console.log("❌ Không tìm thấy phí với orderCode:", orderCode);
      return res.status(404).send("Không tìm thấy phí");
    }

   if (webhookData.code == "00" || webhookData.code == 0) {
      // Thành công
      const paymentDate = new Date(webhookData.data.transactionDateTime || Date.now());

      await Fee.findByIdAndUpdate(fee._id, {
        paymentStatus: "paid",
        paymentDate,
      });

      console.log("✅ Đã thanh toán phí:", fee._id);
    } else {
      // Thất bại
      await Fee.findByIdAndUpdate(fee._id, {
        paymentStatus: "unpaid",
      });

      console.log("❌ Thanh toán phí thất bại:", fee._id);
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Lỗi xử lý webhook phí:", error);
    return res.status(500).send("Internal Server Error");
  }
};
