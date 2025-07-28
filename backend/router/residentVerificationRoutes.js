import express from "express";
import {
  approveResidentVerification,
  cancelResidentVerification,
  getAllResidentVerifications,
  getApartments,
  getResidentVerificationById,
  getUserWithApartment,
  rejectResidentVerification,
  searchUser,
  submitVerification, updateResidentVerification
} from "../controllers/residentVerificationController.js";

import { upload2 } from '../db/cloudinary.js';

const router = express.Router();

router.get("/search-user", searchUser);
router.get("/apartments", getApartments);
router.post("/verification", upload2.single("documentImage"), submitVerification);
router.get("/", getAllResidentVerifications);
router.get("/get-user-apartment", getUserWithApartment);

router.get("/:id", getResidentVerificationById);
router.patch("/:id/approve", approveResidentVerification);
router.patch("/:id/reject", rejectResidentVerification);
router.patch("/:id/cancel", cancelResidentVerification);

router.put('/:id', upload2.single('documentImage'), updateResidentVerification);
export default router;
