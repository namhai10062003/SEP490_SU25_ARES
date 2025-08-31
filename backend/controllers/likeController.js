import { emitNotification } from "../helpers/socketHelper.js";
import Like from "../models/Like.js";
import Notification from "../models/Notification.js";
import Post from "../models/Post.js";
// danh sach bài post đã like 

export const getLikedPostsByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm tất cả like của user, populate bài đăng và gói bài đăng
    const likes = await Like.find({ user: userId }).populate({
      path: "post",
      populate: { path: "postPackage" },
    });

    const currentDate = new Date();

    // Lọc bài đăng còn tồn tại và chưa hết hạn theo expiredDate
    const likedPosts = likes
      .map((like) => like.post)
      .filter(
        (post) =>
          post !== null &&
          (!post.expiredDate || new Date(post.expiredDate) > currentDate)
      );

    res.status(200).json({ success: true, data: likedPosts });
  } catch (err) {
    console.error("Lỗi khi lấy liked posts:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};



export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;

    // Guest thì chặn
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "⚠️ Vui lòng đăng nhập để like bài viết",
      });
    }

    const userId = req.user._id;

    // Tìm xem đã like chưa
    const existing = await Like.findOne({ post: postId, user: userId });

    if (existing) {
      // Nếu đã like thì bỏ like
      await existing.deleteOne();

      // Đếm lại tổng số like
      const likeCount = await Like.countDocuments({ post: postId });

      return res.json({
        success: true,
        liked: false,
        likeCount,
        message: "Đã bỏ like",
      });
    }

    // Nếu chưa like thì thêm mới
    await Like.create({ post: postId, user: userId });

    // Đếm lại tổng số like
    const likeCount = await Like.countDocuments({ post: postId });

    // Tìm chủ bài viết để tạo thông báo
    const post = await Post.findById(postId).populate("contactInfo");
    const postOwnerId = post?.contactInfo?._id;

    if (postOwnerId) {
      const newNotification = await Notification.create({
        userId: postOwnerId,
        message: `Bài đăng "${post.title}" của bạn đã được thích 👍.`,
      });

      emitNotification(postOwnerId, newNotification);
    }

    res.json({
      success: true,
      liked: true,
      likeCount,
      message: "Đã like bài viết",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Like thất bại",
      error: err.message,
    });
  }
};



export const checkIfLiked = async (req, res) => {
  try {
    const { postId } = req.params;

    // Nếu chưa login (guest)
    if (!req.user) {
      return res.json({ success: true, liked: false });
    }

    const userId = req.user._id;

    const like = await Like.findOne({ post: postId, user: userId });

    res.json({ success: true, liked: !!like });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra like",
      error: err.message
    });
  }
};
