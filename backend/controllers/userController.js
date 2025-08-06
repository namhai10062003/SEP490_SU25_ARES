import bcrypt from "bcryptjs";
import { decrypt, encrypt } from "../db/encryption.js";
import { sendEmailNotification, sendSMSNotification } from '../helpers/notificationHelper.js';
import { emitNotification, emitToUser } from "../helpers/socketHelper.js";
import getUserDependencies from "../helpers/userDependencyChecker.js";
import Notification from '../models/Notification.js';
import ProfileUpdateRequest from "../models/ProfileUpdateRequest.js";
import User from '../models/User.js';

// GET /api/users?page=1&limit=10&role=staff&status=1
// controllers/userController.js (thay thế hàm getUsers hiện tại)
function escapeRegex(str) {
  // escape characters that have special meaning in regex
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { deletedAt: null };

    if (req.query.role) filter.role = req.query.role;
    if (req.query.status !== undefined && req.query.status !== "") {
      filter.status = Number(req.query.status);
    }

    // NEW: email search (partial, case-insensitive)
    if (req.query.email && String(req.query.email).trim() !== "") {
      const raw = String(req.query.email).trim();
      const safe = escapeRegex(raw); // prevents accidental regex injection
      filter.email = { $regex: safe, $options: "i" };
    }

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
      totalPages: Math.max(1, Math.ceil(total / limit)),
      total,
    });
  } catch (err) {
    console.error("getUsers error:", err);
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
export const blockUserFromPosting = async (req, res) => {
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
    emitToUser(user._id, "blocked_posting", { message });
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

export const unBlockUserFromPosting = async (req, res) => {
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
    emitToUser(user._id, "newNotification", { message });
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

// Block and unblock user from login
export const blockUserAccount = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.status === 2) {
      return res.status(200).json({ message: "Tài khoản đã bị khoá hoàn toàn" });
    }

    user.status = 2;
    await user.save();

    const message = `Tài khoản của bạn đã bị khoá vĩnh viễn. ${reason ? "Lý do: " + reason : "Vui lòng liên hệ admin để biết thêm chi tiết."}`;

    const newNotification = await Notification.create({ userId: user._id, message });

    emitNotification(user._id, newNotification);
    emitToUser(user._id, "blocked_account", { message });

    res.json({ message: "Đã khoá tài khoản hoàn toàn", user });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

export const unblockUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.status === 1) {
      return res.status(200).json({ message: "Tài khoản đã hoạt động" });
    }

    user.status = 1;
    await user.save();

    const message = "Tài khoản của bạn đã được mở khoá.";

    const newNotification = await Notification.create({ userId: user._id, message });

    emitNotification(user._id, newNotification);
    res.json({ message, user });
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
    const userId = req.params.id;

    // ✅ Kiểm tra dependencies
    const deps = await getUserDependencies(userId);
    if (deps.owns > 0 || deps.rents > 0 || deps.contractsAsTenant > 0 || deps.contractsAsLandlord > 0) {
      return res.status(400).json({
        message: `Không thể xoá. Người dùng này đang sở hữu ${deps.owns} căn hộ, thuê ${deps.rents} căn hộ, có ${deps.contractsAsTenant + deps.contractsAsLandlord} hợp đồng.`,
        dependencies: deps,
      });
    }

    // ✅ Soft delete user
    const user = await User.findByIdAndUpdate(
      userId,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

    res.status(200).json({ message: "Đã xoá người dùng.", user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá người dùng.", error: err.message });
  }
};
export const checkUserDependencies = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId, deletedAt: null });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

    const deps = await getUserDependencies(userId);
    return res.status(200).json({ message: "OK", dependencies: deps });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
// update profile 

