import Apartment from '../models/Apartment.js';
import Fee from '../models/Fee.js';
import Notification from '../models/Notification.js';
import ResidentVerification from '../models/ResidentVerification.js';
import User from '../models/User.js';
// tạo một file ví dụ như config hay helper cho hai hàm này đi, đừng để ở đây rối
export const searchUser = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "Vui lòng cung cấp từ khóa tìm kiếm." });
    }

    const user = await User.findOne({
      $or: [
        { phone: { $regex: keyword, $options: "i" } },  // tìm gần đúng số điện thoại
        { email: { $regex: keyword, $options: "i" } } // tìm gần đúng theo email
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng phù hợp." });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("❌ Lỗi trong searchUser:", err.message);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
export const getApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find();
    res.json(apartments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const submitVerification = async (req, res) => {
  try {
    console.log("==== SUBMIT VERIFICATION ====");
    console.log("req.body:", req.body);
    const data = req.body;
    console.log("data.userId:", data.userId);
    const imageUrls = req.files?.map(file => file.path);
    console.log(imageUrls);

    const newVerification = new ResidentVerification({
      user: data.user,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      apartmentCode: data.apartmentCode,
      documentType: data.documentType,
      contractStart: data.contractStart,
      contractEnd: data.contractEnd,
      documentImage: imageUrls
    });
    await newVerification.save();
    console.log(newVerification);

    res.status(201).json({
      message: "Verification request created",
      success: true,
      error: false,
      data: newVerification,
    });
  } catch (err) {
    console.error("❌ Lỗi trong submitVerification:", err); // Log toàn bộ lỗi
    res.status(500).json({ error: err.message, detail: err });
  }
};

// const getAllResidentVerifications = async (req, res) => {
//   try {
//     const forms = await ResidentVerification.find()
//       .populate('staff', 'name email')
//       .populate('user', 'name email')
//       .populate('apartment', 'apartmentCode name');
//     res.json(forms);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// };

//get ALl residentVerification for admin
const getAllResidentVerifications = async (req, res) => {
  try {
    // Lấy các query params
    const {
      search = "",
      status = "",
      sort = "newest",
      page = 1,
      pageSize = 10,
    } = req.query;

    // Xây dựng filter object
    const filter = {};

    // Search theo tên, email, phone, apartmentCode, documentType
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { apartmentCode: searchRegex },
        { documentType: searchRegex },
      ];
    }

    // Filter theo status
    if (status && status !== "") {
      filter.status = status;
    }

    // Sắp xếp
    let sortObj = {};
    if (sort === "newest") {
      sortObj = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortObj = { createdAt: 1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.max(1, parseInt(pageSize));
    const skip = (pageNum - 1) * pageSizeNum;

    // Đếm tổng số bản ghi (cho FE biết tổng số trang)
    const total = await ResidentVerification.countDocuments(filter);

    // Query chính
    const forms = await ResidentVerification.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(pageSizeNum)
      .populate('staff', 'name email')
      .populate('user', '_id name email')
      .populate('apartment', 'apartmentCode name');

    res.status(200).json({
      data: forms,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages: Math.ceil(total / pageSizeNum) || 1,
    });
  } catch (err) {
    console.error("❌ Lỗi trong getAllResidentVerifications:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getResidentVerificationById = async (req, res) => {
  try {
    const id = req.params.id;
    const form = await ResidentVerification.findById(id)
      .populate("user", "-password")
      .populate("staff", "-password");

    if (!form) {
      return res.status(404).json({ error: "Không tìm thấy form xác minh cư dân" });
    }

    console.log("✅ Form đã tìm thấy:", form);
    console.log("🔑 Mã căn hộ:", form.apartmentCode);

    // Tìm căn hộ theo apartmentCode
    // Tìm thông tin căn hộ theo apartmentCode
    const apt = await Apartment.findOne({ apartmentCode: form.apartmentCode })
      .populate("isOwner", "-password")
      .populate("isRenter", "-password")
      .lean();

    if (!apt) {
      return res.status(404).json({ error: "Không có thông tin căn hộ liên kết" });
    }

    // Nếu tìm thấy thì gắn vào form
    if (apt) {
      form.owner = apt.isOwner;
      form.renter = apt.isRenter;
    }

    if (!apt) {
      console.log("❌ Không tìm thấy căn hộ:", form.apartmentCode);
      return res.status(404).json({ error: "Không có thông tin căn hộ liên kết" });
    }

    // Lấy tháng hiện tại
    const selectedMonth = req.query.month; // VD: '07/2025' từ FE truyền lên
    const now = new Date();
    const formattedMonth = selectedMonth || `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    console.log("🔍 Đang tìm phí với:", {
      apartmentCode: apt.apartmentCode,
      month: formattedMonth
    });

    // Tìm phí theo tháng hiện tại
    // Chỉ tìm đúng tháng được truyền vào, không fallback
    const fee = await Fee.findOne({
      apartmentCode: apt.apartmentCode,
      month: formattedMonth,
    }).lean();

    // Tìm các tháng chưa thanh toán (paymentStatus = 'unpaid') cho căn hộ
    const unpaidFees = await Fee.find({
      apartmentCode: apt.apartmentCode,
      paymentStatus: "unpaid",
    }).lean();


    if (!fee) {
      console.log(`⚠️ Không tìm thấy phí cho tháng ${formattedMonth}`);
    }
    if (!fee) {
      console.log("❌ Không tìm thấy bất kỳ phí nào cho căn hộ này.");
    } else {
      console.log("✅ Phí tìm thấy:", fee);
    }

    // Trả kết quả
    const result = {
      requestId: form._id,
      documentType: form.documentType,
      status: form.status,
      note: form.note,
      contractStart: form.contractStart,
      contractEnd: form.contractEnd,
      documentImage: form.documentImage,
      createdAt: form.createdAt,

      resident: {
        name: form.fullName,
        email: form.email,
        phone: form.phone,
      },

      apartment: {
        id: apt._id,
        code: apt.apartmentCode,
        floor: apt.floor,
        area: apt.area,
        furniture: apt.furniture,
        direction: apt.direction,
        status: apt.status,
      },

      owner: apt.isOwner ? {
        name: apt.isOwner.name,
        email: apt.isOwner.email,
        phone: apt.isOwner.phone,
      } : null,

      renter: apt.isRenter ? {
        name: apt.isRenter.name,
        email: apt.isRenter.email,
        phone: apt.isRenter.phone,
      } : null,

      unpaidFees: unpaidFees.map(f => ({
        month: f.month,
        managementFee: f.managementFee,
        waterFee: f.waterFee,
        parkingFee: f.parkingFee,
        total: f.total,
        status: f.paymentStatus,
      })),
    };

    // Lấy danh sách các tháng chưa thanh toán
    const unpaidMonths = unpaidFees.map(f => f.month);
    return res.json({
      success: true,
      data: {
        ...result,
        unpaidMonths, // thêm danh sách tháng chưa thanh toán
      }
    });

  } catch (error) {
    console.error("❌ Lỗi getResidentVerificationById:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const approveResidentVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await ResidentVerification.findById(id);
    if (!application) return res.status(404).json({ error: "Không tìm thấy đơn xác nhận cư dân" });

    if (application.status === "Đã duyệt")
      return res.status(400).json({ error: "Đơn này đã được duyệt, không thể duyệt lại." });
    if (application.status === "Đã từ chối")
      return res.status(400).json({ error: "Đơn này đã bị từ chối, không thể duyệt." });

    const apartment = await Apartment.findOne({ apartmentCode: application.apartmentCode });
    if (!apartment) return res.status(404).json({ error: "Không tìm thấy căn hộ" });

    const user = await User.findById(application.user);
    if (!user) return res.status(404).json({ error: "Không tìm thấy người dùng" });

    // 🔍 Kiểm tra các khoản phí chưa thanh toán
    // 🔍 Kiểm tra các khoản phí chưa thanh toán
    const unpaidFees = await Fee.find({
      apartmentCode: apartment.apartmentCode,
      paymentStatus: "unpaid",
    });

    if (unpaidFees.length > 0) {
      // ❌ Không gửi cho renter — chỉ gửi owner nếu có, nếu không thì gửi cho người nộp đơn
      let targetUserId = null;

      if (apartment.isOwner) {
        targetUserId = apartment.isOwner;
      } else {
        targetUserId = user._id; // người làm đơn
      }

      if (targetUserId) {
        await Notification.create({
          userId: targetUserId,
          message: `Vui lòng thanh toán đầy đủ các khoản phí trước khi xác nhận cư dân cho căn hộ ${apartment.apartmentCode}.`,
        });
      }

      return res.status(400).json({
        error: "Không thể duyệt đơn vì còn các khoản phí chưa thanh toán.",
        unpaidMonths: unpaidFees.map(f => f.month),
      });
    }

    // ✅ Nếu không còn phí chưa thanh toán thì tiến hành duyệt
    if (application.documentType === "Hợp đồng mua bán" || application.documentType === "ownership" || application.documentType === 'Giấy chủ quyền')
    // ADDED CHECK: nếu đã có owner khác (không phải applicant) thì không duyệt
    {
      if (apartment.isOwner && apartment.isOwner.toString() !== user._id.toString()) {
        return res.status(403).json({ error: "Căn hộ này đã có chủ sở hữu, không thể duyệt thành chủ mới." });
      }
      apartment.ownerName = application.fullName;
      apartment.ownerPhone = application.phone;
      apartment.isOwner = user._id;
      apartment.isRenter = null;
      apartment.status = "đang ở";
      apartment.legalDocuments = "sổ hồng";
    } else if (application.documentType === "Hợp đồng cho thuê" || application.documentType === "rental") {
      // if (apartment.isRenter) {
      //   return res.status(403).json({ error: "Căn hộ này đã có người thuê!" });
      // }
      // ADDED CHECK: không cho thuê nếu chưa có chủ
      if (!apartment.isOwner) {
        return res.status(403).json({ error: "Không thể duyệt cho thuê: căn hộ chưa có chủ sở hữu." });
      }
      // ADDED CHECK: nếu đã có renter khác (không phải applicant) thì không cho thuê
      if (apartment.isRenter && apartment.isRenter.toString() !== user._id.toString()) {
        return res.status(403).json({ error: "Căn hộ này đã có người thuê." });
      }
      // ADDED CHECK: chủ sở hữu không thể được duyệt thành renter
      if (apartment.isOwner && apartment.isOwner.toString() === user._id.toString()) {
        return res.status(403).json({ error: "Chủ sở hữu không thể được duyệt thành người thuê." });
      }
      apartment.isRenter = user._id;
      apartment.status = "đang cho thuê";
    } else {
      return res.status(400).json({ error: "Loại giấy tờ không hợp lệ" });
    }

    await apartment.save();

    application.status = "Đã duyệt";
    await application.save();

    // Gửi thông báo xác nhận duyệt
    await Notification.create({
      userId: user._id,
      message: `Đơn xác nhận cư dân của bạn cho căn hộ ${apartment.apartmentCode} đã được duyệt.`,
    });

    res.json({ success: true, message: "Đã duyệt đơn thành công!" });

  } catch (err) {
    console.error("Error approving resident verification:", err);
    res.status(500).json({ error: "Lỗi server khi duyệt đơn" });
  }
};

const getUserWithApartment = async (req, res) => {
  try {
    const apartments = await Apartment.find().lean();

    const result = await Promise.all(
      apartments.flatMap((apartment) => {
        const list = [];

        if (apartment.isOwner) {
          list.push({
            userId: apartment.isOwner,
            role: "Chủ hộ",
            apartmentCode: apartment.apartmentCode,
          });
        }

        if (apartment.isRenter) {
          list.push({
            userId: apartment.isRenter,
            role: "Người thuê",
            apartmentCode: apartment.apartmentCode,
          });
        }

        return list;
      }).map(async (entry) => {
        const user = await User.findById(entry.userId).lean();
        if (!user) return null;

        const verification = await ResidentVerification.findOne({ user: user._id }).lean();

        const status = verification?.status || "Chờ duyệt";
        const approvedAt = (status === "Đã duyệt" || status === "Đã từ chối")
          ? verification?.updatedAt
          : null;

        return {
          name: user.name,
          email: user.email,
          picture: user.picture,
          apartmentCode: entry.apartmentCode,
          role: entry.role,
          contractImage: verification?.documentImage || null,
          status,
          approvedAt,
        };
      })
    );

    const filteredResult = result.filter(item => item !== null);
    res.status(200).json({ success: true, data: filteredResult });
  } catch (err) {
    console.error("❌ Lỗi:", err);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};


const rejectResidentVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Ở trong body lúc reject request
    const application = await ResidentVerification.findById(id);
    if (!application) return res.status(404).json({ error: "Không tìm thấy đơn xác nhận cư dân" });

    if (application.status === "Đã duyệt")
      return res.status(400).json({ error: "Đơn này đã được duyệt, không thể từ chối." });
    if (application.status === "Đã từ chối")
      return res.status(400).json({ error: "Đơn này đã bị từ chối, không thể từ chối lại." });

    application.status = "Đã từ chối";
    await application.save();
    // Notify user with reason in message
    if (application.user) {
      const user = await User.findById(application.user);
      if (user) {
        await Notification.create({
          userId: user._id,
          message: `Đơn xác nhận cư dân của bạn cho căn hộ ${application.apartmentCode} đã bị từ chối. Lý do: ${reason || "Không có lý do cụ thể."}`,
        });
      }
    }
    res.json({ success: true, message: "Đã từ chối đơn thành công!" });
  } catch (err) {
    console.error("Error rejecting resident verification:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// hàm hủy hợp đồng cư dân
const cancelResidentVerification = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm đơn xác minh
    const verification = await ResidentVerification.findById(id);
    if (!verification) {
      return res.status(404).json({ error: "Không tìm thấy đơn xác minh" });
    }

    // Chỉ cho phép hủy nếu đã duyệt
    if (verification.status !== "Đã duyệt") {
      return res.status(400).json({ error: "Chỉ có thể hủy đơn đã được duyệt" });
    }

    // Nếu đơn này liên kết với một căn hộ, cập nhật trạng thái căn hộ
    if (verification.apartment) {
      const apartment = await Apartment.findById(verification.apartment);
      if (apartment) {
        apartment.status = "bỏ trống";
        await apartment.save();
      }
    }

    // Cập nhật trạng thái đơn thành cancelled
    verification.status = "Đã hủy bỏ";
    await verification.save();

    // Thông báo cho user nếu có
    if (verification.user) {
      const user = await User.findById(verification.user);
      if (user) {
        await Notification.create({
          userId: user._id,
          message: `Đơn xác nhận cư dân ${verification._id} ${verification.apartmentCode || "Không rõ căn hộ"} của bạn đã bị hủy.`,
        });
      }
    }

    return res.status(200).json({ message: "Hủy đơn xác minh thành công" });
  } catch (error) {
    console.error("Lỗi huỷ đơn xác minh:", error);
    return res.status(500).json({ error: "Lỗi server khi huỷ đơn" });
  }
};
// hàm hủy cho staff
const cancelPendingVerification = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm đơn xác minh
    const verification = await ResidentVerification.findById(id);
    if (!verification) {
      return res.status(404).json({ error: "Không tìm thấy đơn xác minh" });
    }

    // Chỉ cho phép hủy nếu đang pending
    if (verification.status !== "Chờ duyệt") {
      return res.status(400).json({ error: "Chỉ có thể hủy đơn đang chờ duyệt" });
    }

    // Cập nhật trạng thái thành cancelled
    verification.status = "Đã hủy bỏ";
    await verification.save();

    return res.status(200).json({ message: "Hủy đơn đang chờ duyệt thành công" });
  } catch (error) {
    console.error("Lỗi hủy đơn pending:", error);
    return res.status(500).json({ error: "Lỗi server khi hủy đơn pending" });
  }
};
// hàm chỉnh sửa hợp đồng cư dân 
export const updateResidentVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body };

    // Nếu có file ảnh mới
    if (req.file) {
      updateFields.documentImage = req.file.path || `/uploads/${req.file.filename}`;
    }

    // ✅ Xử lý đặc biệt với field user
    if (updateFields.user) {
      if (typeof updateFields.user === 'object' && updateFields.user._id) {
        updateFields.user = updateFields.user._id;
      }

      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(updateFields.user);
      if (!isValidObjectId) {
        delete updateFields.user;
      }
    }

    // 🔹 Nếu đang lưu thì đổi trạng thái về "Chờ duyệt"
    updateFields.status = "Chờ duyệt";

    const updated = await ResidentVerification.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin cư dân' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Lỗi cập nhật:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật' });
  }
};

export const updateResidentVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Thiếu trạng thái" });
    }

    const allowedStatuses = ['Chờ duyệt', 'Đã duyệt', 'Đã từ chối', 'Đã hủy bỏ', 'Đang chỉnh sửa'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const updated = await ResidentVerification.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy thông tin cư dân" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Lỗi đổi trạng thái:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi đổi trạng thái" });
  }
};


export { approveResidentVerification, cancelPendingVerification, cancelResidentVerification, getAllResidentVerifications, getResidentVerificationById, getUserWithApartment, rejectResidentVerification };

