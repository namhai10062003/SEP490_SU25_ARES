import ResidentVerification from '../models/ResidentVerification.js';
import Apartment from '../models/Apartment.js';
import User from '../models/User.js';

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
    console.log(req.body);
    const data = req.body
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
    res.status(500).json({ error: err.message });
  }
};

const getAllResidentVerifications = async (req, res) => {
    try {
        const forms = await ResidentVerification.find()
            .populate('staff', 'name email')
            .populate('user', 'name email')
            .populate('apartment', 'apartmentCode name');
        res.json(forms);
    } catch (err) {
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

        // Find the apartment
        const apartment = await Apartment.findOne({ apartmentCode: application.apartmentCode });
        if (!apartment) return res.status(404).json({ error: "Không tìm thấy căn hộ" });

        // Find the user
        const user = await User.findById(application.user);
        if (!user) return res.status(404).json({ error: "Không tìm thấy người dùng" });

        // Update apartment and user based on documentType
        if (application.documentType === "Hợp đồng mua bán") {
            apartment.ownerName = application.fullName;
            apartment.ownerPhone = application.phone;
            apartment.userId = user._id;
            apartment.status = "đang ở";
            apartment.isOwner = true;
            apartment.isRenter = false;
            await apartment.save();

            user.apartmentId = apartment._id;
            await user.save();
        } else if (application.documentType === "Hợp đồng cho thuê") {
            apartment.ownerName = application.fullName;
            apartment.ownerPhone = application.phone;
            apartment.userId = user._id;
            apartment.status = "đang cho thuê";
            apartment.isOwner = false;
            apartment.isRenter = true;
            await apartment.save();

            user.apartmentId = apartment._id;
            await user.save();
        } else {
            return res.status(400).json({ error: "Loại giấy tờ không hợp lệ" });
        }

        application.status = "Đã duyệt";
        await application.save();

        res.json({ success: true, message: "Đã duyệt đơn thành công!" });
    } catch (err) {
        res.status(500).json({ error: "Lỗi server khi duyệt đơn" });
    }
};

const rejectResidentVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await ResidentVerification.findById(id);
        if (!application) return res.status(404).json({ error: "Application not found" });

        // Update application status
        application.status = "Đã từ chối";
        await application.save();

        res.json({ success: true, message: "Đã từ chối đơn thành công!" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
export { getAllResidentVerifications, getResidentVerificationById, approveResidentVerification, rejectResidentVerification };