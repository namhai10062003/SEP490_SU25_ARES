import express from "express";
import { aiChat, getAiChatHistory } from "../controllers/aiChatController.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
const router = express.Router();

// POST /api/ai/chat
router.post("/chat", optionalAuth,aiChat);
// Lấy toàn bộ lịch sử chat của user
router.get("/history", optionalAuth, getAiChatHistory);
export default router;
