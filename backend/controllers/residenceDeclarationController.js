import { cloudinary } from '../db/cloudinary.js';
import { decrypt, encrypt } from "../db/encryption.js";
import Apartment from '../models/Apartment.js';
import Notification from '../models/Notification.js';
import ResidenceDeclaration from '../models/ResidenceDeclaration.js';
// ✅ Giải mã an toàn
function safeDecrypt(value) {
  const isHex = /^[0-9a-fA-F]+$/.test(value);
  if (!value || !isHex) return value;
  try {
    return decrypt(value);
  } catch {
    return value;
  }
}

// 📌 Lấy chi tiết
export const getDeclarationDetail = async (req, res) => {
  try {
    const doc = await ResidenceDeclaration.findById(req.params.id).populate("apartmentId");
    if (!doc) return res.status(404).json({ message: "Không tìm thấy hồ sơ." });

    const obj = doc.toObject();
    obj.idNumber = safeDecrypt(obj.idNumber);

    res.status(200).json({ message: "Lấy chi tiết thành công", data: obj });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// 📌 Tạo mới
export const createDeclaration = async (req, res) => {
  try {
    const {
      apartmentId,
      fullName,
      gender,
      dateOfBirth,
      relationWithOwner,
      nationality,
      idNumber,
    //   issueDate,
      startDate,
      endDate
    } = req.body;

    // ✅ Tìm căn hộ
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: 'Không tìm thấy căn hộ.' });
    }

    // ✅ Kiểm tra quyền
    const userId = req.user?._id;
    const isOwnerMatch = apartment.isOwner && apartment.isOwner.equals(userId);
    const isRenterMatch = apartment.isRenter && apartment.isRenter.equals(userId);
    if (!isOwnerMatch && !isRenterMatch) {
      return res.status(403).json({ message: 'Bạn không có quyền khai báo cho căn hộ này.' });
    }

    // ✅ Upload ảnh
    let documentImageUrl = '';
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, { folder: 'residence_declaration' });
      documentImageUrl = uploaded.secure_url;
    } else {
      return res.status(400).json({ message: 'Vui lòng tải lên ảnh giấy tờ.' });
    }

    // ✅ Mã hóa CCCD nếu có
    let encryptedIdNumber = null;
    if (idNumber && idNumber.trim() !== "") {
      if (!/^\d{12}$/.test(idNumber.trim())) {
        return res.status(400).json({ message: 'Số CCCD không hợp lệ. Vui lòng nhập đúng 12 chữ số.' });
      }
      encryptedIdNumber = encrypt(idNumber.trim());
    }

    // ✅ Tạo mới
    const declaration = await ResidenceDeclaration.create({
      type: 'Tạm trú / Tạm vắng',
      apartmentId,
      fullName,
      gender,
      dateOfBirth,
      relationWithOwner,
      nationality,
      idNumber: encryptedIdNumber,
    //   issueDate: issueDate || null,
      startDate,
      endDate,
      documentImage: documentImageUrl,
      createdBy: req.user._id,
      verifiedByStaff: "pending"
    });

    res.status(201).json({
      message: 'Thêm hồ sơ tạm trú/tạm vắng thành công, vui lòng đợi xác minh.',
      data: { ...declaration.toObject(), idNumber: safeDecrypt(declaration.idNumber) }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// 📌 Lấy danh sách chờ xác minh
export const getUnverifiedDeclarations = async (req, res) => {
    try {
      const docs = await ResidenceDeclaration.find({ verifiedByStaff: "approved" })
        .populate("apartmentId")
        .sort({ createdAt: -1 })
        .lean();
  
      const formatted = docs.map(r => {
        const expiryInfo = calcExpiry(r.endDate);
        return {
          ...r,
          idNumber: safeDecrypt(r.idNumber),
          ...expiryInfo
        };
      });
  
      res.status(200).json({ declarations: formatted });
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  };

// 📌 Duyệt
export const verifyDeclarationByStaff = async (req, res) => {
  try {
    const doc = await ResidenceDeclaration.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });

    doc.verifiedByStaff = "true";
    doc.rejectReason = null;
    doc.rejectedAt = null;
    await doc.save();

    res.status(200).json({
      message: '✅ Hồ sơ đã được xác minh',
      data: { ...doc.toObject(), idNumber: safeDecrypt(doc.idNumber) }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// 📌 Từ chối
export const rejectDeclarationByStaff = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ message: "⚠️ Lý do từ chối là bắt buộc." });

    const doc = await ResidenceDeclaration.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "❌ Không tìm thấy hồ sơ." });

    doc.rejectReason = reason.trim();
    doc.verifiedByStaff = "false";
    doc.rejectedAt = new Date();
    await doc.save();

    res.status(200).json({
      message: "❌ Hồ sơ đã bị từ chối.",
      declarationId: doc._id,
      rejectReason: doc.rejectReason,
      rejectedAt: doc.rejectedAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server nội bộ.", error: err.message });
  }
};

// 📌 Lọc theo trạng thái
export const getDeclarationsByStatus = async (req, res) => {
  const { status } = req.query;
  let filter = {};
  if (status === "unverified") filter = { verifiedByStaff: "pending" };
  else if (status === "verified") filter = { verifiedByStaff: "true" };
  else if (status === "rejected") filter = { verifiedByStaff: "false" };

  try {
    const docs = await ResidenceDeclaration.find(filter)
      .populate("apartmentId", "apartmentCode")
      .sort({ createdAt: -1 });

    const formatted = docs.map(r => ({
      ...r.toObject(),
      idNumber: safeDecrypt(r.idNumber)
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

// 📌 Helper tính thời gian hết hạn
function calcExpiry(endDate) {
    if (!endDate) return { isExpired: false, daysLeft: null, showNotifyButton: false };
  
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end - now;
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // số ngày còn lại
  
    const isExpired = diffMs < 0;
    const showNotifyButton = !isExpired && daysLeft <= 3; // Hiện nút nếu còn <= 3 ngày và chưa hết hạn
  
    return { isExpired, daysLeft, showNotifyButton };
  }
  
  export const getMyDeclarations = async (req, res) => {
    try {
      const declarations = await ResidenceDeclaration.find({
        createdBy: req.user._id
      })
        .populate({
          path: "apartmentId",
          select: "apartmentCode ownerName"
        })
        .lean();
  
      if (!declarations || declarations.length === 0) {
        return res.json({ data: [], message: "Không có hồ sơ nào" });
      }
  
      // ✅ Format dữ liệu
      const formatted = declarations.map(d => {
        const expiryInfo = calcExpiry(d.endDate);
        return {
          ...d,
          idNumber: safeDecrypt(d.idNumber), // Giải mã CCCD
          ...expiryInfo
        };
      });
  
      res.json({ data: formatted });
    } catch (err) {
      console.error("❌ Lỗi khi lấy hồ sơ của tôi:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  };
// hàm thông báo 
// 📌 Gửi thông báo cho user khi sắp hết hạn

export const notifyUser = async (req, res) => {
    try {
      const declaration = await ResidenceDeclaration.findById(req.params.id)
        .populate("createdBy", "fullName username email")
        .populate("apartmentId", "apartmentCode");
  
      if (!declaration) {
        return res.status(404).json({ message: "Không tìm thấy hồ sơ" });
      }
  
      // ✅ Tính số ngày còn lại
      const today = new Date();
      const daysLeft = Math.ceil(
        (new Date(declaration.endDate) - today) / (1000 * 60 * 60 * 24)
      );
  
      if (daysLeft > 3) {
        return res.status(400).json({ message: "Hồ sơ chưa gần hết hạn" });
      }
  
      // ✅ Lấy tên user (fallback nếu thiếu)
      const userName =
//   declaration.fullName || // tên người trong hồ sơ
//   declaration.createdBy?.fullName || // tên từ tài khoản user
  declaration.createdBy.username || // username từ tài khoản user
  "Người dùng";
  
      // ✅ Thông tin căn hộ
      const apartmentCode =
        declaration.apartmentId?.apartmentCode || "không xác định";
  
      // ✅ Nội dung thông báo (không lộ ID)
      const notifyTitle = "Hồ sơ tạm trú/tạm vắng sắp hết hạn";
      const notifyMessage = `Hồ sơ tạm trú/tạm vắng của bạn cho căn hộ ${apartmentCode} sẽ hết hạn sau ${daysLeft} ngày.`;
  
      // ✅ Lưu thông báo kèm dữ liệu ID vào DB
      await Notification.create({
        userId: declaration.createdBy._id,
        title: notifyTitle,
        message: notifyMessage,
        data: {
          declarationId: declaration._id, // 👈 để frontend mở chi tiết
        },
      });
  
      console.log(`📢 Đã gửi thông báo tới người ${userName} (${declaration.createdBy.email})`);
  
      return res.status(200).json({
        message: `Đã gửi thông báo cho ${userName}`,
      });
    } catch (err) {
      console.error("❌ Lỗi khi gửi thông báo:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  };
  
  

  
