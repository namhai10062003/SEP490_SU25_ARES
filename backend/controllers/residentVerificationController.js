import User from "../models/User.js";
import Apartment from "../models/Apartment.js";
import ResidentVerification from "../models/ResidentVerification.js";

export const searchUser = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "Vui lòng cung cấp từ khóa tìm kiếm." });
    }

    const user = await User.findOne({
      $or: [
        { name: { $regex: keyword, $options: "i" } }, // tìm gần đúng theo tên
        { email: { $regex: keyword, $options: "i" } } // tìm gần đúng theo email
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng phù hợp." });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("❌ Lỗi trong searchUser:", err.message);
    return res.status(500).json({ error: "Lỗi server" });
  }
};


export const getApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find();
    res.json(apartments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const submitVerification = async (req, res) => {
  try {
    const newVerification = new ResidentVerification(req.body);
    await newVerification.save();
    res.status(201).json({ message: "Verification request created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
