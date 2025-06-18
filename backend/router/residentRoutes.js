import express from 'express';
import { createResident, getResidentsByApartment } from '../controllers/residentController.js';
import verifyUser from '../middleware/authMiddleware.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

// Tạo nhân khẩu mới (có upload ảnh CCCD, yêu cầu xác thực)
router.post('/create', verifyUser, uploadImage, createResident);

// Lấy danh sách nhân khẩu theo căn hộ (dựa vào apartmentId)
router.get('/by-apartment/:apartmentId', verifyUser, getResidentsByApartment);

// Có thể mở rộng: update, delete,...
// router.put('/:id', verifyUser, updateResident);
// router.delete('/:id', isStaff, deleteResident);

export default router;
