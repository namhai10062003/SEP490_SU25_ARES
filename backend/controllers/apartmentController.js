import Apartment from '../models/Apartment.js';
import User from '../models/User.js';
import { calcMaintenanceFee } from "../helpers/calculateMaitainceApartmentPrice.js";

// Thêm mới căn hộ
export const createApartment = async (req, res) => {
  try {
    const apartment = new Apartment(req.body);
    await apartment.save();
    res.status(201).json(apartment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả căn hộ
export const getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find()
      .populate('isOwner', 'name phone')
      .populate('isRenter', 'name phone');
    res.json(apartments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy 1 căn hộ theo ID
export const getApartmentById = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id).populate('userId');
    if (!apartment) return res.status(404).json({ error: 'Not found' });
    res.json(apartment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật căn hộ
export const updateApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!apartment) return res.status(404).json({ error: 'Not found' });
    res.json(apartment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xoá căn hộ
export const deleteApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findByIdAndDelete(req.params.id);
    if (!apartment) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Gán userId cho căn hộ (user thuê nhà)
export const assignUserToApartment = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const apartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      { userId: user._id },
      { new: true }
    );

    res.json(apartment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy căn hộ mà user sở hữu hoặc đang thuê
export const getUserApartment = async (req, res) => {
  try {
    const { userId } = req.params;
    // Tìm căn hộ mà user là chủ sở hữu hoặc người thuê
    const apartment = await Apartment.findOne({
      $or: [
        { isOwner: userId },
        { isRenter: userId }
      ]
    })
      .populate('isOwner', 'name phone email')
      .populate('isRenter', 'name phone email');
    if (!apartment) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ của bạn" });
    }
    res.json(apartment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tính phí bảo trì căn hộ
export const getApartmentExpense = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) return res.status(404).json({ error: "Không tìm thấy căn hộ" });

    // Đảm bảo dùng đúng trường area
    if (!apartment.area || isNaN(apartment.area)) {
      return res.status(400).json({ error: "Căn hộ chưa có diện tích hợp lệ!" });
    }

    const fee = await calcMaintenanceFee({
      building: apartment.building,
      area: apartment.area // Đúng tên trường area
    });

    res.json({ maintenanceFee: fee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};