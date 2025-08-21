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
import verifysUser from "../middleware/authMiddleware.js";
import isStaff from "../middleware/isStaff.js";
const router = express.Router();

router.get("/search-user", searchUser);
router.get("/apartments", getApartments);
router.post("/verification",isStaff ,upload2.array("documentImage", 5), submitVerification);
router.get("/", verifysUser,getAllResidentVerifications);
router.get("/get-user-apartment", isStaff,getUserWithApartment);

router.get("/:id", verifysUser,getResidentVerificationById);
router.patch("/:id/approve", verifysUser,approveResidentVerification);
router.patch("/:id/reject", verifysUser,rejectResidentVerification);
router.patch("/:id/cancel", verifysUser,cancelResidentVerification);
router.patch("/:id/cancel-staff", isStaff,cancelPendingVerification);
router.patch('/:id/status', isStaff,updateResidentVerificationStatus);
router.put('/:id',isStaff,upload2.array("documentImage", 5), updateResidentVerification);
export default router;
