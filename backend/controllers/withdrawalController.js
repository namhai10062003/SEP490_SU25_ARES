import mongoose from "mongoose";
import Contract from "../models/Contract.js";
import WithdrawRequest from "../models/WithdrawRequest.js";

export const createWithdrawRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const { accountHolder, bankNumber, bankName, amount } = req.body;

    if (!accountHolder || !bankNumber || !bankName || !amount) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Số tiền rút không hợp lệ" });
    }

    // ✅ CHỈ lấy hợp đồng mà người dùng là landlord (chủ cho thuê)
    const contracts = await Contract.find({
      paymentStatus: "paid",
      landlordId: objectUserId,
    });

    console.log("✅ USER ID:", userId);
    console.log("📦 Danh sách hợp đồng tìm được:", contracts.length);

    if (contracts.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy hợp đồng hợp lệ" });
    }

    // ✅ Tính tổng tiền có thể rút (dựa vào withdrawableAmount)
    let totalAvailable = 0;
    contracts.forEach((c) => {
      let withdrawable = Number(c.withdrawableAmount);
      if (isNaN(withdrawable) || withdrawable < 10) withdrawable = 0;
      totalAvailable += withdrawable;

      console.log(`🧾 HĐ ${c._id} | Căn: ${c.apartmentCode} | Có thể rút: ${withdrawable}`);
    });

    totalAvailable = Number(totalAvailable.toFixed(2));
    console.log("💰 Tổng tiền có thể rút:", totalAvailable.toLocaleString());

    const EPSILON = 0.01;
    if (numericAmount - totalAvailable > EPSILON) {
      return res.status(400).json({
        message: `❌ Số tiền vượt quá giới hạn rút (${totalAvailable.toLocaleString()} đ)`,
      });
    }

    // ✅ Tạo yêu cầu rút tiền
    const request = new WithdrawRequest({
      user: objectUserId,
      accountHolder,
      bankNumber,
      bankName,
      amount: numericAmount,
    });

    await request.save();

    return res.status(201).json({
      message: "✅ Gửi yêu cầu rút tiền thành công",
      data: request,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo yêu cầu rút tiền:", err);
    res.status(500).json({ message: "Lỗi server" });
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

    // ✅ Tìm yêu cầu rút
    const request = await WithdrawRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Yêu cầu đã được xử lý trước đó" });
    }

    const objectUserId = new mongoose.Types.ObjectId(request.user);

    // ✅ Chỉ lấy các hợp đồng mà user là landlord
    const contracts = await Contract.find({
      paymentStatus: "paid",
      landlordId: objectUserId,
    }).sort({ createdAt: 1 }); // Ưu tiên hợp đồng cũ trừ trước

    let remaining = request.amount;

    for (const contract of contracts) {
      let available = Number(contract.withdrawableAmount) || 0;
      if (available <= 0) continue;

      const deduction = Math.min(remaining, available);
      contract.withdrawableAmount = available - deduction;

      if (contract.withdrawableAmount < 10) {
        contract.withdrawableAmount = 0;
      }

      remaining -= deduction;
      await contract.save();

      if (remaining <= 0) break;
    }

    // ✅ Cập nhật trạng thái yêu cầu
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
