import Expense from "../models/Expense.js";
import Apartment from "../models/Apartment.js";
import User from "../models/User.js"; // Nếu cần

// Lấy tất cả expenses (chưa bị xóa)
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ deletedAt: null });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Tạo mới expense
const createExpense = async (req, res) => {
    try {
        const { type, label, price } = req.body;
        const exists = await Expense.findOne({ type, label, deletedAt: null });
        if (exists) return res.status(400).json({ error: "Loại chi phí này với tên này đã tồn tại." });

        const expense = new Expense({ type, label, price });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật theo type
const updateExpense = async (req, res) => {
    try {
        const { type } = req.params;
        const { price } = req.body;

        const expense = await Expense.findOneAndUpdate(
            { type: Number(type), deletedAt: null },
            { price },
            { new: true }
        );
        if (!expense) return res.status(404).json({ error: "Expense not found" });
        res.json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa mềm theo ID
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findByIdAndUpdate(
            id,
            { deletedAt: new Date() },
            { new: true }
        );
        if (!expense) return res.status(404).json({ error: "Expense not found" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🔥 Lấy danh sách chi phí quản lý của user (dựa trên căn hộ)
const getUserManagementExpenses = async (req, res) => {
    try {
        const { userId } = req.params;

        // Lấy các căn hộ của user
        const apartments = await Apartment.find({ owner: userId });

        // Với mỗi căn hộ, tìm expense quản lý theo building
        const results = await Promise.all(apartments.map(async (apartment) => {
            const expense = await Expense.findOne({ type: 1, label: apartment.building, deletedAt: null });

            const amount = expense ? (expense.price * apartment.area) : 0;

            return {
                apartmentId: apartment._id,
                apartmentName: apartment.name,
                building: apartment.building,
                area: apartment.area,
                unitPrice: expense?.price || 0,
                amount
            };
        }));

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getUserManagementExpenses,
};
