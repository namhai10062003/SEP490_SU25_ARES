import mongoose from "mongoose";
import { decrypt } from "../db/encryption.js"; // nhớ import hàm decrypt
import ProfileUpdateRequest from "../models/ProfileUpdateRequest.js";
import User from "../models/User.js";

// Hàm giải mã an toàn
function safeDecrypt(value) {
  const isHex = /^[0-9a-fA-F]+$/.test(value);
  if (!value || !isHex) return value;
  try {
    return decrypt(value);
  } catch (err) {
    console.warn("⚠️ Không thể giải mã CCCD:", err.message);
    return value;
  }
}

// 📌 Lấy tất cả yêu cầu cập nhật
export const getAllProfileUpdateRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const requests = await ProfileUpdateRequest.find(filter).populate(
      "userId",
      "name email identityNumber address profileImage cccdFrontImage cccdBackImage"
    );

    // ✅ Giải mã
    requests.forEach(r => {
      if (r.userId?.identityNumber) {
        r.userId.identityNumber = safeDecrypt(r.userId.identityNumber);
      }
      if (r.newIdentityNumber) {
        r.newIdentityNumber = safeDecrypt(r.newIdentityNumber);
      }
    });

    res.status(200).json(requests);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách yêu cầu:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 📌 Lấy tất cả yêu cầu pending
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await ProfileUpdateRequest.find({ status: "pending" })
      .populate("userId", "name email identityNumber");

    // ✅ Giải mã
    requests.forEach(r => {
      if (r.userId?.identityNumber) {
        r.userId.identityNumber = safeDecrypt(r.userId.identityNumber);
      }
      if (r.newIdentityNumber) {
        r.newIdentityNumber = safeDecrypt(r.newIdentityNumber);
      }
    });

    res.status(200).json(requests);
  } catch (err) {
    console.error("❌ Lỗi lấy yêu cầu:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 📌 Admin duyệt yêu cầu
export const approveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await ProfileUpdateRequest.findById(requestId);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Yêu cầu không tồn tại hoặc đã xử lý" });
    }

    const updateData = {};
    if (request.newIdentityNumber) updateData.identityNumber = request.newIdentityNumber;
    if (request.newProfileImage) updateData.profileImage = request.newProfileImage;
    if (request.newCccdFrontImage) updateData.cccdFrontImage = request.newCccdFrontImage;
    if (request.newCccdBackImage) updateData.cccdBackImage = request.newCccdBackImage;

    await User.findByIdAndUpdate(request.userId, { $set: updateData });

    request.status = "approved";
    request.reviewedAt = new Date();
    await request.save();

    res.status(200).json({ message: "✅ Đã duyệt và cập nhật hồ sơ người dùng" });
  } catch (err) {
    console.error("❌ Lỗi duyệt yêu cầu:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 📌 Admin từ chối yêu cầu
export const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { reason } = req.body;

    const request = await ProfileUpdateRequest.findById(requestId);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Yêu cầu không tồn tại hoặc đã xử lý" });
    }

    request.status = "rejected";
    request.reviewedAt = new Date();
    request.rejectionReason = reason || "Không rõ lý do";
    await request.save();

    res.status(200).json({
      message: "❌ Đã từ chối yêu cầu cập nhật",
      rejectionReason: request.rejectionReason
    });
  } catch (err) {
    console.error("❌ Lỗi từ chối yêu cầu:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 📌 Lấy yêu cầu mới nhất của user
export const getLatestRequestByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "userId không hợp lệ" });
    }

    const request = await ProfileUpdateRequest.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (request.length > 0 && request[0].newIdentityNumber) {
      request[0].newIdentityNumber = safeDecrypt(request[0].newIdentityNumber);
    }

    res.status(200).json(request);
  } catch (err) {
    console.error("❌ Lỗi khi lấy yêu cầu:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
