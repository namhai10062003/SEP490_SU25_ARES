import express from 'express';
import { countResidentsByApartment, createResident, getMyResidents, getResidentDetail, getResidentsByApartment, getResidentsUnverifiedByStaff, rejectResidentByStaff, verifyResidentByStaff } from '../controllers/residentController.js';
import verifyUser from '../middleware/authMiddleware.js';
import isStaff from '../middleware/isStaff.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

// Tạo nhân khẩu mới (có upload ảnh CCCD, yêu cầu xác thực)
router.post('/create', verifyUser, uploadImage, createResident);
//xem chi tiet nhan khau 
router.get('/:id', verifyUser, getResidentDetail);
// Lấy danh sách nhân khẩu theo căn hộ (dựa vào apartmentId)
router.get('/by-apartment/:apartmentId', verifyUser, getResidentsByApartment);
router.get('/me/residents', verifyUser, getMyResidents);
router.get('/count/:apartmentId', verifyUser, countResidentsByApartment);
//lấy danh sách nhân khẩu chưa đc xác minh
router.get('/residents/unverified', isStaff, getResidentsUnverifiedByStaff);
router.put("/verify-by-staff/:id", isStaff, verifyResidentByStaff);
router.put("/reject-by-staff/:id", isStaff, rejectResidentByStaff);
//lấy danh sách nhân khẩu chưa dc duyệt bởi admin 
// router.get('/residents/to-approve-by-admin', isAdmin, getResidentsForAdminApproval);
//duyệt của staff và admin
// router.put('/verify-by-staff/:id', isStaff, verifyResidentByStaff);
// router.put('/verify-by-admin/:id', isAdmin, verifyResidentByAdmin);
// Có thể mở rộng: update, delete,...
// router.put('/:id', verifyUser, updateResident);
// router.delete('/:id', isStaff, deleteResident);

export default router;
