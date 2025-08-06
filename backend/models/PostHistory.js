import mongoose from "mongoose";

const postHistorySchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    editedData: { type: Object, required: true },
    editedAt: { type: Date, default: Date.now },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const PostHistory = mongoose.model("PostHistory", postHistorySchema);

export default PostHistory;
