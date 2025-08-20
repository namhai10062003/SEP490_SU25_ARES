import mongoose from "mongoose";
import { calcMaintenanceFee } from "../helpers/calculateMaitainceApartmentPrice.js";
import { sendEmailNotification, sendSMSNotification } from '../helpers/notificationHelper.js';
import { emitNotification } from "../helpers/socketHelper.js";
import Apartment from '../models/Apartment.js';
import Fee from "../models/Fee.js";
import Notification from '../models/Notification.js';
import ResidentVerification from "../models/ResidentVerification.js";
import User from '../models/User.js';
// Thêm mới căn hộ
export const createApartment = async (req, res) => {
  try {
    // Tạo slug từ mã căn hộ nếu chưa có
    if (!req.body.slug && req.body.apartmentCode) {
      req.body.slug = req.body.apartmentCode.trim().toLowerCase().replace(/\s+/g, '-');
    }

    const apartment = new Apartment(req.body);
    await apartment.save();
    res.status(201).json(apartment);

  } catch (err) {
    // Lỗi trùng key (MongoDB code 11000)
    if (err.code === 11000) {
      return res.status(409).json({ message: "Căn hộ đã tồn tại" });
    }

    console.error("Create apartment error:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};


// Lấy tất cả căn hộ
export const getAllApartments = async (req, res) => {
  const page = parseInt(req.query.page);
  const pageSize = parseInt(req.query.pageSize);
  const status = req.query.status;
  const search = req.query.search?.trim() || "";

  try {
    let filter = {};

    // filter theo status
    if (status === "active") {
      filter.deletedAt = null;
    } else if (status === "deleted") {
      filter.deletedAt = { $ne: null };
    }

    // search by ownerName
    if (search) {
      const regex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      filter.ownerName = { $regex: regex };
    }

    const total = await Apartment.countDocuments(filter);

    let query = Apartment.find(filter)
      .sort({ createdAt: -1 })
      .populate("isOwner", "name phone")
      .populate("isRenter", "name phone");

    // nếu có phân trang thì mới skip + limit
    if (page && pageSize) {
      query = query.skip((page - 1) * pageSize).limit(pageSize);
    }

    const apartments = await query;

    res.json({
      data: apartments,
      total,
      page: page || 1,
      totalPages: pageSize ? Math.ceil(total / pageSize) : 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



// Lấy 1 căn hộ theo ID
export const getApartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }

    // ✅ populate đúng field có tồn tại trong schema
    const apartment = await Apartment.findById(id)
      .populate("isOwner", "name phone email")
      .populate("isRenter", "name phone email");

    if (!apartment) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }

    res.json(apartment);
  } catch (err) {
    console.error("🔥 Lỗi khi getApartmentById:", err);
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

    // Lấy tất cả căn hộ mà user là Owner hoặc Renter
    const apartments = await Apartment.find({
      $or: [
        { isOwner: userId },
        { isRenter: userId }
      ]
    })
      .populate('isOwner', 'name phone email')
      .populate('isRenter', 'name phone email')
      .lean(); // trả object plain để dễ thêm field mới

    if (!apartments || apartments.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ của bạn" });
    }

    // Lấy danh sách fees theo apartmentId
    const apartmentIds = apartments.map(a => a._id);
    const fees = await Fee.find({ apartmentId: { $in: apartmentIds } })
      .select('apartmentId paymentStatus')
      .lean();

    // Map fee theo apartmentId
    const feeMap = {};
    fees.forEach(fee => {
      feeMap[fee.apartmentId.toString()] = fee.paymentStatus;
    });

    // Thêm logic canPay và paymentStatus
    const result = apartments.map(apartment => {
      const isOwner = apartment.isOwner && apartment.isOwner._id.toString() === userId;
      const isRenter = apartment.isRenter && apartment.isRenter._id.toString() === userId;

      let canPay = false;

      if (isRenter) {
        canPay = true; // renter luôn thấy nút
      } else if (isOwner && !apartment.isRenter) {
        canPay = true; // owner chỉ thấy khi chưa có renter
      }

      return {
        ...apartment,
        paymentStatus: feeMap[apartment._id.toString()] || "unpaid",
        canPay
      };
    });

    res.json(result);

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

export const getApartmentHistory = async (req, res) => {
  try {
    const { code } = req.params;

    const history = await ResidentVerification.find({
      apartmentCode: code,
      status: "Đã duyệt"
    })
      .sort({ contractStart: -1 }) // mới nhất trước
      .populate("user", "name email phone"); // optional

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách phí theo mã căn hộ + logging
export const getFeesByApartmentCode = async (req, res) => {
  const { code } = req.params;

  try {
    console.log("[APARTMENTS] GET /:code/fees -> code:", code);

    // Nếu quên import Fee, typeof sẽ trả 'undefined' mà không crash
    if (typeof Fee === "undefined") {
      console.error("[APARTMENTS] Fee model is UNDEFINED. Kiểm tra đường dẫn import '../models/Fee.js'");
      return res.status(500).json({ message: "Fee model chưa được import. Kiểm tra server." });
    }

    console.time(`[APARTMENTS] Query fees for ${code}`);
    const fees = await Fee.find({ apartmentCode: code }).lean();
    console.timeEnd(`[APARTMENTS] Query fees for ${code}`);

    console.log(`[APARTMENTS] fees length = ${fees?.length || 0}`);
    if (fees?.length) {
      console.log("[APARTMENTS] First fee doc sample:", {
        _id: fees[0]._id,
        apartmentCode: fees[0].apartmentCode,
        month: fees[0].month,
        managementFee: fees[0].managementFee,
        waterFee: fees[0].waterFee,
        parkingFee: fees[0].parkingFee,
        total: fees[0].total,
        paymentStatus: fees[0].paymentStatus,
      });
    }

    // Nếu month là "MM/YYYY", sort về mới nhất trước
    const sorted = (fees || []).sort((a, b) => {
      const [ma, ya] = String(a.month || "").split("/");
      const [mb, yb] = String(b.month || "").split("/");
      const da = new Date(Number(ya) || 0, (Number(ma) || 1) - 1, 1);
      const db = new Date(Number(yb) || 0, (Number(mb) || 1) - 1, 1);
      return db - da; // desc
    });

    if (!sorted.length) {
      console.warn(`[APARTMENTS] Không có phí cho căn hộ: ${code}`);
      return res.status(200).json([]); // Trả về mảng rỗng thay vì 404
    }

    return res.json(sorted);
  } catch (err) {
    console.error("[APARTMENTS] getFeesByApartmentCode ERROR:", {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
    });
    return res.status(500).json({ message: "Lỗi server khi lấy phí", error: err?.message });
  }
};

