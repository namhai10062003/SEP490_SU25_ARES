import express from "express";
import { approveParkingRegistration, createParkingRegistration, getAvailableParkingSlots, getParkingRegistrationAll, getParkingRegistrationDetail, getParkingRegistrations, getUserParkingRegistrations, rejectParkingRegistration } from "../controllers/parkingRegistration.js";
import verifyUser from "../middleware/authMiddleware.js";
import isStaff from "../middleware/isStaff.js";
import { uploadImage } from "../middleware/upload.js";
import ParkingRegistration from '../models/ParkingRegistration.js';
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
// GET phí gửi xe theo user + apartment + tháng (từ registerDate)
router.get("/fee/:userId/:apartmentId/:month", async (req, res) => {
    const { userId, apartmentId, month } = req.params;
    try {
      const [m, y] = month.split("/"); // ví dụ: "07/2025" → m = "07", y = "2025"
      const startOfMonth = new Date(`${y}-${m}-01`);
      const endOfMonth = new Date(`${y}-${m}-31`); // đủ dùng vì chỉ lọc <=
  
      const data = await ParkingRegistration.find({
        userId,
        apartmentId,
        status: "approved",
        registerDate: { $lte: endOfMonth }, // chỉ cần đăng ký trước hoặc bằng tháng đó
      });
  
      const total = data.reduce((sum, item) => sum + (item.price || 0), 0);
  
      res.status(200).json({
        success: true,
        data,
        total,
      });
    } catch (err) {
      console.error("❌ Lỗi lấy phí gửi xe:", err);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  });
export default router;
