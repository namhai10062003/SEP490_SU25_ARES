import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ✅ Cho phép nhập lý do tự do
    reason: {
      type: String,
      required: true,
      trim: true, // loại bỏ khoảng trắng đầu/cuối nếu có
    },

    // Giữ nguyên
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "reviewed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// ✅ Giữ nguyên chỉ số để tránh duplicate
reportSchema.index({ post: 1, user: 1, reason: 1 }, { unique: true });

export default mongoose.model("Report", reportSchema);
