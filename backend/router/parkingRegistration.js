import express from "express";
import { approveParkingRegistration, createParkingRegistration, getAvailableParkingSlots, getParkingRegistrationAll, getParkingRegistrationDetail, getParkingRegistrations, rejectParkingRegistration, getUserParkingRegistrations } from "../controllers/parkingRegistration.js";
import verifyUser from "../middleware/authMiddleware.js";
import isStaff from "../middleware/isStaff.js";
import { uploadImage } from "../middleware/upload.js";
const router = express.Router();

// Tạo đăng ký gửi xe mới (yêu cầu xác thực)
router.get("/user/:id", getUserParkingRegistrations);
router.post("/create-parkinglot", verifyUser, uploadImage, createParkingRegistration);
router.get("/detail-parkinglot/:id", verifyUser, getParkingRegistrationDetail);
router.get("/parkinglot", verifyUser, getParkingRegistrations);
router.get("/parkinglotall", isStaff, getParkingRegistrationAll);
router.get("/parkinglot/available-slots", isStaff, getAvailableParkingSlots);
// Staff duyệt đăng ký
router.patch('/approve/:id', isStaff, approveParkingRegistration);

// Staff từ chối đăng ký
router.patch('/reject/:id', isStaff, rejectParkingRegistration);
export default router;
