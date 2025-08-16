import express from "express";
import { getPaymentHistory } from "../controllers/paymentHistoryController.js";
import verifysUser from "../middleware/authMiddleware.js";
const router = express.Router();

// Lấy lịch sử thanh toán theo userId
router.get("/history/:userId", verifysUser,getPaymentHistory);

export default router;
