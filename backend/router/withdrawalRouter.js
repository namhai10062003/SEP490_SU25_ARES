import express from "express";
import { approveWithdrawRequest, createWithdrawRequest, getAllWithdrawRequests, rejectWithdrawRequest } from "../controllers/withdrawalController.js";
import verifysUser from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";
import WithdrawRequest from "../models/WithdrawRequest.js";
const router = express.Router();

// Người dùng gửi yêu cầu rút tiền
router.post("/", verifysUser, createWithdrawRequest);
// lịch sữ người dùng rút tiền 
router.get("/me",verifysUser, async (req, res) => {
    try {
      const requests = await WithdrawRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.json({ data: requests });
    } catch (err) {
      console.error("❌ Lỗi lấy lịch sử rút tiền:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  });
router.get("/admin", isAdmin, getAllWithdrawRequests);
router.put("/:id/approve", isAdmin, approveWithdrawRequest);
router.put("/:id/reject",  isAdmin, rejectWithdrawRequest);
export default router;
