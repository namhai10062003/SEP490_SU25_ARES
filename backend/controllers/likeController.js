import Like from "../models/Like.js";
// danh sach bài post đã like 

export const getLikedPostsByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm tất cả bài user đã like và populate thông tin bài post + gói bài viết
    const likes = await Like.find({ user: userId }).populate({
      path: "post",
      populate: { path: "postPackage" },
    });

    // Lấy ra các bài post từ danh sách like
    const likedPosts = likes
      .map((like) => like.post)
      .filter((post) => post != null); // loại bỏ nếu bài post đã bị xóa

    res.status(200).json({ success: true, data: likedPosts });
  } catch (err) {
    console.error("Lỗi khi lấy liked posts:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

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