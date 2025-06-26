import Expense from "../models/Expense.js";

// Get all expenses
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ deletedAt: null });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update expense by type
const updateExpense = async (req, res) => {
    try {
        const { type } = req.params;
        const { price } = req.body;
        const expense = await Expense.findOneAndUpdate(
            { type: Number(type) },
            { price },
            { new: true }
        );
        if (!expense) return res.status(404).json({ error: "Expense not found" });
        res.json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const createExpense = async (req, res) => {
    try {
        const { type, label, price } = req.body;
        // Prevent duplicate type+label
        const exists = await Expense.findOne({ type, label, deletedAt: null });
        if (exists) return res.status(400).json({ error: "Loại chi phí này với tên này đã tồn tại." });
        const expense = new Expense({ type, label, price });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
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
export {
    getExpenses,
    updateExpense,
    createExpense,
    deleteExpense
};  