import express from "express";
import { approveRefund, createRefund, getAllRefunds, rejectRefund } from "../controllers/refundController.js";
import isAdmin from "../middleware/isAdmin.js";
import isStaff from "../middleware/isStaff.js";
const router = express.Router();

// Staff tạo yêu cầu hoàn tiền
router.post("/", isStaff, createRefund);
// Staff xem tất cả request
router.get("/", getAllRefunds);

// Staff duyệt / từ chối
router.put("/:id/approve",isAdmin, approveRefund);
router.put("/:id/reject", isAdmin, rejectRefund);
export default router;
