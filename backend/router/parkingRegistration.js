import express from "express";
import { createParkingRegistration, getParkingRegistrationDetail } from "../controllers/parkingRegistration.js";
import verifyUser from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/upload.js";
const router = express.Router();

// Tạo đăng ký gửi xe mới (yêu cầu xác thực)
router.post("/create-parkinglot", verifyUser, uploadImage,createParkingRegistration);
router.get("/detail-parkinglot/:userId", verifyUser, getParkingRegistrationDetail);
export default router;
