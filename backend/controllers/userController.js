import bcrypt from "bcryptjs";
import { sendEmailNotification, sendSMSNotification } from '../helpers/notificationHelper.js';
import { emitNotification } from "../helpers/socketHelper.js";
import Notification from '../models/Notification.js';
import ProfileUpdateRequest from "../models/ProfileUpdateRequest.js";
import User from '../models/User.js';

// GET /api/users?page=1&limit=10&role=staff&status=1
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { deletedAt: null };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status !== undefined && req.query.status !== "") filter.status = Number(req.query.status);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password -otp -otpExpires'),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

export const getUsersDepartment = async (req, res) => {
  try {
    const users = await User.find({
      apartmentId: { $exists: true, $ne: null }
    }).populate('apartmentId');

    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy user nào có apartmentId",
        success: false,
        error: false,
        data: [],
      });
    }

    res.status(200).json({
      message: "Lấy danh sách user có apartmentId thành công",
      success: true,
      error: false,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server",
      success: false,
      error: true,
    });
  }
};

// Block or unblock user from posting
export const blockUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.status === 0) return res.status(200).json({
      message: "Tài khoản đã bị chặn đăng bài",
      error: false,
      success: true,
    });
    user.status = 0;
    await user.save();

    const message = `Tài khoản của bạn đã bị chặn đăng bài bởi admin. ${reason ? "Lý do: " + reason : "Vui lòng liên lạc với bộ phận hỗ trợ."}`;
    // --- SOCKET.IO NOTIFICATION ---
    const newNotification = await Notification.create({ userId: user._id, message });
    emitNotification(user._id, newNotification);

    // --- SEND EMAIL & SMS NOTIFICATION ---
    if (user.email) {
      await sendEmailNotification({
        to: user.email,
        subject: "Thông báo chặn đăng bài",
        text: message,
        html: `<b>${message}</b>`
      });
    }
    if (user.phone) {
      await sendSMSNotification({
        to: user.phone,
        body: '[ARES] ' + message // Prefix with [ARES] for SMS
      });
    }
    // --- END EMAIL & SMS NOTIFICATION ---

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};


export const unBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.status === 1) return res.status(200).json({
      message: "Tài khoản đã được mở chặn đăng bài",
      error: false,
      success: true,
    });
    user.status = 1;
    await user.save();

    const newNotification = await Notification.create({
      userId: user._id,
      message: 'Tài khoản của bạn đã được mở chặn đăng bài.'
    });
    // --- SOCKET.IO NOTIFICATION ---
    emitNotification(user._id, newNotification);

    // --- SEND EMAIL & SMS NOTIFICATION ---
    if (user.email) {
      await sendEmailNotification({
        to: user.email,
        subject: "Thông báo mở chặn đăng bài",
        text: "Tài khoản của bạn đã được mở chặn đăng bài.",
        html: "<b>Tài khoản của bạn đã được mở chặn đăng bài.</b>"
      });
    }
    if (user.phone) {
      await sendSMSNotification({
        to: user.phone,
        body: "[ARES] Tài khoản của bạn đã được mở chặn đăng bài."
      });
    }
    // --- END EMAIL & SMS NOTIFICATION ---
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    // --- EMAIL & SMS NOTIFICATION ---
    if (user.email) {
      await sendEmailNotification({
        to: user.email,
        subject: "Thông báo xoá tài khoản",
        text: "Tài khoản của bạn đã bị xoá.",
        html: "<b>Tài khoản của bạn đã bị xoá.</b>"
      });
    }
    if (user.phone) {
      await sendSMSNotification({
        to: user.phone,
        body: "Tài khoản của bạn đã bị xoá."
      });
    }
    // --- END EMAIL & SMS NOTIFICATION ---

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

// update profile 

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // 👉 Log để debug dữ liệu gửi từ frontend
    console.log("=== req.body ===");
    console.log(req.body);

    console.log("=== req.files ===");
    console.log(req.files);

    const {
      name,
      phone,
      gender,
      dob,
      address,
      identityNumber,
      bio,
      jobTitle,
    } = req.body;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    console.log("=== Thông tin người dùng hiện tại ===");
    console.log(currentUser);

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;
    if (dob !== undefined) updateData.dob = dob;
    if (address !== undefined) updateData.address = address;
    if (bio !== undefined) updateData.bio = bio;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;

    const profileImage = req.files?.profileImage?.[0]?.path;
    const cccdFrontImage = req.files?.cccdFrontImage?.[0]?.path;
    const cccdBackImage = req.files?.cccdBackImage?.[0]?.path;

    const changedCCCD = identityNumber && identityNumber !== currentUser.identityNumber;
    const changedProfileImage = profileImage && profileImage !== currentUser.profileImage;
    const hasCCCDImageChanged = !!(cccdFrontImage || cccdBackImage);

    const requiresApproval = changedCCCD || changedProfileImage || hasCCCDImageChanged;

    if (requiresApproval) {
      await ProfileUpdateRequest.deleteMany({ userId });
      await ProfileUpdateRequest.create({
        userId,
        newIdentityNumber: changedCCCD ? identityNumber : undefined,
        newProfileImage: changedProfileImage ? profileImage : undefined,
        newCccdFrontImage: cccdFrontImage,
        newCccdBackImage: cccdBackImage,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

    return res.status(200).json({
      message: requiresApproval
        ? "Đã cập nhật thông tin cơ bản. CCCD/ảnh đang chờ admin duyệt."
        : "Cập nhật hồ sơ thành công.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Lỗi cập nhật hồ sơ:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


export const getUserProfileById = async (req, res) => {
  try {
    const _id = req.params.id;

    if (!_id) {
      return res.status(400).json({ error: "Thiếu ID người dùng" });
    }

    const user = await User.findById(_id).select(
      'name phone gender dob address identityNumber jobTitle bio profileImage cccdFrontImage cccdBackImage'
    );

    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Lỗi khi lấy profile:", err.message);
    res.status(500).json({ error: "❌ Lỗi server", message: err.message });
  }
}; // ✅ Đã đóng hàm



// change mk 
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id; // Lấy ID từ middleware xác thực
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });

    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    const newNotification = await Notification.create({
      userId: user._id,
      message: 'Bạn đã đổi mật khẩu thành công'
    });
    emitNotification(user._id, newNotification);
    // --- EMAIL & SMS NOTIFICATION ---
    if (user.email) {
      await sendEmailNotification({
        to: user.email,
        subject: "Đổi mật khẩu",
        text: "Bạn vừa đổi mật khẩu thành công.",
        html: "<b>Bạn vừa đổi mật khẩu thành công.</b>"
      });
    }
    if (user.phone) {
      await sendSMSNotification({
        to: user.phone,
        body: "Bạn vừa đổi mật khẩu thành công."
      });
    }
    // --- END EMAIL & SMS NOTIFICATION ---
    await user.save();
    res.status(200).json({ message: "✅ Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err);
    res.status(500).json({ message: "❌ Lỗi server.", error: err.message });
  }
};
