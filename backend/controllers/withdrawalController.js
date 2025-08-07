import mongoose from "mongoose";
import Contract from "../models/Contract.js";
import WithdrawRequest from "../models/WithdrawRequest.js";

export const createWithdrawRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const { accountHolder, bankNumber, bankName, amount } = req.body;
    console.log("📥 Yêu cầu rút tiền từ user:", userId);
    console.log("📦 Thông tin nhận:", { accountHolder, bankNumber, bankName, amount });

    if (!accountHolder || !bankNumber || !bankName || !amount) {
      console.log("❌ Thiếu thông tin gửi yêu cầu");
      return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log("❌ Số tiền không hợp lệ:", amount);
      return res.status(400).json({ message: "Số tiền rút không hợp lệ" });
    }

    // 👉 Tìm các hợp đồng đã thanh toán
    const contracts = await Contract.find({
      paymentStatus: "paid",
      landlordId: objectUserId,
    });

    console.log(`🔍 Tìm thấy ${contracts.length} hợp đồng đã thanh toán`);

    if (!contracts.length) {
      console.log("❌ Không có hợp đồng đủ điều kiện");
      return res.status(400).json({ message: "Không tìm thấy hợp đồng hợp lệ" });
    }

    // 👉 Tính tổng tiền cọc từ hợp đồng
    const totalDeposits = contracts.reduce(
      (sum, contract) => sum + Number(contract.depositAmount || 0),
      0
    );

    // 👉 Tìm các lệnh rút tiền trước đó
    const withdrawHistory = await WithdrawRequest.find({
      user: objectUserId,
      status: { $ne: "rejected" }, // bỏ các yêu cầu bị từ chối
    });

    const totalAlreadyWithdrawn = withdrawHistory.reduce(
      (sum, w) => sum + Number(w.amount || 0),
      0
    );

    // 👉 Tính số tiền có thể rút hiện tại
    const totalWithdrawable = Math.max(Math.floor(totalDeposits - totalAlreadyWithdrawn), 0);
    const requestedInt = Math.floor(numericAmount);

    console.log(`💰 Tổng tiền cọc: ${totalDeposits.toLocaleString()} đ`);
    console.log(`💸 Đã rút: ${totalAlreadyWithdrawn.toLocaleString()} đ`);
    console.log(`✅ Còn lại có thể rút: ${totalWithdrawable.toLocaleString()} đ`);
    console.log(`📤 Số tiền yêu cầu rút: ${requestedInt.toLocaleString()} đ`);

    if (requestedInt > totalWithdrawable) {
      console.log("❌ Số tiền yêu cầu vượt quá giới hạn");
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
    const userId = req.user._id;

    const objectUserId = new mongoose.Types.ObjectId(userId);

    // ✅ B1: Lấy tất cả hợp đồng đã thanh toán của landlord
    const contracts = await Contract.find({
      paymentStatus: "paid",
      landlordId: objectUserId,
    });

    const totalDeposits = contracts.reduce((sum, contract) => {
      return sum + Number(contract.depositAmount || 0);
    }, 0);

    // ✅ B2: Lấy tổng số tiền đã yêu cầu rút (pending và approved)
    const withdrawRequests = await WithdrawRequest.find({
      user: objectUserId,
      status: { $in: ["pending", "approved"] },
    });

    const withdrawnAmount = withdrawRequests.reduce((sum, req) => {
      return sum + Number(req.amount || 0);
    }, 0);

    // ✅ B3: Tính số tiền có thể rút
    const availableToWithdraw = Math.max(totalDeposits - withdrawnAmount, 0);

    return res.json({
      totalDeposits,
      withdrawnAmount,
      availableToWithdraw,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tính toán số tiền rút:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};