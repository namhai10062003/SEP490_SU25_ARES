import mongoose from "mongoose";
import ProfileUpdateRequest from "../models/ProfileUpdateRequest.js";
import User from "../models/User.js";
// hàm lấy ra tất cả các request 
export const getAllProfileUpdateRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const requests = await ProfileUpdateRequest.find(filter).populate("userId", "name email");

    res.status(200).json(requests);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách yêu cầu:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
/**
 * GET all pending profile update requests (Admin)
 */
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await ProfileUpdateRequest.find({ status: "pending" }).populate("userId", "name email");
    res.status(200).json(requests);
  } catch (err) {
    console.error("❌ Lỗi lấy yêu cầu:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * APPROVE a request (Admin)
 */
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

/**
 * REJECT a request (Admin)
 */
export const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { reason } = req.body; // ✅ Nhận lý do từ client gửi lên

    const request = await ProfileUpdateRequest.findById(requestId);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Yêu cầu không tồn tại hoặc đã xử lý" });
    }

    request.status = "rejected";
    request.reviewedAt = new Date();
    request.rejectionReason = reason || "Không rõ lý do"; // ✅ Ghi lại lý do
    await request.save();

    res.status(200).json({ message: "❌ Đã từ chối yêu cầu cập nhật", rejectionReason: request.rejectionReason });
  } catch (err) {
    console.error("❌ Lỗi từ chối yêu cầu:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// 🔍 Lấy các yêu cầu cập nhật của chính user

export const getLatestRequestByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "userId không hợp lệ" });
    }

    const request = await ProfileUpdateRequest.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 }) // lấy bản mới nhất
      .limit(1);

    res.status(200).json(request);
  } catch (err) {
    console.error("❌ Lỗi khi lấy yêu cầu:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};