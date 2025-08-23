import express from "express";
import { countPostsByUser, createPost, deletePost, deletePostByAdmin, deletePostImage, getAllPosts, getAllPostsNearlyExpire, getApprovedPosts, getPost, getPostApproved, getPostDetail, getPostDetailForAdmin, getPostForGuest, getPostHistories, getPostStats, getPostbyUser, rejectPostByAdmin, startEditingPost, updatePost, updatePostStatusByAdmin, verifyPostByAdmin } from "../controllers/postController.js";
import { upload } from "../db/cloudinary.js";
import verifyUser from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
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
// DELETE /api/posts/:postId/images
router.delete("/:postId/images", verifyUser, deletePostImage);



export default router;