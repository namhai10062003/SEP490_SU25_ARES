import express from "express";
import { getAllResidentVerifications, getResidentVerificationById, approveResidentVerification, rejectResidentVerification } from "../controllers/residentVerificationController.js";

const router = express.Router();

router.get("/", getAllResidentVerifications);
router.get("/:id", getResidentVerificationById);
router.patch("/:id/approve", approveResidentVerification);
router.patch("/:id/reject", rejectResidentVerification);

export default router;