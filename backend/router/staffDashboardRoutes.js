import express from 'express';
import { countByStatusForStaff, countFeesForStaff, countResidentVerificationByStatus, countVerifiedAndRejectedResidents, getMonthlyRevenue } from '../controllers/staffDashboardController.js';
// (Tuỳ chọn) import middleware kiểm tra quyền staff nếu có
import isStaff from '../middleware/isStaff.js';

const router = express.Router();

// ✅ Đường dẫn chỉ staff mới được truy cập
router.get('/staff/statistics', isStaff, countByStatusForStaff);

// Thống kê số lượng fee
router.get('/staff/fees/paid', isStaff,countFeesForStaff); 
// thống kê số lượng nhân khẩu
router.get('/staff/residents/status', isStaff ,countVerifiedAndRejectedResidents);
// thống kê xác nhận cư dân
router.get("/staff/count-by-status", isStaff,countResidentVerificationByStatus);
router.get('/staff/revenue/monthly', isStaff,getMonthlyRevenue);
export default router;
