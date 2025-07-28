import Like from "../models/Like.js";
import Notification from "../models/Notification.js";
import Post from "../models/Post.js";
import { emitNotification } from "../helpers/socketHelper.js";
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
    const userId = req.user._id;

    const existing = await Like.findOne({ post: postId, user: userId });

    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, liked: false });
    }
    await Like.create({
      post: postId,
      user: userId,
    });
    const post = await Post.findById(postId).populate('contactInfo');
    const postOwnerId = post?.contactInfo?._id;
    const newNotification = await Notification.create({
      userId: postOwnerId,
      message: `Bài đăng ${postId} của bạn đã được thích 👍.`
    });

    emitNotification(postOwnerId, newNotification);
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