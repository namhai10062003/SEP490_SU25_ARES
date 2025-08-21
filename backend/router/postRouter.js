import express from "express";
import { getAllPostsNearlyExpire, createPost, deletePost, deletePostByAdmin, getAllPosts, getApprovedPosts, getPost, getPostApproved, getPostDetail, getPostDetailForAdmin, getPostForGuest, getPostHistories, getPostStats, getPostbyUser, rejectPostByAdmin, startEditingPost, updatePost, updatePostStatusByAdmin, verifyPostByAdmin, countPostsByUser } from "../controllers/postController.js";
import { upload } from "../db/cloudinary.js";
import verifyUser from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import Post from "../models/Post.js";
const router = express.Router();

router.post("/create-post", verifyUser, upload.array("images"), createPost);
router.get("/get-post", verifyUser, getPost);
router.get("/get-all-posts", verifyUser, getAllPosts);
router.get("/get-post-active", optionalAuth, getPostApproved);
router.get("/active", verifyUser, getApprovedPosts);
router.get("/guest/get-post", optionalAuth, getPostForGuest); // 👈 KHÔNG verifyUser
router.get('/get-nearly-expire-post', verifyUser, getAllPostsNearlyExpire);

//post detail s
router.get("/postdetail/:id", optionalAuth, getPostDetail);
router.get("/admin/postdetail/:id", verifyUser, getPostDetailForAdmin);
router.put("/verify-post/:id", verifyUser, verifyPostByAdmin);
router.put("/reject-post/:id", verifyUser, rejectPostByAdmin);
router.put("/delete-post/:id", verifyUser, deletePostByAdmin);
router.get("/posts/:id/history", isAdmin, getPostHistories);

// get post by user
router.put("/:id/start-editing", verifyUser, startEditingPost);
router.get("/get-postbyUser", verifyUser, getPostbyUser);
router.put("/update-posts/:id", verifyUser, upload.array("images"), updatePost);
router.delete("/delete-posts/:id", deletePost);
router.put("/update-posts-statusbyAdmin/:id", verifyUser, updatePostStatusByAdmin);
router.get('/stats', getPostStats);
router.get("/count/:userId", countPostsByUser);
// routes/postRoutes.js
// DELETE /:postId/images
// routes/postRouter.js
router.delete("/:postId/images", async (req, res) => {
  const { postId } = req.params;
  const { imageUrl } = req.body;

  try {
    if (!postId) {
      return res.status(400).json({ message: "Thiếu postId" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Xóa ảnh
    post.images = post.images.filter((img) => img !== imageUrl);

    await post.save();
    res.json({ message: "Xóa ảnh thành công", images: post.images });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});



export default router;