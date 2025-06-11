import { cloudinary } from '../db/cloudinary.js';
import ParkingRegistration from '../models/ParkingRegistration.js';
// hiện thị bãi gửi xe 

// Hiển thị chi tiết xe đã đăng ký
const getParkingRegistrationDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    const registration = await ParkingRegistration.findOne({ userId });

    if (!registration) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đăng ký xe' });
    }

    // Format lại thông tin giống giao diện bạn muốn
    const detail = {
      mãCănHộ: registration.apartmentCode,
      tênCănHộ: registration.apartmentName,
      loạiXe: registration.vehicleType,
      tênChủSởHữu: registration.owner,
      sđtChủSởHữu: registration.ownerPhone || '', // nếu có trường phone
      biểnSốXe: registration.licensePlate,
      sốKhung: registration.chassisNumber || '---',
      sốMáy: registration.engineNumber || '---',
      ngàyĐăngKý: registration.registerDate,
      ngàyHếtHạn: registration.expireDate || '---',
      trạngThái: 'Đang đăng ký',
      ảnhTrước: registration.documentFront,
      ảnhSau: registration.documentBack
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
 const createParkingRegistration = async (req, res) => {
  try {
    const {
      userId,
      plazaId,
      apartmentId,
      serviceID,
      apartmentCode,
      apartmentName,
      owner,
      vehicleType,
      licensePlate,
      chassisNumber,
      engineNumber,
      registeredCity,
      registeredDistrict,
      registerDate,
      expireDate
    } = req.body;

    let documentFrontUrl = '';
    let documentBackUrl = '';

    // ✅ Upload ảnh mặt trước
    if (req.files?.documentFront?.[0]) {
      const result = await cloudinary.uploader.upload(req.files.documentFront[0].path, {
        folder: 'papers'
      });
      documentFrontUrl = result.secure_url;
    }

    // ✅ Upload ảnh mặt sau
    if (req.files?.documentBack?.[0]) {
      const result = await cloudinary.uploader.upload(req.files.documentBack[0].path, {
        folder: 'papers'
      });
      documentBackUrl = result.secure_url;
    }

    const newRegistration = new ParkingRegistration({
      userId,
      plazaId,
      apartmentId,
      serviceID,
      apartmentCode,
      apartmentName,
      owner,
      vehicleType,
      licensePlate,
      chassisNumber,
      engineNumber,
      registeredCity,
      registeredDistrict,
      registerDate,
      expireDate,
      documentFront: documentFrontUrl,
      documentBack: documentBackUrl
    });

    const saved = await newRegistration.save();

    res.status(201).json({
      message: 'Đăng ký gửi xe thành công',
      data: saved
    });

  } catch (error) {
    console.error('❌ Lỗi khi tạo đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export { createParkingRegistration, getParkingRegistrationDetail };

