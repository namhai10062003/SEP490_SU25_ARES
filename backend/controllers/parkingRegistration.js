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

const getParkingRegistrationAll= async (req, res) => {
  try {
    // ✅ 1. Lấy toàn bộ danh sách đăng ký
    const registrations = await ParkingRegistration.find();

    // ✅ 2. Định dạng lại dữ liệu gửi về client
    const formatted = registrations.map(item => ({
      tênChủSởHữu: item.owner || 'Không rõ',
      loạiXe: item.vehicleType,
      biểnSốXe: item.licensePlate,
      mãCănHộ: item.apartmentCode || 'Không rõ',
      giá: '80.000đ / tháng',
      ngàyĐăngKý: item.registerDate?.toISOString().split('T')[0] || '---',
      trạngThái: item.status || 'Chưa rõ',  // ✅ lấy đúng giá trị từ DB
      id: item._id
    }));

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

    const formatted = registrations.map(item => {
      let gia = '---';
      if (item.vehicleType === 'ô tô') gia = '800.000đ / tháng';
      else if (item.vehicleType === 'xe máy') gia = '80.000đ / tháng';

      return {
        tênChủSởHữu : item.owner || 'Không rõ',
        loạiXe      : item.vehicleType || '---',
        biểnSốXe    : item.licensePlate || '---',
        mãCănHộ     : item.apartmentCode || 'Không rõ',
        giá         : gia,
        ngàyĐăngKý  : item.registerDate
                        ? item.registerDate.toISOString().split('T')[0]
                        : '---',
        trạngThái   : item.status || 'Chưa rõ',
        id          : item._id
      };
    });

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

    const registration = await ParkingRegistration.findById(id);

    if (!registration) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đăng ký xe' });
    }

    // 👉 Định dạng giá theo vehicleType (nếu muốn hiển thị text)
    let formattedPrice = '---';
    if (registration.vehicleType === 'ô tô') {
      formattedPrice = '800.000đ / tháng';
    } else if (registration.vehicleType === 'xe máy') {
      formattedPrice = '80.000đ / tháng';
    }

    const detail = {
      tênCănHộ: registration.apartmentCode,
      loạiXe: registration.vehicleType,
      tênChủSởHữu: registration.owner,
      sđtChủSởHữu: registration.ownerPhone || '',
      biểnSốXe: registration.licensePlate,
      sốKhung: registration.chassisNumber || '---',
      sốMáy: registration.engineNumber || '---',
      ngàyĐăngKý: registration.registerDate,
      ngàyHếtHạn: registration.expireDate || '---',
      trạngThái: registration.status,
      ảnhTrước: registration.documentFront,
      ảnhSau: registration.documentBack,
      giá: formattedPrice // 🆕 Trường giá đã định dạng
    };

    res.status(200).json({
      message: 'Lấy thông tin đăng ký thành công',
      data: detail
    });

  } catch (error) {
    console.error('❌ Lỗi khi lấy thông tin đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};



// đăng ký bãi gữi xe
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
      chassisNumber,
      engineNumber,
      registeredCity,
      registeredDistrict,
      registerDate,
      expireDate
    } = req.body;

    /* 2. Căn hộ phải thuộc quyền user hiện tại */
    const apartment = await Apartment.findOne({ _id: apartmentId, userId });
    if (!apartment) {
      return res.status(403).json({ message: 'Bạn không có quyền đăng ký gửi xe cho căn hộ này.' });
    }

    /* 3. CHỐT 1: Kiểm tra dung lượng bãi (global) */
    const globalCount = await ParkingRegistration.countDocuments({
      status: { $in: ['approved'] }
    });
    if (globalCount >= PARKING_CAPACITY) {
      return res.status(400).json({ message: 'Bãi đỗ xe đã đầy, không thể đăng ký thêm.' });
    }

   /* 4. CHỐT 2: Giới hạn theo nhân khẩu (2 xe / 1 nhân khẩu) */
const residentCount = await Resident.countDocuments({ apartmentId });
const maxAllowed    = residentCount * 2;   // 👈 Mỗi nhân khẩu 2 xe

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
    if (isNaN(reg) || reg > now) {
      return res.status(400).json({ message: 'Ngày đăng ký không hợp lệ hoặc nằm trong tương lai.' });
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
    let documentBackUrl  = '';
    if (req.files?.documentFront?.[0]) {
      const up = await cloudinary.uploader.upload(req.files.documentFront[0].path, { folder: 'papers' });
      documentFrontUrl = up.secure_url;
    }
    if (req.files?.documentBack?.[0]) {
      const up = await cloudinary.uploader.upload(req.files.documentBack[0].path, { folder: 'papers' });
      documentBackUrl = up.secure_url;
    }

    /* 7. Giá theo loại xe */
    let price;
    if (vehicleType === 'ô tô')       price = 800000;
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
      chassisNumber,
      engineNumber,
      registeredCity,
      registeredDistrict,
      registerDate: reg,
      expireDate : exp,
      documentFront: documentFrontUrl,
      documentBack : documentBackUrl,
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

    /* 10. Trả về client */
    return res.status(201).json({
      message: 'Đăng ký gửi xe đã được gửi, vui lòng chờ nhân viên duyệt.',
      data: saved
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

    const registration = await ParkingRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký gửi xe.' });
    }

    registration.status = 'rejected';
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

export { approveParkingRegistration, createParkingRegistration, getAvailableParkingSlots, getParkingRegistrationAll, getParkingRegistrationDetail, getParkingRegistrations, rejectParkingRegistration };

