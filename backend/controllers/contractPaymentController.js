import PayOS from "@payos/node";
import Contract from "../models/Contract.js";

const payos = new PayOS(
  process.env.CLIENTID,
  process.env.APIKEY,
  process.env.CHECKSUMKEY
);

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

    const orderCode = Math.floor(Math.random() * 1000000000); // <= 9 chữ số

    const now = Date.now();
    const expiredAt = Math.floor((now + expiredTime * 1000) / 1000); // seconds

    const paymentData = {
      amount: contract.depositAmount,
      description: `Dat coc hop dong`.substring(0, 25),
      cancelUrl: `${DOMAIN}/my-contract`,// lưu ý nếu co hosting thì mình sẽ hủy dc theo đúng vs nó á 
      returnUrl: `${DOMAIN}/my-contracts?status=PAID&orderCode=${orderCode}`,
      orderCode,
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

    await Contract.findByIdAndUpdate(contractId, {
      orderCode,
      paymentStatus: "paid",
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

export const handleContractPaymentWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    console.log("📩 Webhook nhận:", webhookData);

    const isValid = payos.verifyPaymentWebhookData(webhookData);
    if (!isValid) {
      console.log("❌ Dữ liệu webhook không hợp lệ");
      return res.status(400).json({ message: "Webhook không hợp lệ" });
    }

    const { orderCode, status } = webhookData;

    if (status !== "PAID") {
      return res.status(200).json({ message: "Không phải trạng thái PAID, bỏ qua" });
    }

    const contract = await Contract.findOne({ orderCode: orderCode.toString() });

    if (!contract) {
      console.log("❌ Không tìm thấy hợp đồng:", orderCode);
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }

    if (contract.paymentStatus === "paid") {
      return res.status(200).json({ message: "Đã thanh toán trước đó" });
    }

    const updated = await Contract.findByIdAndUpdate(contract._id, {
      paymentStatus: "paid",
      paymentDate: new Date(),
    }, { new: true });

    console.log("✅ Đã cập nhật trạng thái hợp đồng:", updated);

    return res.status(200).json({
      message: "Đã xử lý webhook và cập nhật hợp đồng",
      success: true,
    });
  } catch (error) {
    console.error("❌ Lỗi khi xử lý webhook:", error);
    return res.status(500).json({ message: error.message });
  }
};





// hàm return payment 
// 👉 Frontend sẽ redirect về đây khi thanh toán xong
// export const handlePaymentReturn = async (req, res) => {
//   const { orderCode, status } = req.query;

//   try {
//     const contract = await Contract.findOne({ orderCode });

//     if (!contract) {
//       return res.redirect(`${process.env.FRONTEND_URL}/contracts?error=true`);
//     }

//     if (status === "CANCELLED") {
//       await Contract.findByIdAndUpdate(contract._id, {
//         paymentStatus: "cancelled",
//       });

//       return res.redirect(`${process.env.FRONTEND_URL}/contracts?cancel=true`);
//     }

//     if (status === "PAID") {
//       // Nếu webhook chưa xử lý kịp, đảm bảo cập nhật ở đây nữa
//       if (contract.paymentStatus !== "paid") {
//         await Contract.findByIdAndUpdate(contract._id, {
//           paymentStatus: "paid",
//           paymentDate: new Date(),
//         });
//       }

//       return res.redirect(`${process.env.FRONTEND_URL}/contracts?success=true`);
//     }

//     return res.redirect(`${process.env.FRONTEND_URL}/contracts?unknown=true`);
//   } catch (error) {
//     console.error("❌ Lỗi handlePaymentReturn:", error);
//     return res.redirect(`${process.env.FRONTEND_URL}/contracts?error=true`);
//   }
// };
