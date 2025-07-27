import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { getIO } from "../socket.js";

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    if (!content || !postId) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
    }

    // 1. Tạo bình luận
    const comment = await Comment.create({
      post: postId,
      user: userId,
      content,
    });

    // 2. Tìm chủ bài viết
    const post = await Post.findById(postId).populate("contactInfo");
    const postOwner = post?.contactInfo;

    // 3. Nếu không phải tự mình comment vào bài mình
    if (post && postOwner && postOwner._id.toString() !== userId.toString()) {
      const message = `Bạn có bình luận mới từ ${req.user.name} trên bài viết của bạn.`;

      // 4. Lưu vào DB
      const newNotification = await Notification.create({
        userId: postOwner._id,
        message,
      });

      // 5. Gửi realtime nếu người đó đang online
      const io = getIO();
      const target = [...io.sockets.sockets.values()].find(
        (s) => s.userId === postOwner._id.toString()
      );

      if (target) {
        target.emit("newNotification", {
          _id: newNotification._id,
          message,
          createdAt: newNotification.createdAt,
          type: "comment",
          post: postId,
        });
      }
    }

    // 6. Trả kết quả về client
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