import { calcMaintenanceFee } from "../helpers/calculateMaitainceApartmentPrice.js";
import Apartment from '../models/Apartment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { emitNotification } from "../helpers/socketHelper.js";
import { sendEmailNotification, sendSMSNotification } from '../helpers/notificationHelper.js';
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

// GET /api/apartments?page=1&pageSize=10
export const getAllApartments = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const filter = { deletedAt: null }; // Chỉ lấy những căn chưa bị xóa

    const total = await Apartment.countDocuments(filter);
    const apartments = await Apartment.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate('isOwner', 'name phone')
      .populate('isRenter', 'name phone');

    res.json({
      data: apartments,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
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
    const apartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!apartment) return res.status(404).json({ error: 'Không tìm thấy căn hộ' });
    res.json({ message: 'Căn hộ đã được đánh dấu xóa (soft delete)' });
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
    const newNotification = await Notification.create({
      userId: user._id,
      message: `Bạn đã được gán làm người thuê căn hộ ${apartment.name}.`
    });
    emitNotification(user._id, newNotification);
    // --- EMAIL & SMS NOTIFICATION ---
    if (user.email) {
      await sendEmailNotification({
        to: user.email,
        subject: "Thông báo gán người thuê căn hộ",
        text: `Bạn đã được gán làm người thuê căn hộ ${apartment.name}.`,
        html: `<b>Bạn đã được gán làm người thuê căn hộ ${apartment.name}.</b>`
      });
    }

    if (user.phone) {
      await sendSMSNotification({
        to: user.phone,
        body: `Bạn đã được gán làm người thuê căn hộ ${apartment.name}.`
      });
    }
    // --- END EMAIL & SMS NOTIFICATION ---
    res.json(apartment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy căn hộ mà user sở hữu hoặc đang thuê
export const getUserApartment = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Lấy tất cả căn hộ mà user là chủ hoặc người thuê
    const apartments = await Apartment.find({
      $or: [
        { isOwner: userId },
        { isRenter: userId }
      ]
    })
      .populate('isOwner', 'name phone email')
      .populate('isRenter', 'name phone email');

    if (!apartments || apartments.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ của bạn" });
    }

    res.json(apartments); // ✅ Trả về danh sách căn hộ
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