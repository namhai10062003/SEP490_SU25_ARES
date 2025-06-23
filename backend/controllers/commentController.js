import Comment from "../models/Comment.js";

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    const comment = await Comment.create({ post: postId, user: userId, content });
    res.json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Bình luận thất bại", error: err.message });
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("user", "name")        // lấy tên người bình luận
      .sort({ createdAt: -1 });        // mới nhất trước

    res.json({ success: true, data: comments });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lấy bình luận thất bại", error: err.message });
  }
};