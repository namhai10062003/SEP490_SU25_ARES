
import { cloudinary } from '../db/cloudinary.js'; // 👈 đã cấu hình elsewhere
import Apartment from '../models/Apartment.js';
import Resident from '../models/Resident.js';
// ham xem chi tiet nhan khau 
export const getResidentDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm nhân khẩu theo id và populate thông tin căn hộ (nếu cần)
    const resident = await Resident.findById(id).populate('apartmentId');

    if (!resident) {
      return res.status(404).json({ message: 'Không tìm thấy nhân khẩu.' });
    }

    res.status(200).json({
      message: 'Lấy thông tin chi tiết nhân khẩu thành công',
      data: resident
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy chi tiết nhân khẩu:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

/* ========== CREATE RESIDENT & EMIT SOCKET ========== */
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

    /* 2. Tìm căn hộ */
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: 'Không tìm thấy căn hộ.' });
    }

    /* 3. Kiểm tra quyền truy cập: isOwner hoặc isRenter */
    const userId = req.user?._id;

    const isOwnerMatch  = apartment.isOwner && apartment.isOwner.equals(userId);
    const isRenterMatch = apartment.isRenter && apartment.isRenter.equals(userId);

    if (!isOwnerMatch && !isRenterMatch) {
      return res.status(403).json({
        message: 'Bạn không có quyền đăng ký nhân khẩu cho căn hộ này.',
      });
    }

    /* 4. Upload ảnh giấy tờ (nếu có) */
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

    /* 5. Tạo resident mới */
    const resident = await Resident.create({
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
      documentBack: documentBackUrl,
      createdBy: req.user._id,
      verifiedByStaff: "pending",  // ✅ đảm bảo luôn là pending khi mới tạo
    });
    
    // const resident = await Resident.create({
    //   apartmentId,
    //   fullName,
    //   gender,
    //   dateOfBirth,
    //   relationWithOwner,
    //   moveInDate,
    //   nationality,
    //   idNumber,
    //   issueDate,
    //   documentFront: documentFrontUrl,
    //   documentBack : documentBackUrl,
    //   // verifiedByStaff: false,
    //   // rejectReason,
    //   // verifiedByAdmin: false,
    // });

    /* 6. Emit socket cho nhân viên */
    if (global._io) {
      global._io.emit('new-resident-registered', {
        _id:           resident._id,
        fullName:      resident.fullName,
        gender:        resident.gender,
        apartmentCode: apartment.apartmentCode,
        relation:      resident.relationWithOwner,
        dateOfBirth:   resident.dateOfBirth,
        documentFront: resident.documentFront
      });
    }

    /* 7. Trả phản hồi */
    return res.status(201).json({
      message: 'Thêm nhân khẩu thành công, vui lòng đợi xác minh.',
      data: resident,
    });

  } catch (err) {
    console.error('[createResident] ❌', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
// Lấy danh sách nhân khẩu chưa được xác minh bởi nhân viên
export const getResidentsUnverifiedByStaff = async (req, res) => {
  try {
    const unverifiedResidents = await Resident.find({ verifiedByStaff: "pending" })
    .populate('apartmentId')
    .sort({ createdAt: -1 });
  
    res.status(200).json({
      residents: unverifiedResidents,
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách nhân khẩu chưa xác minh:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ✅ Duyệt nhân khẩu bởi nhân viên (staff)
export const verifyResidentByStaff = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ message: 'Không tìm thấy nhân khẩu' });
    }

    // ✅ Cập nhật xác minh bởi staff & xoá rejectReason (nếu có trước đó)
    resident.verifiedByStaff = "true";
    resident.rejectReason = null;
    await resident.save();

    return res.status(200).json({ message: '✅ Nhân khẩu đã được nhân viên xác minh' });
  } catch (err) {
    console.error('❌ Lỗi xác minh:', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ❌ Từ chối nhân khẩu bởi nhân viên (staff)
export const rejectResidentByStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Kiểm tra lý do từ chối
    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "⚠️ Lý do từ chối là bắt buộc." });
    }

    // Tìm nhân khẩu theo ID
    const resident = await Resident.findById(id).populate("createdBy");

    if (!resident) {
      return res.status(404).json({ message: "❌ Không tìm thấy nhân khẩu." });
    }

    // Cập nhật thông tin từ chối
    resident.rejectReason = reason.trim();
    resident.verifiedByStaff ="false";
    resident.rejectedAt = new Date();
    resident.rejectedBy = req.user?._id || null;

    await resident.save();

    return res.status(200).json({
      message: "❌ Nhân khẩu đã bị từ chối thành công.",
      residentId: resident._id,
      rejectReason: resident.rejectReason,
      rejectedBy: req.user?.name || "Không rõ người từ chối",
      rejectedAt: resident.rejectedAt,
    });
  } catch (error) {
    console.error("❌ Lỗi khi từ chối nhân khẩu:", error);
    return res.status(500).json({ message: "Lỗi server nội bộ.", error: error.message });
  }
};



//dem nhan khau trong apartment 
export const countResidentsByApartment = async (req, res) => {
  try {
    const { apartmentId } = req.params;

    const count = await Resident.countDocuments({ apartmentId });

    return res.status(200).json({
      message: 'Đếm nhân khẩu thành công',
      apartmentId,
      residentCount: count,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
// list dc ra resident và đếm 
export const getMyResidents = async (req, res) => {
  try {
    const userId = req.user._id;

    const apartments = await Apartment.find({
      $or: [{ isOwner: userId }, { isRenter: userId }],
    })
      .populate('isOwner', '_id name')
      .populate('isRenter', '_id name');

    if (!apartments.length) {
      return res
        .status(404)
        .json({ message: 'Bạn chưa có căn hộ nào được liên kết.' });
    }

    const result = await Promise.all(
      apartments.map(async (apt) => {
        const residentsRaw = await Resident.find({ apartmentId: apt._id });

        const residents = residentsRaw.map((r) => ({
          _id: r._id,
          fullName: r.fullName,
          gender: r.gender,
          dateOfBirth: r.dateOfBirth,
          relationWithOwner: r.relationWithOwner,
          verifiedByStaff: r.verifiedByStaff,
          rejectReason: r.rejectReason, // 👈 thêm lý do từ chối
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
      })
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error('❌ Lỗi getMyResidents:', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};



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

  export const getResidentsByStatus = async (req, res) => {
    const { status } = req.query;
    let filter = {};
  
    if (status === "unverified") {
      filter = { verifiedByStaff: "pending" };
    } else if (status === "verified") {
      filter = { verifiedByStaff: "true" };
    } else if (status === "rejected") {
      filter = { verifiedByStaff: "false" };
    }
    
  
    try {
      const residents = await Resident.find(filter).populate("apartmentId");
      res.status(200).json(residents);
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
  };
  
  // controllers/residentController.js
export const getUnverifiedResidents = async (req, res) => {
  try {
    const residents = await Resident.find({ verifiedByStaff: "pending" }).populate("apartmentId");
    res.json({ residents });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy danh sách chưa xác minh" });
  }
};