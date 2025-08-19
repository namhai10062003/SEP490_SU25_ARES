// controllers/residentController.js
import { cloudinary } from '../db/cloudinary.js';
import { decrypt, encrypt } from "../db/encryption.js";
import Apartment from '../models/Apartment.js';
import Resident from '../models/Resident.js';
// Hàm giải mã an toàn
function safeDecrypt(value) {
  const isHex = /^[0-9a-fA-F]+$/.test(value);
  if (!value || !isHex) return value; // Nếu không phải hex thì trả nguyên
  try {
    return decrypt(value);
  } catch (err) {
    console.warn("⚠️ Không thể giải mã CCCD:", err.message);
    return value;
  }
}

// Lấy chi tiết nhân khẩu
export const getResidentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const resident = await Resident.findById(id).populate("apartmentId");

    if (!resident) {
      return res.status(404).json({ message: "Không tìm thấy nhân khẩu." });
    }

    // ✅ Giải mã CCCD trước khi trả về
    const residentObj = resident.toObject();
    residentObj.idNumber = safeDecrypt(residentObj.idNumber);

    res.status(200).json({
      message: "Lấy thông tin chi tiết nhân khẩu thành công",
      data: residentObj
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy chi tiết nhân khẩu:", err);
    res.status(500).json({
      message: "Lỗi server",
      error: err.message
    });
  }
};

// Tạo nhân khẩu mới
export const createResident = async (req, res) => {
  try {
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

    // ✅ Kiểm tra CCCD hợp lệ
    if (!idNumber?.trim() || !/^\d{12}$/.test(idNumber.trim())) {
      return res.status(400).json({ message: 'Số CCCD không hợp lệ. Vui lòng nhập đúng 12 chữ số.' });
    }

    // ✅ Tìm căn hộ
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: 'Không tìm thấy căn hộ.' });
    }

    // ✅ Kiểm tra quyền sở hữu hoặc thuê
    const userId = req.user?._id;
    const isOwnerMatch = apartment.isOwner && apartment.isOwner.equals(userId);
    const isRenterMatch = apartment.isRenter && apartment.isRenter.equals(userId);

    if (!isOwnerMatch && !isRenterMatch) {
      return res.status(403).json({ message: 'Bạn không có quyền đăng ký nhân khẩu cho căn hộ này.' });
    }

    // ✅ Upload ảnh nếu có
    let documentFrontUrl = '';
    let documentBackUrl = '';

    if (req.files?.documentFront?.[0]) {
      const uploaded = await cloudinary.uploader.upload(
        req.files.documentFront[0].path,
        { folder: 'residents' }
      );
      documentFrontUrl = uploaded.secure_url;
    }

    if (req.files?.documentBack?.[0]) {
      const uploaded = await cloudinary.uploader.upload(
        req.files.documentBack[0].path,
        { folder: 'residents' }
      );
      documentBackUrl = uploaded.secure_url;
    }

    // ✅ Mã hóa CCCD trước khi lưu
    const encryptedIdNumber = encrypt(idNumber.trim());

    // ✅ Tạo resident mới
    const resident = await Resident.create({
      apartmentId,
      fullName,
      gender,
      dateOfBirth,
      relationWithOwner,
      moveInDate,
      nationality,
      idNumber: encryptedIdNumber, // lưu bản mã hóa
      issueDate,
      documentFront: documentFrontUrl,
      documentBack: documentBackUrl,
      createdBy: req.user._id,
      verifiedByStaff: "pending"
    });

    // ✅ Emit socket nếu có
    if (global._io) {
      global._io.emit('new-resident-registered', {
        _id: resident._id,
        fullName: resident.fullName,
        gender: resident.gender,
        apartmentCode: apartment.apartmentCode,
        relation: resident.relationWithOwner,
        dateOfBirth: resident.dateOfBirth,
        documentFront: resident.documentFront
      });
    }

    return res.status(201).json({
      message: 'Thêm nhân khẩu thành công, vui lòng đợi xác minh.',
      data: resident
    });
  } catch (err) {
    console.error('[createResident] ❌', err);
    return res.status(500).json({
      message: 'Lỗi server',
      error: err.message
    });
  }
};

