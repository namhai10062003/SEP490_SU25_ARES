import Plaza from "../models/Plaza.js";

// Tạo Plaza mới
export const createPlaza = async (req, res) => {
  try {
    const { name, location, description } = req.body;
    const admin_id = req.user?._id || req.body.admin_id; // fallback nếu không có auth

    const plaza = new Plaza({
      admin_id,
      name,
      location,
      description
    });

    await plaza.save();
    res.status(201).json({ success: true, data: plaza });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Tạo plaza thất bại",
      error: error.message
    });
  }
};

// Lấy danh sách plaza
export const getPlazas = async (req, res) => {
  try {
    const plazas = await Plaza.find().populate("admin_id", "name email");
    res.status(200).json({ success: true, data: plazas });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách",
      error: error.message
    });
  }
};
