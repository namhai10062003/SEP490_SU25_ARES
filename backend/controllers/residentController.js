
import { cloudinary } from '../db/cloudinary.js'; // 👈 đã cấu hình elsewhere
import Apartment from '../models/Apartment.js';
import Resident from '../models/Resident.js';

export const createResident = async (req, res) => {
  try {
    /* 1. Lấy dữ liệu từ body */
    const {
      apartmentId,
      fullName,
      gender,
      dateOfBirth,
      relationWithOwner,
      moveInDate,
      nationality,
      idNumber,
      issueDate
    } = req.body;

    /* 2. Căn hộ phải tồn tại */
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: 'Không tìm thấy căn hộ.' });
    }

    /* 3. Upload ảnh (nếu có) */
    let documentFrontUrl = '';
    let documentBackUrl  = '';

    if (req.files?.documentFront?.[0]) {
      const up = await cloudinary.uploader.upload(
        req.files.documentFront[0].path,
        { folder: 'residents' }         // có thể đổi folder tùy ý
      );
      documentFrontUrl = up.secure_url;
    }

    if (req.files?.documentBack?.[0]) {
      const up = await cloudinary.uploader.upload(
        req.files.documentBack[0].path,
        { folder: 'residents' }
      );
      documentBackUrl = up.secure_url;
    }

    /* 4. Tạo đối tượng Resident */
    const resident = new Resident({
      apartmentId,
      fullName,
      gender,
      dateOfBirth,
      relationWithOwner,
      moveInDate,
      nationality,
      idNumber,
      issueDate,
      documentFront: documentFrontUrl,
      documentBack : documentBackUrl
    });

    await resident.save();

    return res.status(201).json({
      message: 'Thêm nhân khẩu thành công',
      data: resident
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

//

export const getResidentsByApartment = async (req, res) => {
    try {
      const { apartmentId } = req.params;
  
      const residents = await Resident.find({ apartmentId });
  
      res.status(200).json({
        message: 'Lấy danh sách nhân khẩu thành công',
        data: residents
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  };