import express from "express";
import { approveResidentVerification, getAllResidentVerifications, getApartments, getResidentVerificationById, rejectResidentVerification, searchUser, submitVerification } from "../controllers/residentVerificationController.js";
import { upload2 } from '../db/cloudinary.js';
const router = express.Router();

router.get("/search-user", searchUser);
router.get("/apartments", getApartments);
router.post("/verification", upload2.single("documentImage"), submitVerification);
router.get("/", getAllResidentVerifications);
router.get("/:id", getResidentVerificationById);
router.patch("/:id/approve", approveResidentVerification);
router.patch("/:id/reject", rejectResidentVerification);

export default router;