// Hàm giải mã an toàn
function safeDecrypt(value) {
  const isHex = /^[0-9a-fA-F]+$/.test(value);
  if (!value || !isHex) return value; // Nếu không phải hex thì trả nguyên giá trị
  try {
    return decrypt(value);
  } catch (err) {
    console.warn("⚠️ Không thể giải mã CCCD:", err.message);
    return value;
  }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("=== req.body ===", req.body);
    console.log("=== req.files ===", req.files);

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

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Vui lòng nhập họ tên." });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    console.log("=== Thông tin người dùng hiện tại ===", currentUser);

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;

    if (dob !== undefined) {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ message: "Ngày sinh không hợp lệ." });
      }

      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const hasHadBirthdayThisYear =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() >= birthDate.getDate());
      const actualAge = hasHadBirthdayThisYear ? age : age - 1;

      if (actualAge < 18) {
        return res.status(400).json({ message: "Người dùng phải đủ 18 tuổi để cập nhật hồ sơ." });
      }

      updateData.dob = dob;
    }

    if (address !== undefined) updateData.address = address;
    if (bio !== undefined) updateData.bio = bio;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;

    const profileImage = req.files?.profileImage?.[0]?.path;
    const cccdFrontImage = req.files?.cccdFrontImage?.[0]?.path;
    const cccdBackImage = req.files?.cccdBackImage?.[0]?.path;

    // ✅ Giải mã CCCD hiện tại an toàn
    const oldIdentityNumber = safeDecrypt(currentUser.identityNumber);

    const changedCCCD = identityNumber && identityNumber !== oldIdentityNumber;
    const changedProfileImage = profileImage && profileImage !== currentUser.profileImage;
    const hasCCCDImageChanged = !!(cccdFrontImage || cccdBackImage);

    const requiresApproval = changedCCCD || changedProfileImage || hasCCCDImageChanged;

    if (requiresApproval) {
      await ProfileUpdateRequest.deleteMany({ userId });
      await ProfileUpdateRequest.create({
        userId,
        newIdentityNumber: changedCCCD ? encrypt(identityNumber) : undefined,
        newProfileImage: changedProfileImage ? profileImage : undefined,
        newCccdFrontImage: cccdFrontImage,
        newCccdBackImage: cccdBackImage,
      });
    }

    if (changedCCCD) {
      updateData.identityNumber = encrypt(identityNumber);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

    // ✅ Giải mã trước khi trả về
    updatedUser.identityNumber = safeDecrypt(updatedUser.identityNumber);

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
      "name phone gender dob address identityNumber jobTitle bio profileImage cccdFrontImage cccdBackImage"
    );

    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    // ✅ Giải mã CCCD trước khi trả về
    if (user.identityNumber) {
      try {
        user.identityNumber = decrypt(user.identityNumber);
      } catch (e) {
        console.warn("⚠️ Không thể giải mã CCCD:", e.message);
        user.identityNumber = null; // hoặc ẩn hẳn nếu lỗi giải mã
      }
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

    // Kiểm tra thông tin đầu vào
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    // Kiểm tra mật khẩu ít nhất 6 ký tự và không chứa khoảng trắng
    if (newPassword.length < 6 || /\s/.test(newPassword)) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự và không được chứa khoảng trắng."
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng." });
    }

    // Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res.status(400).json({ message: "Mật khẩu mới không được trùng với mật khẩu cũ." });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Gửi thông báo đổi mật khẩu thành công
    const newNotification = await Notification.create({
      userId: user._id,
      message: 'Bạn đã đổi mật khẩu thành công'
    });
    emitNotification(user._id, newNotification);

    // Gửi email nếu có
    if (user.email) {
      await sendEmailNotification({
        to: user.email,
        subject: "Đổi mật khẩu",
        text: "Bạn vừa đổi mật khẩu thành công.",
        html: "<b>Bạn vừa đổi mật khẩu thành công.</b>"
      });
    }

    // Gửi SMS nếu có
    if (user.phone) {
      await sendSMSNotification({
        to: user.phone,
        body: "Bạn vừa đổi mật khẩu thành công."
      });
    }

    await user.save();
    res.status(200).json({ message: "✅ Đổi mật khẩu thành công!" });

  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err);
    res.status(500).json({ message: "❌ Lỗi server.", error: err.message });
  }
};


