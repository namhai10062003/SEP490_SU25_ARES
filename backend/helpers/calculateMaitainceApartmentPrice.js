import Expense from "../models/Expense.js";

// Hàm async lấy phí bảo trì từ DB dựa trên building/label
export async function calcMaintenanceFee({ building, area }) {
    // Tìm expense có label trùng với building
    const expense = await Expense.findOne({ label: building });
    if (!expense) {
        console.error(`[calcMaintenanceFee] Không tìm thấy expense với label: "${building}"`);
        throw new Error(`Không tìm thấy expense với label: "${building}"`);
    }
    if (typeof expense.price !== "number" || isNaN(expense.price)) {
        console.error(`[calcMaintenanceFee] Giá trị price không hợp lệ cho label: "${building}"`);
        throw new Error(`Giá trị price không hợp lệ cho label: "${building}"`);
    }
    if (!area || isNaN(area)) {
        console.error(`[calcMaintenanceFee] Diện tích không hợp lệ: ${area}`);
        throw new Error(`Diện tích không hợp lệ: ${area}`);
    }
    // expense.price là giá 1m2
    return expense.price * area;
}