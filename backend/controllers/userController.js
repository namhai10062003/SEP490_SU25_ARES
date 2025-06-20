import User from '../models/User.js';
import Notification from '../models/Notification.js';
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
export { getUsers, changeUserStatus, getUserById, deleteUser, getUsersDepartment };