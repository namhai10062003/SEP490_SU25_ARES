import express from "express";
import { approveContract, createContract, deleteContract, getContractById, getMyContracts, rejectContract, resubmitContract } from "../controllers/contractController.js";
import {
  createContractPayment,
  handleContractPaymentWebhook
} from "../controllers/contractPaymentController.js";
import verifysUser from "../middleware/authMiddleware.js";
import Contract from "../models/Contract.js";
const router = express.Router();


// ✅ Tạo link thanh toán
router.put("/:contractId/pay", createContractPayment);

// ✅ Nhận webhook từ PayOS
router.post("/payment-webhook", handleContractPaymentWebhook);
// // return về hủy thanh toán 
// router.get("/payment/return", handlePaymentReturn);

// bên contract
router.post("/", verifysUser,createContract);
router.get("/me", verifysUser, getMyContracts);
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
  
  router.put("/:id/approve", verifysUser,approveContract);
router.put("/:id/reject", verifysUser, rejectContract);
router.delete("/:id", verifysUser,deleteContract);
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


export default router;
