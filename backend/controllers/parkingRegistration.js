import mongoose from 'mongoose';
import { cloudinary } from '../db/cloudinary.js';
import Apartment from '../models/Apartment.js';
import ParkingRegistration from '../models/ParkingRegistration.js';
import Resident from '../models/Resident.js';
import { getIO } from '../socket.js';
// hiện thị bãi gửi xe nhưng trạng thái là pending 
// Hiển thị danh sách xe đã đăng ký gửi

// User A chỉ thấy danh sách của A. và hàm tạo cũng vậy 

// User B chỉ thấy danh sách của B.

// Không ai có thể mạo danh bằng cách thay userId trong body.
// Hiển thị danh sách xe đã đăng ký gửi cho staff là hàm list ra all 

const getParkingRegistrationAll = async (req, res) => {
  try {
    // ✅ 1. Lấy toàn bộ danh sách đăng ký
    const registrations = await ParkingRegistration.find();

    // ✅ 2. Định dạng lại dữ liệu gửi về client
    const formatted = registrations.map(item => {
      // ✅ Gán giá theo loại xe
      let price = '---';
      if (item.vehicleType?.toLowerCase() === 'ô tô') {
        price = '800.000VNĐ / tháng';
      } else if (item.vehicleType?.toLowerCase() === 'xe máy') {
        price = '80.000đVNĐ/ tháng';
      }

      return {
        tênChủSởHữu: item.owner || 'Không rõ',
        loạiXe: item.vehicleType || 'Không rõ',
        biểnSốXe: item.licensePlate || 'Không rõ',
        mãCănHộ: item.apartmentCode || 'Không rõ',
        giá: price,
        ngàyĐăngKý: item.registerDate?.toISOString().split('T')[0] || '---',
        trạngThái: item.status || 'Chưa rõ',
        ảnhmặttrước : item.documentFront,
        ảnhmặtsau : item.documentBack,
        id: item._id
      };
    });

    res.status(200).json({
      message: 'Lấy danh sách bãi gửi xe thành công',
      data: formatted
    });

  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách bãi gửi xe:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


// Hiển thị danh sách xe đã đăng ký gửi
const getParkingRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;

    const registrations = await ParkingRegistration
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = [];
    for (const item of registrations) {
      // ✅ Kiểm tra lại xem user còn là renter/owner của apartmentCode này không
      const apartment = await Apartment.findOne({ apartmentCode: item.apartmentCode });

      if (!apartment) continue; // bỏ qua nếu apartment không tồn tại

      // ❌ Nếu user không còn là owner hoặc renter của căn hộ => bỏ qua
      const stillValid =
        (apartment.isOwner && apartment.isOwner.toString() === userId.toString()) ||
        (apartment.isRenter && apartment.isRenter.toString() === userId.toString());

      if (!stillValid) continue;

      let gia = '---';
      if (item.vehicleType === 'ô tô') gia = '800.000VNĐ / tháng';
      else if (item.vehicleType === 'xe máy') gia = '80.000VNĐ / tháng';

      formatted.push({
        tênChủSởHữu: item.owner || 'Không rõ',
        loạiXe: item.vehicleType || '---',
        biểnSốXe: item.licensePlate || '---',
        mãCănHộ: item.apartmentCode || 'Không rõ',
        giá: gia,
        ngàyĐăngKý: item.registerDate
          ? item.registerDate.toISOString().split('T')[0]
          : '---',
        trạngThái: item.status || 'Chưa rõ',
        ảnhTrước: item.documentFront || null,
        ảnhSau: item.documentBack || null,
        lído: item.rejectionReason,
        id: item._id
      });
    }

    return res.status(200).json({
      message: 'Lấy danh sách bãi gửi xe thành công',
      data: formatted
    });

  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách bãi gửi xe:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
// Hiển thị chi tiết xe đã đăng ký
const getParkingRegistrationDetail = async (req, res) => {
  try {
    const { id } = req.params;
   // ✅ Kiểm tra id có tồn tại và hợp lệ
   if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID đăng ký xe không hợp lệ' });
  }
    const registration = await ParkingRegistration.findById(id);

    if (!registration) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đăng ký xe' });
    }

    // 👉 Định dạng giá theo vehicleType
    let formattedPrice = '---';
    if (registration.vehicleType === 'ô tô') {
      formattedPrice = '800.000VNĐ / tháng';
    } else if (registration.vehicleType === 'xe máy') {
      formattedPrice = '80.000VNĐ / tháng';
    }

    const detail = {
      tênCănHộ: registration.apartmentCode,
      loạiXe: registration.vehicleType,
      tênChủSởHữu: registration.owner,
      sđtChủSởHữu: registration.ownerPhone || '',
      biểnSốXe: registration.licensePlate,
      // ❌ Loại bỏ số khung, số máy
      ngàyĐăngKý: registration.registerDate
        ? registration.registerDate.toISOString().split('T')[0]
        : '---',
      ngàyHếtHạn: registration.expireDate
        ? registration.expireDate.toISOString().split('T')[0]
        : '---',
      trạngThái: registration.status,
      ảnhTrước: registration.documentFront,
      ảnhSau: registration.documentBack,
      giá: formattedPrice
    };

    res.status(200).json({
      message: 'Lấy thông tin đăng ký thành công',
      data: detail
    });
console.log('documentFront:', registration.documentFront);
console.log('documentBack:', registration.documentBack);
  } catch (error) {
    console.error('❌ Lỗi khi lấy thông tin đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};



// đăng ký bãi gửi xe
const PARKING_CAPACITY = parseInt(process.env.PARKING_CAPACITY || '150', 10);

const createParkingRegistration = async (req, res) => {
  try {
    /* 1. Lấy dữ liệu từ request */
    const userId = req.user._id;
    const {
      apartmentId,
      owner,
      ownerPhone,
      vehicleType,
      licensePlate,
      registeredCity,
      registeredDistrict,
      registerDate,
      expireDate
    } = req.body;

    // 2. Kiểm tra quyền người dùng: là chủ hộ hoặc người thuê
    const apartment = await Apartment.findOne({
      _id: apartmentId,
      $or: [
        { isOwner: userId },
        { isRenter: userId }
      ]
    });

    if (!apartment) {
      return res.status(403).json({ message: 'Bạn không có quyền đăng ký gửi xe cho căn hộ này.' });
    }

    /* 3. Kiểm tra dung lượng bãi */
    const globalCount = await ParkingRegistration.countDocuments({
      status: { $in: ['approved'] }
    });
    if (globalCount >= PARKING_CAPACITY) {
      return res.status(400).json({ message: 'Bãi đỗ xe đã đầy, không thể đăng ký thêm.' });
    }

    /* 4. Giới hạn theo nhân khẩu */
    const residentCount = await Resident.countDocuments({ apartmentId });
    const maxAllowed = residentCount * 2;

    const activeByApartment = await ParkingRegistration.countDocuments({
      apartmentId,
      status: { $in: ['approved'] }
    });

    if (activeByApartment >= maxAllowed) {
      return res.status(400).json({
        message: `Căn hộ có ${residentCount} nhân khẩu, tối đa ${maxAllowed} xe (2 xe/nhân khẩu). Đã đạt giới hạn!`
      });
    }

/* 5. Kiểm tra ngày hợp lệ */
const now = new Date();
const reg = new Date(registerDate);

// ❌ Không cho phép ngày đăng ký trong quá khứ
if (isNaN(reg) || reg < now.setHours(0, 0, 0, 0)) {
  return res.status(400).json({ message: 'Ngày đăng ký không hợp lệ hoặc không được nằm trong quá khứ.' });
}

let exp = null;
if (expireDate) {
  exp = new Date(expireDate);
  if (isNaN(exp) || exp <= reg) {
    return res.status(400).json({ message: 'Ngày hết hạn phải sau ngày đăng ký.' });
  }
}


    /* 6. Upload ảnh (nếu có) */
let documentFrontUrl = '';
let documentBackUrl = '';

const cleanedPlate = licensePlate?.trim().replace(/\s+/g, '_') || 'unknown';
const plateFolder = `papers/${cleanedPlate}`;


if (req.files?.documentFront?.[0]) {
  const up = await cloudinary.uploader.upload(req.files.documentFront[0].path, {
    folder: plateFolder,
    public_id: '1',
    overwrite: true
  });
  documentFrontUrl = up.secure_url;
}

if (req.files?.documentBack?.[0]) {
  const up = await cloudinary.uploader.upload(req.files.documentBack[0].path, {
    folder: plateFolder,
    public_id: '2',
    overwrite: true
  });
  documentBackUrl = up.secure_url;
}


    /* 7. Giá theo loại xe */
    let price;
    if (vehicleType === 'ô tô') price = 800000;
    else if (vehicleType === 'xe máy') price = 80000;
    else return res.status(400).json({ message: 'Loại xe không hợp lệ.' });

    /* 8. Lưu bản ghi */
    const { apartmentCode, slug } = apartment;
    const newRegistration = new ParkingRegistration({
      userId,
      apartmentId,
      apartmentCode,
      slug,
      owner,
      ownerPhone,
      vehicleType,
      licensePlate,
      registeredCity,
      registeredDistrict,
      registerDate: reg,
      expireDate: exp,
      documentFront: documentFrontUrl,
      documentBack: documentBackUrl,
      price,
      status: 'pending'
    });

    const saved = await newRegistration.save();

    /* 9. Socket thông báo */
    getIO().emit('staff:new-parking-request', {
      message: '📢 Có đăng ký gửi xe mới cần duyệt',
      registration: {
        id: saved._id,
        apartmentCode,
        owner,
        vehicleType,
        licensePlate,
        createdAt: saved.createdAt
      }
    });

    /* 10. Trả về client (ẩn các field không cần thiết) */
    return res.status(201).json({
      message: 'Đăng ký gửi xe đã được gửi, vui lòng chờ nhân viên duyệt.',
      data: {
        id: saved._id,
        apartmentCode: saved.apartmentCode,
        owner: saved.owner,
        vehicleType: saved.vehicleType,
        licensePlate: saved.licensePlate,
        registerDate: saved.registerDate,
        expireDate: saved.expireDate,
        documentFront: saved.documentFront,
        documentBack: saved.documentBack,
        status: saved.status,
        price: saved.price
      }
    });

  } catch (err) {
    console.error('❌ Lỗi khi tạo đăng ký:', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};




// ✅ Staff duyệt đăng ký
const approveParkingRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await ParkingRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký gửi xe.' });
    }

    registration.status = 'approved';
    await registration.save();

    res.status(200).json({
      message: 'Đăng ký đã được duyệt ✅',
      data: registration
    });
  } catch (error) {
    console.error('❌ Lỗi duyệt đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
// ❌ Staff từ chối đăng ký
const rejectParkingRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // 🆕 lấy lý do từ client

    const registration = await ParkingRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký gửi xe.' });
    }

    registration.status = 'rejected';
    registration.rejectionReason = reason || 'Không có lý do cụ thể';
    await registration.save();

    res.status(200).json({
      message: 'Đăng ký đã bị từ chối ❌',
      data: registration
    });
  } catch (error) {
    console.error('❌ Lỗi từ chối đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
//Hàm trả về số còn trống trong bãi 
const getAvailableParkingSlots = async (req, res) => {
  try {
    const MAX_SLOTS = 250;

    const currentCount = await ParkingRegistration.countDocuments({
      status: 'approved'
    });

    const available = MAX_SLOTS - currentCount;

    res.status(200).json({
      totalSlots: MAX_SLOTS,
      usedSlots: currentCount,
      availableSlots: available > 0 ? available : 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách đăng ký gửi xe của user
const getUserParkingRegistrations = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.id || req.query.userId;
    if (!userId) return res.status(400).json({ error: "Thiếu userId" });

    const data = await ParkingRegistration.find({ userId }); // userId field in your data
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const updateRejectedParking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      apartmentId,
      owner,
      ownerPhone,
      vehicleType,
      licensePlate,
      registeredCity,
      registeredDistrict,
      registerDate,
      expireDate,
      removeDocumentFront, // 🆕 flag xoá ảnh trước
      removeDocumentBack   // 🆕 flag xoá ảnh sau
    } = req.body;

    const registration = await ParkingRegistration.findById(id);
    if (!registration) return res.status(404).json({ message: 'Đăng ký không tồn tại.' });

    if (registration.status !== 'rejected') {
      return res.status(400).json({ message: 'Chỉ có thể chỉnh sửa đăng ký đã bị từ chối.' });
    }
// Nếu vẫn muốn normalize để đồng bộ format
function normalizeDateString(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const regDate = normalizeDateString(registerDate);
const expDate = expireDate ? normalizeDateString(expireDate) : null;

    // ✅ Check có thay đổi gì không
    let hasChanges = false;
    const fields = {
      apartmentId,
      owner,
      ownerPhone,
      vehicleType,
      licensePlate,
      registeredCity,
      registeredDistrict,
      registerDate: regDate,
      expireDate: expDate
    };
    for (const key in fields) {
      if (fields[key] != null && registration[key] != fields[key]) {
        registration[key] = fields[key];
        hasChanges = true;
      }
    }

    // ✅ Upload / Xoá ảnh nếu có
    const cleanedPlate = registration.licensePlate?.trim().replace(/\s+/g, '_') || 'unknown';
    const plateFolder = `papers/${cleanedPlate}`;

    // --- Mặt trước ---
    if (req.files?.documentFront?.[0]) {
      // Upload ảnh mới
      const up = await cloudinary.uploader.upload(req.files.documentFront[0].path, {
        folder: plateFolder,
        public_id: '1',
        overwrite: true
      });
      registration.documentFront = up.secure_url;
      hasChanges = true;
    } else if (removeDocumentFront === 'true') {
      // Xoá ảnh
      await cloudinary.uploader.destroy(`${plateFolder}/1`);
      registration.documentFront = null;
      hasChanges = true;
    }

    // --- Mặt sau ---
    if (req.files?.documentBack?.[0]) {
      const up = await cloudinary.uploader.upload(req.files.documentBack[0].path, {
        folder: plateFolder,
        public_id: '2',
        overwrite: true
      });
      registration.documentBack = up.secure_url;
      hasChanges = true;
    } else if (removeDocumentBack === 'true') {
      await cloudinary.uploader.destroy(`${plateFolder}/2`);
      registration.documentBack = null;
      hasChanges = true;
    }

    // ✅ Nếu có thay đổi, chuyển status sang pending
    if (hasChanges) registration.status = 'pending';

    const saved = await registration.save();

    if (hasChanges) {
      getIO().emit('staff:new-parking-request', {
        message: '📢 Đăng ký gửi xe đã được chỉnh sửa và cần duyệt lại',
        registration: {
          id: saved._id,
          apartmentCode: saved.apartmentCode,
          owner: saved.owner,
          vehicleType: saved.vehicleType,
          licensePlate: saved.licensePlate,
          createdAt: saved.createdAt
        }
      });
    }

    return res.status(200).json({
      message: hasChanges
        ? 'Cập nhật thành công, đăng ký đã chuyển sang pending.'
        : 'Không có thay đổi, trạng thái vẫn giữ nguyên rejected.',
      data: saved
    });

  } catch (err) {
    console.error('❌ Lỗi khi cập nhật đăng ký:', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

export { approveParkingRegistration, createParkingRegistration, getAvailableParkingSlots, getParkingRegistrationAll, getParkingRegistrationDetail, getParkingRegistrations, getUserParkingRegistrations, rejectParkingRegistration };

