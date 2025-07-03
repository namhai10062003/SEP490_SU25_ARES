import express from "express";
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getUserManagementExpenses
} from "../controllers/expenseController.js";

const router = express.Router();

router.get("/", getExpenses);
router.post("/", createExpense);
router.put("/:type", updateExpense);
router.delete("/:id", deleteExpense); // ← đổi lại đúng với controller

// 🚀 API mới: Lấy chi phí theo user
router.get("/user/:userId", getUserManagementExpenses);

export default router;
