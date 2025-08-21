import express from 'express';
import {
    changeStaffStatus,
    createStaff,
    deleteStaff,
    getAllStaff,
    getStaffById,
    updateStaff
} from '../controllers/staffController.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

// Lấy tất cả staff
router.get('/', isAdmin,getAllStaff);

// Lấy 1 staff theo ID
router.get('/:id', isAdmin,getStaffById);

// Tạo staff mới
router.post('/', isAdmin,createStaff);

// Cập nhật staff
router.put('/:id', isAdmin,updateStaff);

// Đổi trạng thái staff (active/block)
router.patch('/:id',isAdmin ,changeStaffStatus);

// Xóa staff
router.delete('/:id', isAdmin,deleteStaff);

export default router;