import User from "../models/User.js";
import Apartment from "../models/Apartment.js";

// Đếm số lượng người dùng role=user
export const countCustomers = async (req, res) => {
    try {
      const total = await User.countDocuments({
        role: "customer",
        $or: [
          { deletedAt: null },
          { deletedAt: { $exists: false } }
        ]
      });
      res.status(200).json({ total });
    } catch (err) {
      console.error("❌ Lỗi đếm customers:", err);
      res.status(500).json({ message: "Lỗi server khi đếm customers" });
    }
  };
  
  

// Đếm số lượng người dùng role=staff
export const countStaffs = async (req, res) => {
  try {
    const total = await User.countDocuments({ role: "staff" });
    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi đếm staffs:", err);
    res.status(500).json({ message: "Lỗi server khi đếm staffs" });
  }
};

// Đếm số lượng căn hộ
export const countApartments = async (req, res) => {
  try {
    const total = await Apartment.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi đếm apartments:", err);
    res.status(500).json({ message: "Lỗi server khi đếm apartments" });
  }
};
