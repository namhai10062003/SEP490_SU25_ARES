import PayOS from "@payos/node";
import Contract from "../models/Contract.js";

const payos = new PayOS(
  process.env.CLIENTIDCONTRACT,
  process.env.APIKEYCONTRACT,
  process.env.CHECKSUMKEYCONTRACT
);

// 👉 Tạo link thanh toán cho hợp đồng
export const createContractPayment = async (req, res) => {
  try {
    const { contractId } = req.params;
    const DOMAIN = process.env.FRONTEND_URL || "http://localhost:5173";
    const expiredTime = parseInt(process.env.EXPIREDAT_QR) || 60;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        message: "Hợp đồng không tồn tại",
        success: false,
        error: true,
      });
    }

    // Tạo orderCode (timestamp + random)
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const orderCode = parseInt(`${timestamp}${randomNum}`);

    const expiredAt = Math.floor((Date.now() + expiredTime * 1000) / 1000);

    const paymentData = {
      amount: contract.depositAmount,
      description: `Đặt cọc hợp đồng`.substring(0, 25),
      orderCode,
      returnUrl: `${DOMAIN}/my-contracts`,
      cancelUrl: `${DOMAIN}/my-contracts`,
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

    // Lưu thông tin đơn thanh toán
    await Contract.findByIdAndUpdate(contractId, {
      orderCode,
      paymentStatus: "unpaid",
      status: "approved", // Trạng thái chờ thanh toán
      isActive: false,
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
    console.error("❌ Lỗi tạo thanh toán:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

// 👉 Xử lý webhook thanh toán từ PayOS
export const handleContractPaymentWebhook = async (req, res) => {
  try {
    const rawBody = req.body;
    const webhookData = rawBody?.data; // ✅ Lấy từ .data
    const signature = rawBody?.signature;

    console.log("📩 Webhook nhận:", rawBody);

    if (!webhookData?.orderCode) {
      return res.status(400).send("Missing orderCode");
    }

    const contract = await Contract.findOne({
      orderCode: webhookData.orderCode.toString(),
    });

    if (!contract) {
      console.log("❌ Không tìm thấy hợp đồng với orderCode:", webhookData.orderCode);
      return res.status(404).send("Contract not found");
    }

    // ✅ Nếu thanh toán thành công
    if (webhookData.code === "00") {
      const paymentDate = new Date(webhookData.transactionDateTime || Date.now());
      const expireDays = 30;
      const expiredDate = new Date(paymentDate.getTime() + expireDays * 24 * 60 * 60 * 1000);

      await Contract.findByIdAndUpdate(contract._id, {
        paymentStatus: "paid",
        paymentDate,
        expiredDate,
        status: "active",
        isActive: true,
      });

      console.log("✅ Đã cập nhật trạng thái thành paid:", contract._id);
    } else {
      await Contract.findByIdAndUpdate(contract._id, {
        paymentStatus: "unpaid",
        status: "canceled",
        isActive: false,
      });

      console.log("❌ Thanh toán thất bại hoặc bị hủy:", contract._id);
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Lỗi xử lý webhook:", error);
    return res.status(500).send("Internal Server Error");
  }
};


