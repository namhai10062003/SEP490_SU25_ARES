import express from "express";
import {
  adminGetAllContracts,
  approveContract,
  createContract,
  deleteContract,
  getAllPaidContracts,
  getContractById,
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
import Contract from "../models/Contract.js";

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
router.get("/landlord", verifysUser, async (req, res) => {
  try {
    const contracts = await Contract.find({
      landlordId: req.user._id,
      deletedAt: null, // ⬅️ chỉ lấy hợp đồng chưa xoá
    })
      .populate("postId")
      .populate("userId")
      .sort({ createdAt: -1 });

    console.log("✅ Hợp đồng tìm được:", contracts.length);

    const now = new Date();
    const updatedContracts = await Promise.all(
      contracts.map(async (contract) => {
        if (
          contract.status === "approved" &&
          new Date(contract.endDate) < now
        ) {
          contract.status = "expired";
          await contract.save();
        }
        return contract;
      })
    );

    res.json({ data: updatedContracts });
  } catch (err) {
    console.error("❌ Lỗi backend:", err);
    res.status(500).json({ message: "Lỗi khi lấy hợp đồng của chủ nhà" });
  }
});

// Kiểm tra bài post đã có hợp đồng thanh toán chưa
router.get("/posts/:postId/has-paid-contract", async (req, res) => {
  try {
    const hasPaid = await Contract.exists({
      postId: req.params.postId,
      $or: [
        { paymentStatus: "paid" },
        { hasPaid: true }
      ]
    });

    res.json({ hasPaid: !!hasPaid });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

// Lấy hợp đồng theo userId (staff hoặc admin)
router.get("/user/:userId", async (req, res) => {
  try {
    const contracts = await Contract.find({ userId: req.params.userId })
      .sort({ startDate: -1 });
    res.json({ success: true, data: contracts });
  } catch (err) {
    console.error("Lỗi lấy hợp đồng:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

/**
 * ========================
 * 🔹 ACTIONS HỢP ĐỒNG
 * ========================
 */
router.put("/:id/approve", verifysUser, approveContract);
router.put("/:id/reject", verifysUser, rejectContract);
router.put("/:id/resubmit", verifysUser, resubmitContract);
router.delete("/:id", verifysUser, deleteContract);

// Hủy hợp đồng (chỉ khi đang pending)
router.patch("/cancel/:id", async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Không tìm thấy hợp đồng.' });
    if (contract.status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể huỷ hợp đồng khi đang chờ duyệt.' });
    }
    contract.status = 'cancelled';
    await contract.save();
    res.json({ message: 'Đã huỷ hợp đồng thành công.', contract });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi huỷ hợp đồng.' });
  }
});

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
router.get("/by-post/:postId", verifysUser, async (req, res) => {
  try {
    const { postId } = req.params;

    // 1️⃣ Kiểm tra xem đã có hợp đồng nào "paid" cho postId này chưa
    const paidContract = await Contract.findOne({
      postId,
      paymentStatus: "paid"
    }).sort({ createdAt: -1 });

    if (paidContract) {
      return res.json({
        success: true,
        data: paidContract,
        message: "Đã có người thanh toán cho bài đăng này"
      });
    }

    // 2️⃣ Nếu chưa có "paid", thì mới tìm hợp đồng approved gần nhất
    const approvedContract = await Contract.findOne({
      postId,
      status: "approved"
    }).sort({ createdAt: -1 });

    if (!approvedContract) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hợp đồng khả dụng cho bài đăng này"
      });
    }

    res.json({ success: true, data: approvedContract });
  } catch (err) {
    console.error("❌ Lỗi /by-post:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});


// Lấy hợp đồng theo ID
router.get("/:id", verifysUser, getContractById);

export default router;
