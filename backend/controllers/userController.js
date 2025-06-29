import bcrypt from "bcryptjs";
import Notification from '../models/Notification.js';
import User from '../models/User.js';
// GET /api/users?page=1&limit=10&role=staff&status=1
const getUsers = async (req, res) => {
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
        res.status(500).json({ error: "Server error" });
    }
};

const getUsersDepartment = async (req, res) => {
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


// PATCH /api/users/:id/status
const changeUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (typeof status !== "number" || ![0, 1].includes(status)) {
            return res.status(400).json({ error: "Trạng thái không hợp lệ" });
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        ).select('-password -otp -otpExpires');
        if (!user) return res.status(404).json({ error: "User not found" });
        // --- SOCKET.IO NOTIFICATION ---
        if (status === 0 && global._io) {
            global._io.sockets.sockets.forEach((socket) => {
                if (socket.userId === user._id.toString()) {
                    socket.emit('blocked', { message: 'Tài khoản của bạn đã bị khóa bởi admin. Xin vui lòng liên lạc với bộ phận hỗ trợ.' });
                }
            });
        }
        // Save notification to DB
        await Notification.create({
            userId: user._id,
            message: 'Tài khoản của bạn đã bị khóa bởi admin. Xin vui lòng liên lạc với bộ phận hỗ trợ.'
        });
        // --- END SOCKET.IO NOTIFICATION ---
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -otp -otpExpires');
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { deletedAt: new Date() } },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// update profile 
export const updateProfile = async (req, res) => {
    try {
      const userId = req.user._id;
  
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
  
      const updateData = {
        name,
        phone,
        gender,
        dob,
        address,
        identityNumber,
        bio,
        jobTitle,
      };
  
      // Nếu có ảnh đại diện mới từ Cloudinary
      if (req.file && req.file.path) {
        updateData.profileImage = req.file.path;
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      );
  
      res.status(200).json({
        message: "Cập nhật hồ sơ thành công",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  };
  export const getUserProfileById = async (req, res) => {
    try {
      const _id = req.params.id;
  
      if (!_id) {
        return res.status(400).json({ error: "Thiếu ID người dùng" });
      }
  
      const user = await User.findById(_id).select(
        'name phone gender dob address identityNumber jobTitle bio profileImage'
      );
  
      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }
  
      res.status(200).json(user);
    } catch (err) {
      console.error("❌ Lỗi khi lấy profile:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  };
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
      await user.save();
  
      res.status(200).json({ message: "✅ Đổi mật khẩu thành công!" });
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      res.status(500).json({ message: "❌ Lỗi server." });
    }
  };

export { changeUserStatus, deleteUser, getUserById, getUsers, getUsersDepartment };

