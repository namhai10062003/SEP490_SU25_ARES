import express from "express";
import { createPost, deletePost, deletePostByAdmin, getApprovedPosts, getPost, getPostApproved, getPostDetail, getPostDetailForAdmin, getPostForGuest, getPostHistories, getPostStats, getPostbyUser, rejectPostByAdmin, startEditingPost, updatePost, updatePostStatusByAdmin, verifyPostByAdmin } from "../controllers/postController.js";
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
router.get("/posts/:id/history", verifyUser, getPostHistories);

// get post by user
router.put("/:id/start-editing", verifyUser, startEditingPost);
router.get("/get-postbyUser", verifyUser, getPostbyUser);
router.put("/update-posts/:id", verifyUser ,updatePost);
router.delete("/delete-posts/:id", deletePost);
router.put("/update-posts-statusbyAdmin/:id", verifyUser, updatePostStatusByAdmin);
router.get('/stats', getPostStats);
export default router;