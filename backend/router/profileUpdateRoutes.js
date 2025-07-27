import express from "express";
import {
    approveRequest,
    getAllProfileUpdateRequests,
    getLatestRequestByUser,
    getPendingRequests,
    rejectRequest
} from "../controllers/profileUpdateController.js";

const router = express.Router();
// Middleware kiểm tra quyền admin (nếu có)
import verifysUser from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";
// lấy tất cả các reqeust ra 
router.get("/profile-update/requests", isAdmin,getAllProfileUpdateRequests);
// Lấy tất cả yêu cầu chờ duyệt0
router.get("/requests", isAdmin, getPendingRequests);

// Duyệt yêu cầu
router.put("/requests/:id/approve", isAdmin, approveRequest);

// Từ chối yêu cầu
router.put("/requests/:id/reject", isAdmin, rejectRequest);
// 📌 Route để user lấy danh sách yêu cầu của chính họ
router.get("/profile-update-requests", verifysUser,getLatestRequestByUser);
export default router;
