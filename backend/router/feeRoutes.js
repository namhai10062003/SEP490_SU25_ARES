import express from "express";
import { getApartmentMonthlyFees } from "../controllers/feeController.js";

const router = express.Router();

router.get("/apartments", getApartmentMonthlyFees);

export default router;
