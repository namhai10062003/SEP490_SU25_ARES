import express from "express";
import { getExpenses, updateExpense, createExpense, deleteExpense } from "../controllers/expenseController.js";
const router = express.Router();

router.get("/", getExpenses);
router.post("/", createExpense);
router.put("/:type", updateExpense);
router.delete("/:type", deleteExpense);

export default router;