import PayOS from "@payos/node";
import Contract from "../models/Contract.js";

const payos = new PayOS(
  process.env.CLIENTIDCONTRACT,
  process.env.APIKEYCONTRACT,
  process.env.CHECKSUMKEYCONTRACT
);

// 👉 Tạo link thanh toán cho hợp đồng
// export const createContractPayment = async (req, res) => {
//   try {
//     const { contractId } = req.params;
//     const DOMAIN = process.env.FRONTEND_URL || "http://localhost:5173";
//     const expiredTime = parseInt(process.env.EXPIREDAT_QR) || 60;

//     const contract = await Contract.findById(contractId);
//     if (!contract) {
//       return res.status(404).json({
//         message: "Hợp đồng không tồn tại",
//         success: false,
//         error: true,
//       });
//     }

//     // Tạo orderCode (timestamp + random)
//     const timestamp = Date.now();
//     const randomNum = Math.floor(Math.random() * 1000);
//     const orderCode = parseInt(`${timestamp}${randomNum}`);

//     const expiredAt = Math.floor((Date.now() + expiredTime * 1000) / 1000);

//     const paymentData = {
//       amount: contract.depositAmount,
//       description: `Đặt cọc hợp đồng`.substring(0, 25),
//       orderCode,
//       returnUrl: `${DOMAIN}/my-contracts`,
//       cancelUrl: `${DOMAIN}/my-contracts`,
//       expiredAt,
//     };

//     const response = await payos.createPaymentLink(paymentData);

//     if (!response?.checkoutUrl) {
//       return res.status(500).json({
//         message: "Lỗi tạo thanh toán từ PayOS",
//         success: false,
//         error: true,
//       });
//     }

//     // Lưu thông tin đơn thanh toán
//     await Contract.findByIdAndUpdate(contractId, {
//       orderCode,
//       paymentStatus: "unpaid",
//       status: "approved", // Trạng thái chờ thanh toán
//       isActive: false,
//     });

//     return res.status(200).json({
//       message: "Tạo thanh toán thành công",
//       success: true,
//       error: false,
//       data: {
//         paymentUrl: response.checkoutUrl,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Lỗi tạo thanh toán:", error);
//     return res.status(500).json({
//       message: error.message,
//       success: false,
//       error: true,
//     });
//   }
// };
// 👉 Tạo link thanh toán cho hợp đồng
export const createContractPayment = async (req, res) => {
  try {
    const { contractId } = req.params;
    const DOMAIN = process.env.FRONTEND_URL || "http://localhost:5173";
    const expiredTime = parseInt(process.env.EXPIREDAT_QR) || 60;

    // Tìm hợp đồng hiện tại
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        message: "Hợp đồng không tồn tại",
        success: false,
        error: true,
      });
    }

    // ✅ Check xem có hợp đồng khác cùng postId đang pending không
    const pendingContract = await Contract.findOne({
      postId: contract.postId, // dùng postId thay vì apartmentCode
      paymentStatus: "pending",
      _id: { $ne: contractId } // loại trừ hợp đồng hiện tại
    });

    if (pendingContract) {
      return res.status(400).json({
        message: "Bài đăng này đang có hợp đồng khác đang thanh toán",
        success: false,
        error: true,
      });
    }
// ✅ Check xem có hợp đồng khác cùng postId đã thanh toán chưa
const paidContract = await Contract.findOne({
  postId: contract.postId,
  paymentStatus: "paid",
  _id: { $ne: contractId }
});
if (paidContract) {
  return res.status(400).json({
    message: "Bài đăng này đã được thanh toán, không thể đặt cọc thêm",
    success: false,
    error: true,
  });
}
    // Tạo orderCode
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const orderCode = parseInt(`${timestamp}${randomNum}`);
    const expiredAt = Math.floor((Date.now() + expiredTime * 1000) / 1000);

    const paymentData = {
      amount: contract.depositAmount,
      description: `Đặt cọc hợp đồng`.substring(0, 25),
      orderCode,
      returnUrl: `${DOMAIN}/my-contracts`,
      cancelUrl: `${DOMAIN}/cancel-payment/${orderCode}`,
      expiredAt,
    };

    // Gọi PayOS tạo link
    const response = await payos.createPaymentLink(paymentData);

    if (!response?.checkoutUrl) {
      return res.status(500).json({
        message: "Lỗi tạo thanh toán từ PayOS",
        success: false,
        error: true,
      });
    }

    // ✅ Cập nhật trạng thái hợp đồng
    await Contract.findByIdAndUpdate(contractId, {
      orderCode,
      paymentStatus: "pending",
      status: "approved",
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
    const webhookData = req.body;

    console.log("📩 Webhook RAW:", JSON.stringify(webhookData, null, 2));

    const orderCode = webhookData?.data?.orderCode;
    if (!orderCode) {
      return res.status(400).send("Missing orderCode");
    }

    const contract = await Contract.findOne({ orderCode: orderCode.toString() });
    if (!contract) {
      console.log("❌ Không tìm thấy hợp đồng với orderCode:", orderCode);
      return res.status(404).send("Contract not found");
    }

    // Chỉ xử lý khi đang ở trạng thái pending
    if (contract.paymentStatus !== "pending") {
      console.log("⚠️ Contract không ở trạng thái pending, bỏ qua:", contract._id);
      return res.status(200).send("Ignored");
    }

    // ✅ Thanh toán thành công
    if (webhookData.code === "00") {
      // Check nếu đã có hợp đồng khác cùng postId thanh toán thành công
      const otherPaidContract = await Contract.findOne({
        postId: contract.postId,
        paymentStatus: "paid",
        _id: { $ne: contract._id }
      });

      if (otherPaidContract) {
        console.log("⚠️ Đã có hợp đồng khác paid, hủy hợp đồng này:", contract._id);
        await Contract.findByIdAndUpdate(contract._id, {
          paymentStatus: "failed",
          status: "canceled",
        });
        return res.status(200).send("Already paid by another contract");
      }

      const paymentDate = new Date(webhookData.data.transactionDateTime || Date.now());
      const expiredDate = new Date(paymentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      await Contract.findByIdAndUpdate(contract._id, {
        paymentStatus: "paid",
        paymentDate,
        expiredDate,
        status: "approved",
      });

      console.log("✅ Đã cập nhật trạng thái paid:", contract._id);
    } 
    else {
      // ❌ Thanh toán thất bại hoặc bị hủy
      await Contract.findByIdAndUpdate(contract._id, {
        paymentStatus: "failed",
        status: "canceled",
      });
      console.log("❌ Thanh toán thất bại:", contract._id);
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Lỗi xử lý webhook:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// xử lý nút hủy á 
export const cancelPayment = async (req, res) => {
  try {
    const { orderCode } = req.params;

    // 🔍 Tìm hợp đồng theo orderCode
    const contract = await Contract.findOne({ orderCode });
    if (!contract) {
      return res.status(404).json({
        message: "Không tìm thấy hợp đồng",
        success: false,
        error: true,
      });
    }

    // ✅ Nếu hợp đồng đang pending thì hủy thanh toán
    if (contract.paymentStatus === "pending") {
      contract.paymentStatus = "unpaid";
      contract.orderCode = null; // clear orderCode cũ
      await contract.save();
    }

    // ❌ Không redirect, chỉ trả JSON
    return res.status(200).json({
      message: "Hủy thanh toán thành công",
      success: true,
      error: false,
    });

  } catch (error) {
    console.error("❌ Lỗi hủy thanh toán:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};






