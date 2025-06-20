import express from "express";
import { createPostPayment, handlePostPaymentWebhook } from "../controllers/postPaymentController.js";

const router = express.Router();

// Tạo thanh toán cho bài post
router.post("/create-payment/:postId", createPostPayment);

// Webhook từ PayOS
router.post("/webhook", handlePostPaymentWebhook);

export default router;
