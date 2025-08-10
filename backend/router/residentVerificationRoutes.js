import express from "express";
import {
  approveResidentVerification,
  cancelPendingVerification,
  cancelResidentVerification,
  getAllResidentVerifications,
  getApartments,
  getResidentVerificationById,
  getUserWithApartment,
  rejectResidentVerification,
  searchUser,
  submitVerification, updateResidentVerification, updateResidentVerificationStatus
} from "../controllers/residentVerificationController.js";

import { upload2 } from '../db/cloudinary.js';

const router = express.Router();

router.get("/search-user", searchUser);
router.get("/apartments", getApartments);
router.post("/verification", upload2.array("documentImage", 5), submitVerification);
router.get("/", getAllResidentVerifications);
router.get("/get-user-apartment", getUserWithApartment);

router.get("/:id", getResidentVerificationById);
router.patch("/:id/approve", approveResidentVerification);
router.patch("/:id/reject", rejectResidentVerification);
router.patch("/:id/cancel", cancelResidentVerification);
router.patch("/:id/cancel-staff", cancelPendingVerification);
router.patch('/:id/status', updateResidentVerificationStatus);
router.put('/:id', upload2.array("documentImage", 5), updateResidentVerification);
export default router;
