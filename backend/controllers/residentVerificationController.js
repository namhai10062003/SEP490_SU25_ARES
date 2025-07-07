import Apartment from '../models/Apartment.js';
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
    const imageUrls = req.file?.path;
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
const getAllResidentVerifications = async (req, res) => {
  try {
    const forms = await ResidentVerification.find()
      .populate('staff', 'name email')
      .populate('user', '_id name email') // 👈 Bao gồm cả _id (userId)
      .populate('apartment', 'apartmentCode name');

    res.status(200).json(forms);
  } catch (err) {
    console.error("❌ Lỗi trong getAllResidentVerifications:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getResidentVerificationById = async (req, res) => {
  try {
    const form = await ResidentVerification.findById(req.params.id)
      .populate('staff', 'name email')
      .populate('user', 'name email')
      .populate('apartment', 'apartmentCode name');
    if (!form) return res.status(404).json({ error: "Resident verification not found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
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
    console.log("application.user:", application.user);


    const user = await User.findById(application.user);
    if (!user) return res.status(404).json({ error: "Không tìm thấy người dùng" });

    if (application.documentType === "Hợp đồng mua bán" || application.documentType === "ownership" || application.documentType === 'Giấy chủ quyền') {
      // Transfer ownership, clear renter
      apartment.ownerName = application.fullName;
      apartment.ownerPhone = application.phone;
      apartment.isOwner = user._id;
      apartment.isRenter = null;
      apartment.status = "đang ở";
      apartment.legalDocuments = "sổ hồng"; // Đảm bảo có sổ
    } else if (application.documentType === "Hợp đồng cho thuê" || application.documentType === "rental") {
      if (apartment.isRenter) {
        return res.status(403).json({ error: "Căn hộ này đã có người thuê!" });
      }
      apartment.isRenter = user._id;     // <-- ObjectId
      apartment.status = "đang cho thuê";
      // Do not change owner info or isOwner
    } else {
      return res.status(400).json({ error: "Loại giấy tờ không hợp lệ" });
    }

    await apartment.save();

    application.status = "Đã duyệt";
    await application.save();
    // Notify user
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
export { approveResidentVerification, getAllResidentVerifications, getResidentVerificationById, rejectResidentVerification };

