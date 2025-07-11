import express from "express";
import { calculateAndSaveFees, getAllFees, getFeeByApartmentAndMonth, getMonthlyFeeByApartment, updateParkingFee } from "../controllers/feeController.js";
import { createFeePayment, handleFeePaymentWebhook } from "../controllers/feepaymentController.js";
const router = express.Router();

router.post("/calculate", calculateAndSaveFees); // gọi tính toán & lưu
router.get("/", getAllFees); // lấy danh sách đã lưu
router.get("/monthly/:apartmentId", getMonthlyFeeByApartment);
router.get("/detail/:apartmentId/:month", getFeeByApartmentAndMonth);// hàm lấy tiền theo tháng
router.patch('/update-parking-fee/:apartmentId/:month', updateParkingFee);//hàm update tiền bãi đỗ xe
// thanh toán chi phí hóa đơn

router.post("/pay", createFeePayment);
router.post("/webhook", handleFeePaymentWebhook);
export default router;
