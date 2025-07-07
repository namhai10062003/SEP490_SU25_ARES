import express from "express";
import { calculateAndSaveFees, getAllFees } from "../controllers/feeController.js";

const router = express.Router();

router.post("/calculate", calculateAndSaveFees); // gọi tính toán & lưu
router.get("/", getAllFees); // lấy danh sách đã lưu

export default router;
