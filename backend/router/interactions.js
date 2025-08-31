import express from "express";
import { createComment, getCommentsByPost } from "../controllers/commentController.js";
import { checkIfLiked, getLikedPostsByUser, toggleLike } from "../controllers/likeController.js";
import {
  createReport,
  getReports,
  updateReportStatus,
} from "../controllers/reportController.js";
import verifysUser from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import Like from "../models/Like.js";
const router = express.Router();

router.post("/likes/:postId", optionalAuth, toggleLike);
router.get("/likes/:postId", optionalAuth, checkIfLiked);
router.get("/my-liked-posts", verifysUser, getLikedPostsByUser);
router.get("/:postId/count", async (req, res) => {
    try {
      const count = await Like.countDocuments({ post: req.params.postId });
      res.json({ success: true, count });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi khi đếm like" });
    }
  });
router
  .route("/comments/:postId")
  .get(getCommentsByPost)          // ai cũng xem được, không cần token
  .post(verifysUser, createComment);
router.post("/reports/:postId", optionalAuth, createReport);
// xem tat ca bai bao cao va duyejt nó của bên admin 
// admin xem tất cả báo cáo
router.get("/reports", isAdmin, getReports);

// admin cập nhật trạng thái
router.patch("/reportsbyadmin/:id", isAdmin, updateReportStatus);
export default router;
