import mongoose from "mongoose";
import Contract from "../models/Contract.js";
import Notification from "../models/Notification.js";
import WithdrawRequest from "../models/WithdrawRequest.js";

export const createWithdrawRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const { accountHolder, bankNumber, bankName, amount } = req.body;
    console.log("📥 Yêu cầu rút tiền từ user:", userId);
    console.log("📦 Thông tin nhận:", { accountHolder, bankNumber, bankName, amount });

    if (!accountHolder || !bankNumber || !bankName || !amount) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Số tiền rút không hợp lệ" });
    }

    // 👉 Lọc hợp đồng đã thanh toán
    const contracts = await Contract.find({
      paymentStatus: "paid",
      landlordId: objectUserId,
    });

    console.log(`🔍 Tìm thấy ${contracts.length} hợp đồng đã thanh toán`);

    if (!contracts.length) {
      return res.status(400).json({ message: "Không tìm thấy hợp đồng hợp lệ" });
    }

    // 👉 Tổng tiền có thể rút (dựa trên withdrawableAmount, không dùng depositAmount nữa)
    const totalWithdrawableFromContracts = contracts.reduce(
      (sum, contract) => sum + Number(contract.withdrawableAmount || 0),
      0
    );

    // 👉 Lịch sử rút tiền trước đó (không tính bị reject)
    const withdrawHistory = await WithdrawRequest.find({
      user: objectUserId,
      status: { $ne: "rejected" },
    });

    const totalAlreadyWithdrawn = withdrawHistory.reduce(
      (sum, w) => sum + Number(w.amount || 0),
      0
    );

    // 👉 Tính số dư hiện tại có thể rút
    const totalWithdrawable = Math.max(
      Math.floor(totalWithdrawableFromContracts - totalAlreadyWithdrawn),
      0
    );
    const requestedInt = Math.floor(numericAmount);

    console.log(`💰 Tổng tiền có thể rút từ hợp đồng: ${totalWithdrawableFromContracts.toLocaleString()} đ`);
    console.log(`💸 Đã rút: ${totalAlreadyWithdrawn.toLocaleString()} đ`);
    console.log(`✅ Còn lại có thể rút: ${totalWithdrawable.toLocaleString()} đ`);
    console.log(`📤 Số tiền yêu cầu rút: ${requestedInt.toLocaleString()} đ`);

    if (requestedInt > totalWithdrawable) {
      return res.status(400).json({
        message: `❌ Số tiền vượt quá giới hạn rút (${totalWithdrawable.toLocaleString()} đ)`,
      });
    }

    // 👉 Lưu yêu cầu rút tiền
    const request = new WithdrawRequest({
      user: objectUserId,
      accountHolder,
      bankNumber,
      bankName,
      amount: requestedInt,
    });

    await request.save();
    console.log("✅ Yêu cầu rút tiền đã được lưu:", request._id);

    return res.status(201).json({
      message: "✅ Gửi yêu cầu rút tiền thành công",
      data: request,
    });

  } catch (err) {
    console.error("❌ Lỗi khi tạo yêu cầu rút tiền:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 🔍 GET /api/withdrawals/admin - Admin xem tất cả yêu cầu
export const getAllWithdrawRequests = async (req, res) => {
  try {
    const requests = await WithdrawRequest.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ message: "📃 Danh sách yêu cầu rút tiền", data: requests });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách yêu cầu rút tiền:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ✅ PUT /api/withdrawals/:id/approve - Duyệt yêu cầu
export const approveWithdrawRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 Tìm yêu cầu rút tiền theo ID
    const request = await WithdrawRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Yêu cầu đã được xử lý trước đó" });
    }

    const objectUserId = new mongoose.Types.ObjectId(request.user);

    // ✅ Lấy tất cả các hợp đồng đã thanh toán mà người dùng là landlord
    const contracts = await Contract.find({
      paymentStatus: "paid",
      landlordId: objectUserId,
    });

    const totalDeposits = contracts.reduce((sum, contract) => {
      const deposit = Number(contract.depositAmount || 0);
      return sum + deposit;
    }, 0);

    // ✅ Tính tổng số tiền đã rút (approved hoặc processing)
    const withdrawHistory = await WithdrawRequest.find({
      user: objectUserId,
      status: "approved", // ✅ chỉ tính lệnh đã duyệt
    });

    const totalAlreadyWithdrawn = withdrawHistory.reduce(
      (sum, w) => sum + Number(w.amount || 0),
      0
    );


    // ✅ Tính số tiền còn có thể rút
    const availableToWithdraw = totalDeposits - totalAlreadyWithdrawn;

    // 🛑 Kiểm tra nếu số tiền yêu cầu vượt quá số còn lại
    if (request.amount > availableToWithdraw) {
      return res.status(400).json({
        message: `❌ Số tiền yêu cầu (${request.amount.toLocaleString()} đ) vượt quá số dư khả dụng (${availableToWithdraw.toLocaleString()} đ)`,
      });
    }

    // ✅ Duyệt yêu cầu
    request.status = "approved";
    request.approvedAt = new Date();
    await request.save();

    // Gửi thông báo cho user
    try {
      // Giả sử bạn có Notification model và hàm gửi thông báo
      // Nếu chưa có, bạn có thể thay thế bằng logic phù hợp

      await Notification.create({
        userId: request.user, // Đúng với model Notification
        title: "Yêu cầu rút tiền đã được duyệt",
        message: "Yêu cầu rút tiền của bạn đã được duyệt. Vui lòng kiểm tra tài khoản ngân hàng.",
        data: {
          withdrawRequestId: request._id,
          amount: request.amount,
        },
      });
    } catch (notifyErr) {
      console.error("❌ Lỗi gửi thông báo duyệt rút tiền:", notifyErr);
      // Không trả lỗi cho client, chỉ log
    }

    return res.json({
      message: "✅ Đã duyệt yêu cầu rút tiền",
      data: request,
    });
  } catch (err) {
    console.error("❌ Lỗi khi duyệt yêu cầu:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};




// ❌ PUT /api/withdrawals/:id/reject - Từ chối yêu cầu
export const rejectWithdrawRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập lý do từ chối" });
    }

    const request = await WithdrawRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Yêu cầu đã được xử lý trước đó" });
    }

    request.status = "rejected";
    request.rejectedReason = reason;
    await request.save();

    return res.json({
      message: "❌ Đã từ chối yêu cầu rút tiền",
      data: request,
    });
  } catch (err) {
    console.error("❌ Lỗi khi từ chối yêu cầu:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// hàm rút tiền để tính giảm tiền
export const getAvailableWithdrawInfo = async (req, res) => {
  try {
    const landlordId = new mongoose.Types.ObjectId(req.user._id);

    // B1: Lấy các hợp đồng đã thanh toán của landlord
    const contracts = await Contract.find(
      { paymentStatus: "paid", landlordId },
      { withdrawableAmount: 1, depositAmount: 1 } // chỉ lấy field cần
    );

    // 👉 Tổng tiền CÓ THỂ RÚT = tổng withdrawableAmount (fallback về depositAmount nếu thiếu)
    const totalWithdrawableFromContracts = contracts.reduce((sum, c) => {
      const v = c.withdrawableAmount ?? c.depositAmount ?? 0;
      const n = Number(v);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);

    // B2: Tổng tiền đã yêu cầu rút (pending + approved) để chống rút trùng
    const withdrawRequests = await WithdrawRequest.find(
      { user: landlordId, status: { $in: ["pending", "approved"] } },
      { amount: 1 }
    );

    const withdrawnAmount = withdrawRequests.reduce((sum, r) => {
      const n = Number(r.amount || 0);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);

    // B3: Còn lại có thể rút
    const availableToWithdraw = Math.max(totalWithdrawableFromContracts - withdrawnAmount, 0);

    return res.json({
      totalWithdrawableFromContracts, // "Tổng tiền có thể rút"
      withdrawnAmount,                // "Đã rút" (đã yêu cầu)
      availableToWithdraw,            // "Còn lại"
    });
  } catch (err) {
    console.error("❌ Lỗi khi tính toán số tiền rút:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
