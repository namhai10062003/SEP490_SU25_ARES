// backend/controllers/plazaController.js
import Plaza from "../models/Plaza.js";

export const getPlazas = async (req, res) => {
  try {
    const plazas = await Plaza.find().sort({ createdAt: -1 });
    res.json({ success: true, data: plazas });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Lấy chi tiết theo id
export const getPlazaById = async (req, res) => {
  try {
    const plaza = await Plaza.findById(req.params.id);
    if (!plaza)
      return res.status(404).json({ success: false, error: "Plaza not found" });
    res.json({ success: true, data: plaza });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

