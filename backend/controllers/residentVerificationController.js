import ResidentVerification from '../models/ResidentVerification.js';
import Apartment from '../models/Apartment.js';
import User from '../models/User.js';

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