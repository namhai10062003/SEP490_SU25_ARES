// routes/revenueRoutes.js
import express from "express";
import { getAllRevenueSummary } from "../controllers/revenueController.js";

const router = express.Router();

router.get("/all", getAllRevenueSummary);

export default router;