// Lấy danh sách nhân khẩu chưa xác minh
export const getResidentsUnverifiedByStaff = async (req, res) => {
  try {
    const residentsRaw = await Resident.find({ verifiedByStaff: "pending" })
      .populate("apartmentId")
      .sort({ createdAt: -1 });

    // ✅ Giải mã idNumber
    const residents = residentsRaw.map(r => ({
      ...r.toObject(),
      idNumber: safeDecrypt(r.idNumber)
    }));

    res.status(200).json({ residents });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách nhân khẩu chưa xác minh:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


// Xác minh nhân khẩu
export const verifyResidentByStaff = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ message: 'Không tìm thấy nhân khẩu' });
    }

    resident.verifiedByStaff = "true";
    resident.rejectReason = null;
    resident.rejectedAt = null;
    await resident.save();

    return res.status(200).json({
      message: '✅ Nhân khẩu đã được nhân viên xác minh',
      data: {
        ...resident.toObject(),
        idNumber: safeDecrypt(resident.idNumber) // ✅ chỉ giải mã khi trả ra
      }
    });
  } catch (err) {
    console.error('❌ Lỗi xác minh:', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};


// Từ chối nhân khẩu
export const rejectResidentByStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason?.trim()) return res.status(400).json({ message: "⚠️ Lý do từ chối là bắt buộc." });

    const resident = await Resident.findById(id);
    if (!resident) return res.status(404).json({ message: "❌ Không tìm thấy nhân khẩu." });

    resident.rejectReason = reason.trim();
    resident.verifiedByStaff = "false";
    resident.rejectedAt = new Date();
    await resident.save();

    return res.status(200).json({
      message: "❌ Nhân khẩu đã bị từ chối thành công.",
      residentId: resident._id,
      rejectReason: resident.rejectReason,
      rejectedAt: resident.rejectedAt,
    });
  } catch (err) {
    console.error("❌ Lỗi khi từ chối nhân khẩu:", err);
    return res.status(500).json({ message: "Lỗi server nội bộ.", error: err.message });
  }
};

