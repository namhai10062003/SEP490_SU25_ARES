import Notification from '../models/Notification.js';
import { emitToUsers } from '../helpers/socketHelper.js';
import User from '../models/User.js';

// Get all notifications for a user (most recent first)
const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
        if (!notification) return res.status(404).json({ error: "Notification not found" });
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

//Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.updateMany({ userId, read: false }, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);
        if (!notification) return res.status(404).json({ error: "Notification not found" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

const sendGlobalNotification = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({ error: "Vui lòng nhập nội dung thông báo." });
        }

        const users = await User.find({ deletedAt: null }, "_id");

        const createdAt = new Date();
        const notifications = users.map((user) => ({
            userId: user._id,
            message,
            createdAt,
            read: false,
        }));

        await Notification.insertMany(notifications);

        // Socket broadcast
        emitToUsers(users.map(u => u._id), "newNotification", { message, createdAt });

        res.json({ message: `Đã gửi thông báo đến ${users.length} người dùng.` });
    } catch (err) {
        console.error("Error sending global notification", err);
        res.status(500).json({ error: "Lỗi server." });
    }
};

const getAllNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * limit;

        const { from, to, email } = req.query;

        const filter = {};

        // Filter theo ngày
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) {
                const endOfDay = new Date(to);
                endOfDay.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = endOfDay;
            }
        }

        // Nếu có email => lookup userId
        if (email) {
            const users = await User.find({
                email: { $regex: email, $options: "i" },
            }).select("_id");
            const userIds = users.map(u => u._id);
            filter.userId = { $in: userIds };
        }

        const [total, notifications] = await Promise.all([
            Notification.countDocuments(filter),
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("userId", "email phone name")
        ]);

        res.json({ total, notifications });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

export {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendGlobalNotification,
    getAllNotifications,
};