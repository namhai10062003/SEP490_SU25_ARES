import mongoose from "mongoose";

const ProfileUpdateRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  newIdentityNumber: { type: String },
  newProfileImage: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
});

export default mongoose.model("ProfileUpdateRequest", ProfileUpdateRequestSchema);