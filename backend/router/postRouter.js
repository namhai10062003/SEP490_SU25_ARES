import express from "express";
import { createPost, getPost } from "../controllers/postController.js";
import verifyUser from "../middleware/authMiddleware.js";
import { upload } from "../db/cloudinary.js";
const router = express.Router();

router.post("/create-post", verifyUser, upload.array("images"), createPost);
router.get("/get-post", verifyUser, getPost);

export default router;