// Đếm nhân khẩu theo căn hộ
export const countResidentsByApartment = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const count = await Resident.countDocuments({ apartmentId });
    return res.status(200).json({ message: 'Đếm nhân khẩu thành công', apartmentId, residentCount: count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy tất cả nhân khẩu của user hiện tại
export const getMyResidents = async (req, res) => {
  try {
    const userId = req.user._id;
    const apartments = await Apartment.find({ $or: [{ isOwner: userId }, { isRenter: userId }] })
      .populate('isOwner', '_id name')
      .populate('isRenter', '_id name');

    if (!apartments.length) return res.status(404).json({ message: 'Bạn chưa có căn hộ nào được liên kết.' });

    const result = await Promise.all(apartments.map(async (apt) => {
      const residentsRaw = await Resident.find({ apartmentId: apt._id });
      const residents = residentsRaw.map((r) => ({
        _id: r._id,
        fullName: r.fullName,
        gender: r.gender,
        dateOfBirth: r.dateOfBirth,
        relationWithOwner: r.relationWithOwner,
        moveInDate: r.moveInDate,
        nationality: r.nationality,
        idNumber: safeDecrypt(r.idNumber),
        issueDate: r.issueDate,
        documentFront: r.documentFront,
        documentBack: r.documentBack,
        verifiedByStaff: r.verifiedByStaff,
        rejectReason: r.rejectReason,
      }));
      return {
        apartmentId: apt._id,
        apartmentCode: apt.apartmentCode,
        ownerName: apt.ownerName || apt.isOwner?.name || '',
        isOwner: apt.isOwner,
        isRenter: apt.isRenter,
        residentCount: residents.length,
        residents,
      };
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error('❌ Lỗi getMyResidents:', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy tất cả nhân khẩu trong căn hộ
export const getResidentsByApartment = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const residents = await Resident.find({ apartmentId });
    res.status(200).json({ message: 'Lấy danh sách nhân khẩu thành công', data: residents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lọc theo trạng thái
export const getResidentsByStatus = async (req, res) => {
  const { status } = req.query;
  let filter = {};
  if (status === "unverified") filter = { verifiedByStaff: "pending" };
  else if (status === "verified") filter = { verifiedByStaff: "true" };
  else if (status === "rejected") filter = { verifiedByStaff: "false" };

  try {
    const residents = await Resident.find(filter)
      .populate("apartmentId", "apartmentCode") // ✅ lấy mã căn hộ
      .sort({ createdAt: -1 });

    const formatted = residents.map(r => ({
      _id: r._id,
      fullName: r.fullName,
      apartmentCode: r.apartmentId?.apartmentCode || "", // ✅ thêm mã căn hộ
      gender: r.gender,
      dateOfBirth: r.dateOfBirth,
      relationWithOwner: r.relationWithOwner,
      nationality: r.nationality,
      idNumber: safeDecrypt(r.idNumber),
      issueDate: r.issueDate,
      documentFront: r.documentFront,
      documentBack: r.documentBack,
      verifiedByStaff: r.verifiedByStaff,
      rejectReason: r.rejectReason,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách nhân khẩu:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Lấy nhân khẩu chưa xác minh
export const getUnverifiedResidents = async (req, res) => {
  try {
    const residents = await Resident.find({ verifiedByStaff: "pending" }).populate("apartmentId");
    res.json({ residents });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy danh sách chưa xác minh" });
  }
};
// hàm update nhân khẩu 
export const updateResident = async (req, res) => {
  try {
    const { residentId } = req.params;
    const {
      fullName,
      gender,
      dateOfBirth,
      relationWithOwner,
      moveInDate,
      nationality,
      idNumber,
      issueDate
    } = req.body;

    const resident = await Resident.findById(residentId);
    if (!resident) return res.status(404).json({ message: 'Không tìm thấy nhân khẩu.' });

    // Chỉ cho phép chỉnh sửa nếu resident bị từ chối
    if (resident.verifiedByStaff !== "false") {
      return res.status(400).json({ message: 'Chỉ có thể chỉnh sửa nhân khẩu bị từ chối.' });
    }

    let hasChanges = false;

    // CCCD
    let encryptedIdNumber = resident.idNumber;
    if (idNumber) {
      if (!/^\d{12}$/.test(idNumber.trim())) {
        return res.status(400).json({ message: 'Số CCCD không hợp lệ. Vui lòng nhập đúng 12 chữ số.' });
      }
      const newEncrypted = encrypt(idNumber.trim());
      if (newEncrypted !== resident.idNumber) {
        encryptedIdNumber = newEncrypted;
        hasChanges = true;
      }
    }

    // Upload/remove ảnh
    if (req.body.removeFront === 'true') { resident.documentFront = null; hasChanges = true; }
    if (req.body.removeBack === 'true') { resident.documentBack = null; hasChanges = true; }
    if (req.files?.documentFront?.[0]) {
      const uploaded = await cloudinary.uploader.upload(req.files.documentFront[0].path, { folder: 'residents' });
      resident.documentFront = uploaded.secure_url; hasChanges = true;
    }
    if (req.files?.documentBack?.[0]) {
      const uploaded = await cloudinary.uploader.upload(req.files.documentBack[0].path, { folder: 'residents' });
      resident.documentBack = uploaded.secure_url; hasChanges = true;
    }

    // Helper so sánh date string
    const isSameDate = (a, b) => {
      if (!a && !b) return true;
      const da = new Date(a).toISOString().slice(0, 10);
      const db = new Date(b).toISOString().slice(0, 10);
      return da === db;
    };

    // Cập nhật thông tin, đánh dấu hasChanges thật sự
    const fields = { fullName, gender, dateOfBirth, relationWithOwner, moveInDate, nationality, issueDate };
    Object.entries(fields).forEach(([key, value]) => {
      if (value) {
        if (key.toLowerCase().includes('date')) {
          if (!isSameDate(value, resident[key])) {
            resident[key] = value;
            hasChanges = true;
          }
        } else {
          if (value !== resident[key]) {
            resident[key] = value;
            hasChanges = true;
          }
        }
      }
    });

    resident.idNumber = encryptedIdNumber;

    // Nếu không có gì thay đổi → trả luôn, giữ nguyên verifiedByStaff
    if (!hasChanges) {
      return res.status(200).json({
        message: "⚠️ Không có thay đổi nào được thực hiện.",
        data: resident
      });
    }

    // Có thay đổi → reset verifiedByStaff về pending
    resident.verifiedByStaff = "pending";
    await resident.save();

    // Emit socket
    if (global._io) {
      global._io.emit('resident-updated', {
        fullName: resident.fullName,
        gender: resident.gender,
        relation: resident.relationWithOwner,
        dateOfBirth: resident.dateOfBirth,
        documentFront: resident.documentFront,
        documentBack: resident.documentBack,
        verifiedByStaff: resident.verifiedByStaff
      });
    }

    return res.status(200).json({
      message: '✅ Chỉnh sửa nhân khẩu thành công, vui lòng đợi xác minh lại.',
      data: resident
    });

  } catch (err) {
    console.error('[updateResident] ❌', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};


