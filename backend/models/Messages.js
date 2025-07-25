import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },

    // 🆕 loại tin nhắn: text, post, image...
    type: { type: String, default: "text" },

    // 🆕 nếu là loại post thì lưu thông tin bài post ở đây
    post: {
      postId: { type: String },
      title: { type: String },
      thumbnail: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
