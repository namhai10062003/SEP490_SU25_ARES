import bcrypt from 'bcrypt';
import User from '../models/User.js';

// Lấy tất cả staff
const getAllStaff = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { role: "staff", deletedAt: null };

        if (req.query.status !== undefined && req.query.status !== "") {
            filter.status = Number(req.query.status);
        }

        if (req.query.email && String(req.query.email).trim() !== "") {
            // Không dùng escapeRegex nữa, chỉ dùng regex thường
            filter.email = { $regex: String(req.query.email).trim(), $options: "i" };
        }

        const [staff, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("-password -otp -otpExpires"),
            User.countDocuments(filter),
        ]);

        res.json({
            data: staff,
            page,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            totalItems: total,
        });
    } catch (err) {
        console.error("getAllStaff error:", err);
        res.status(500).json({ error: "Server error" });
    }
};


// Lấy 1 staff theo ID
const getStaffById = async (req, res) => {
    try {
        const staff = await User.findOne({ _id: req.params.id, role: "staff" });
        if (!staff) return res.status(404).json({ error: "Staff not found" });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// Tạo staff mới
const createStaff = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
        }
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: "Email đã tồn tại" });

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const staff = new User({
            name,
            email,
            password: hashedPassword,
            role: "staff",
            verified: true,
            status: 1,
        });
        await staff.save();
        res.status(201).json(staff);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// Cập nhật staff
const updateStaff = async (req, res) => {
    try {
        const { name, password } = req.body;
        const update = {};
        if (name) update.name = name;
        if (password) update.password = password; // Nên hash password ở production!
        const staff = await User.findOneAndUpdate(
            { _id: req.params.id, role: "staff" },
            { $set: update },
            { new: true }
        );
        if (!staff) return res.status(404).json({ error: "Staff not found" });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// Đổi trạng thái staff (active/block)
const changeStaffStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (typeof status !== "number" || ![0, 1, 2].includes(status)) {
            return res.status(400).json({ error: "Trạng thái không hợp lệ" });
        }
        const staff = await User.findOneAndUpdate(
            { _id: req.params.id, role: "staff" },
            { $set: { status } },
            { new: true }
        );
        if (!staff) return res.status(404).json({ error: "Staff not found" });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// Xóa staff
const deleteStaff = async (req, res) => {
    try {
        const staff = await User.findOneAndDelete({ _id: req.params.id, role: "staff" });
        if (!staff) return res.status(404).json({ error: "Staff not found" });
        res.json({ message: "Staff deleted" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
export {
    changeStaffStatus, createStaff, deleteStaff, getAllStaff,
    getStaffById, updateStaff
};
