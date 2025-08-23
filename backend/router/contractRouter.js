import express from "express";
import {
  adminGetAllContracts,
  approveContract,
  cancelContract,
  checkPostHasPaidContract,
  createContract,
  deleteContract,
  getAllPaidContracts,
  getContractById,
  getContractByPost,
  getContractsByLandlord,
  getContractsByUser,
  getMyContracts,
  handleSignatureUpload,
  rejectContract,
  resubmitContract,
  updateWithdrawableForAll
} from "../controllers/contractController.js";
import {
  cancelPayment,
  createContractPayment,
  handleContractPaymentWebhook
} from "../controllers/contractPaymentController.js";
import verifysUser from "../middleware/authMiddleware.js";
import { uploadSignature } from "../middleware/uploadSignature.js";

const router = express.Router();

/**
 * ========================
 * 🔹 ROUTES THANH TOÁN
 * ========================
 */
// Tạo link thanh toán
router.put("/:contractId/pay", createContractPayment);

// Nhận webhook từ PayOS
router.post("/payment-webhook", handleContractPaymentWebhook);

// Hủy thanh toán
router.get("/cancel-payment/:orderCode", cancelPayment);

/**
 * ========================
 * 🔹 ROUTES HỢP ĐỒNG
 * ========================
 */
// Tạo hợp đồng
router.post("/", verifysUser, createContract);

// Lấy hợp đồng của user hiện tại
router.get("/me", verifysUser, getMyContracts);

// Lấy tất cả hợp đồng đã thanh toán
router.get("/paid", getAllPaidContracts);

// Lấy hợp đồng của landlord

// GET /api/contracts/landlord
router.get("/landlord", verifysUser, getContractsByLandlord);

// Kiểm tra bài post đã có hợp đồng thanh toán chưa
router.get("/posts/:postId/has-paid-contract", checkPostHasPaidContract);

// Lấy hợp đồng theo userId (staff hoặc admin)

// GET /api/contracts/user/:userId
router.get("/user/:userId", getContractsByUser);

/**
 * ========================
 * 🔹 ACTIONS HỢP ĐỒNG
 * ========================
 */
router.put("/:id/approve", verifysUser, approveContract);
router.put("/:id/reject", verifysUser, rejectContract);
router.put("/:id/resubmit", verifysUser, resubmitContract);
router.delete("/:id", verifysUser, deleteContract);


// PATCH /api/contracts/cancel/:id
router.patch("/cancel/:id", cancelContract);

// Cập nhật rút tiền
router.put("/update-withdrawable", verifysUser, updateWithdrawableForAll);

// Upload chữ ký
router.post("/upload-signature", uploadSignature, handleSignatureUpload);

// Admin lấy tất cả hợp đồng
router.get("/", verifysUser, adminGetAllContracts);

/**
 * ========================
 * 🔹 ROUTES CHI TIẾT (ĐỂ CUỐI)
 * ========================
 */
// Lấy hợp đồng theo postId (chỉ approved)
// GET /api/contracts/by-post/:postId
router.get("/by-post/:postId", verifysUser, getContractByPost);


// Lấy hợp đồng theo ID
router.get("/:id", verifysUser, getContractById);

export default router;
