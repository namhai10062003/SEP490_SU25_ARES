import Expense from "../models/Expense.js";

// Get all expenses
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
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
        // Prevent duplicate type
        const exists = await Expense.findOne({ type });
        if (exists) return res.status(400).json({ error: "Loại chi phí này đã tồn tại." });
        const expense = new Expense({ type, label, price });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const deleteExpense = async (req, res) => {
    try {
        const { type } = req.params;
        const deleted = await Expense.findOneAndDelete({ type: Number(type) });
        if (!deleted) return res.status(404).json({ error: "Không tìm thấy loại chi phí." });
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