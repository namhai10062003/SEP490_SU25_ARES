import mongoose from "mongoose";
const { Schema } = mongoose;

const expenseSchema = new Schema({
    type: { type: Number, enum: [1, 2, 3, 4], required: true }, // 1: tòa một, 2: tòa hai,...
    price: { type: Number, required: true },
    label: { type: String, required: true },
}, { timestamps: true });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;