import express from "express";
import {
    createExpense,
    deleteExpense,
    getExpenses,
    getUserManagementExpenses,
    updateExpense
} from "../controllers/expenseController.js";
import verifyUser from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", verifyUser,getExpenses);
router.post("/", verifyUser,createExpense);
router.put("/:type", verifyUser,updateExpense);
router.delete("/:id", verifyUser,deleteExpense); // ← đổi lại đúng với controller

// 🚀 API mới: Lấy chi phí theo user
router.get("/user/:userId", getUserManagementExpenses);

export default router;
