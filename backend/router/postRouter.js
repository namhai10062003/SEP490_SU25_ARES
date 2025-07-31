import express from "express";
import { createPost, deletePost, deletePostByAdmin, getApprovedPosts, getPost, getPostApproved, getPostDetail, getPostDetailForAdmin, getPostForGuest, getPostStats, getPostbyUser, rejectPostByAdmin, updatePost, updatePostStatusByAdmin, verifyPostByAdmin } from "../controllers/postController.js";
import { upload } from "../db/cloudinary.js";
import verifyUser from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/create-post", verifyUser, upload.array("images"), createPost);
router.get("/get-post", verifyUser, getPost);
router.get("/get-post-active", verifyUser, getPostApproved);
router.get("/active", verifyUser, getApprovedPosts);
router.get("/guest/get-post", getPostForGuest); // 👈 KHÔNG verifyUser
//post detail s
router.get("/postdetail/:id", verifyUser, getPostDetail);
router.get("/admin/postdetail/:id", verifyUser, getPostDetailForAdmin);
router.put("/verify-post/:id", verifyUser, verifyPostByAdmin);
router.put("/reject-post/:id", verifyUser, rejectPostByAdmin);
router.put("/delete-post/:id", verifyUser, deletePostByAdmin);

// get post by user
router.get("/get-postbyUser", verifyUser, getPostbyUser);
router.put("/update-posts/:id", updatePost);
router.delete("/delete-posts/:id", deletePost);
router.put("/update-posts-statusbyAdmin/:id", verifyUser, updatePostStatusByAdmin);
router.get('/stats', getPostStats);
export default router;