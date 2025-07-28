import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { emitNotification } from "../helpers/socketHelper.js";
import User from "../models/User.js";

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    if (!content || !postId) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
    }

    const comment = await Comment.create({
      post: postId,
      user: userId,
      content,
    });

    const post = await Post.findById(postId).populate("contactInfo");
    const postOwner = post?.contactInfo;
    // Gửi thông báo đến người sở hữu bài đăng, // nếu người bình luận không phải là chủ bài đăng
    if (post && postOwner && postOwner._id.toString() !== userId.toString()) {
      const message = `Bạn có bình luận mới từ ${req.user.name} trên bài đăng ${postId} của bạn.`;

      const newNotification = await Notification.create({
        userId: postOwner._id,
        message,
      });
      // Gửi thông báo qua socket
      emitNotification(postOwner._id, newNotification);
    }
    // Gửi thông báo đến người nào đã bình luận trên bài post nếu có bình luận mới
    const previousCommenters = await Comment.find({
      post: postId,
      user: { $nin: [userId, postOwner?._id] },  // exclude người đang comment và chủ bài đăng hiện tại
    }).distinct("user"); // Lấy danh sách userId duy nhất đã từng comment

    // Lặp qua từng user và gửi thông báo
    for (const commenterId of previousCommenters) {
      const message = `Bài đăng ${postId} vừa có bình luận mới.`;
      const notification = await Notification.create({
        userId: commenterId,
        message
      });
      emitNotification(commenterId, notification);
    }

    res.json({ success: true, data: comment });
  } catch (err) {
    console.error("❌ Lỗi tạo bình luận:", err);
    res.status(500).json({
      success: false,
      message: "Bình luận thất bại",
      error: err.message,
    });
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