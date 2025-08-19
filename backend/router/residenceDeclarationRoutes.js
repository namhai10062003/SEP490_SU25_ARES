import express from 'express';
import {
    createDeclaration,
    getDeclarationDetail,
    getDeclarationsByStatus,
    getMyDeclarations,
    getUnverifiedDeclarations,
    notifyUser,
    rejectDeclarationByStaff,
    removeDeclarationImage,
    updateDeclaration,
    verifyDeclarationByStaff
} from '../controllers/residenceDeclarationController.js';

import verifyUser from '../middleware/authMiddleware.js';
import isStaff from '../middleware/isStaff.js';
import { uploadResidenceDocument } from '../middleware/uploadResidenceDoc.js';

const router = express.Router();

/**
 * 📌 Tạo mới hồ sơ tạm trú/tạm vắng
 * - Người dùng cần đăng nhập
 * - Upload 1 ảnh giấy tờ
 */
router.post('/create', verifyUser, uploadResidenceDocument, createDeclaration);
// Lấy danh sách hồ sơ của chính user
router.get('/my-declarations', verifyUser, getMyDeclarations);
// update tạm trú tạm vắng 
router.put('/:id', verifyUser, uploadResidenceDocument, updateDeclaration);
//hàm remove ảnh
// 🔹 Xóa ảnh ngay lập tức
router.delete("/:id/remove-image", uploadResidenceDocument,removeDeclarationImage);
/**
 * 📌 Lấy danh sách theo trạng thái (pending, verified, rejected)
 * - Staff mới có quyền xem tất cả
 */
router.get('/', isStaff, getDeclarationsByStatus);

/**
 * 📌 Lấy danh sách chưa xác minh
 * - Staff mới có quyền
 */
router.get('/unverified', isStaff, getUnverifiedDeclarations);

/**
 * 📌 Lấy chi tiết hồ sơ
 * - Cần đăng nhập
 */
router.get('/:id', verifyUser, getDeclarationDetail);

/**
 * 📌 Duyệt hồ sơ (staff)
 */
router.put('/verify-by-staff/:id', isStaff, verifyDeclarationByStaff);

/**
 * 📌 Từ chối hồ sơ (staff)
 */
router.put('/reject-by-staff/:id', isStaff, rejectDeclarationByStaff);
// hàm thông báo 
router.post("/notify-user/:id", verifyUser, isStaff, notifyUser);
export default router;
