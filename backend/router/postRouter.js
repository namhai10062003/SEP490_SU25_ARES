import express from "express";
import { createPost, getPost, getPostActive, getPostbyUser, updatePost, updatePostStatusByAdmin } from "../controllers/postController.js";
import { upload } from "../db/cloudinary.js";
import verifyUser from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/create-post", verifyUser, upload.array("images"), createPost);
router.get("/get-post", verifyUser, getPost);
router.get("/get-post-active", verifyUser, getPostActive);
router.get("/get-postbyUser", verifyUser, getPostbyUser);
router.put("/update-posts/:id", updatePost);
router.put("/update-posts-statusbyAdmin/:id", verifyUser, updatePostStatusByAdmin);
export default router;