import Like from "../models/Like.js";

export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const existing = await Like.findOne({ post: postId, user: userId });

    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, liked: false });
    }

    await Like.create({ post: postId, user: userId });
    res.json({ success: true, liked: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Like thất bại", error: err.message });
  }
};

export const checkIfLiked = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const like = await Like.findOne({ post: postId, user: userId });

    res.json({ success: true, liked: !!like });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi kiểm tra like", error: err.message });
  }
};