import mongoose from "mongoose";
const { Schema } = mongoose;

const expenseSchema = new Schema({
    type: { type: Number, enum: [1, 2, 3, 4], required: true }, // 1: Maintenance, 2: Parking, etc.
    label: { type: String, required: true }, // e.g. "Plaza 1", "Xe máy"
    price: { type: Number, required: true },
    deletedAt: { type: Date, default: null }, // Soft delete
}, { timestamps: true });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;