import express from 'express';
import {
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    changeStaffStatus,
    deleteStaff
} from '../controllers/staffController.js';

const router = express.Router();

// Lấy tất cả staff
router.get('/', getAllStaff);

// Lấy 1 staff theo ID
router.get('/:id', getStaffById);

// Tạo staff mới
router.post('/', createStaff);

// Cập nhật staff
router.put('/:id', updateStaff);

// Đổi trạng thái staff (active/block)
router.patch('/:id/status', changeStaffStatus);

// Xóa staff
router.delete('/:id', deleteStaff);

export default router;