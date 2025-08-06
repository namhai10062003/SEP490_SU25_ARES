import express from "express";
import { handleSignatureUpload, approveContract, createContract, deleteContract, getAllPaidContracts, getContractById, getMyContracts, rejectContract, resubmitContract, updateWithdrawableForAll } from "../controllers/contractController.js";
import {
  createContractPayment,
  handleContractPaymentWebhook
} from "../controllers/contractPaymentController.js";
import verifysUser from "../middleware/authMiddleware.js";
import Contract from "../models/Contract.js";
import { uploadSignature } from "../middleware/uploadSignature.js";
const router = express.Router();


// ✅ Tạo link thanh toán
router.put("/:contractId/pay", createContractPayment);

// ✅ Nhận webhook từ PayOS
router.post("/payment-webhook", handleContractPaymentWebhook);
// // return về hủy thanh toán 
// router.get("/payment/return", handlePaymentReturn);

// bên contract
router.post("/", verifysUser, createContract);
router.get("/me", verifysUser, getMyContracts);
router.get("/paid", getAllPaidContracts);
router.get("/landlord", verifysUser, async (req, res) => {
  try {
    const contracts = await Contract.find({ landlordId: req.user._id });

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
    res.status(500).json({ message: "Lỗi khi lấy hợp đồng của chủ nhà" });
  }
});

router.put("/:id/approve", verifysUser, approveContract);
router.put("/:id/reject", verifysUser, rejectContract);
router.delete("/:id", verifysUser, deleteContract);
// hủy hợp đồng 
// routes/contractRouter.js
router.patch('/cancel/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Không tìm thấy hợp đồng.' });

    // Kiểm tra điều kiện nếu cần (ví dụ: chỉ huỷ được nếu đang "pending")
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

// xem chi tiết 
router.get("/:id", verifysUser, getContractById);
router.put("/:id/resubmit", verifysUser, resubmitContract);
// lấy hợp đồng theo user để bt kia max qua bên staff 
router.get('/user/:userId', async (req, res) => {
  try {
    const contracts = await Contract.find({ userId: req.params.userId })
      .sort({ startDate: -1 }); // sort mới nhất đầu tiên (nếu muốn)

    res.json({
      success: true,
      data: contracts,
    });
  } catch (err) {
    console.error("Lỗi lấy hợp đồng:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});


router.put("/update-withdrawable",verifysUser,updateWithdrawableForAll);

router.post("/upload-signature", uploadSignature, handleSignatureUpload);
export default router;
