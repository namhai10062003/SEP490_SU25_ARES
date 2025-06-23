// models/Like.js
import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Chỉ cho 1 user like 1 bài
likeSchema.index({ post: 1, user: 1 }, { unique: true });

export default mongoose.model("Like", likeSchema);
