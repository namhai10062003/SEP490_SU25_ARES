import mongoose from "mongoose";

const ProfileUpdateRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  newIdentityNumber: { type: String },         // CCCD mới
  newProfileImage: { type: String },           // Ảnh đại diện mới
  newCccdFrontImage: { type: String },         // Ảnh CCCD mặt trước mới
  newCccdBackImage: { type: String },          // Ảnh CCCD mặt sau mới

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason: { type: String },
  reviewedAt: { type: Date },
}, {
  timestamps: true  // ✅ Dòng này để Mongoose tự thêm `createdAt` và `updatedAt`
});

export default mongoose.model("ProfileUpdateRequest", ProfileUpdateRequestSchema);
