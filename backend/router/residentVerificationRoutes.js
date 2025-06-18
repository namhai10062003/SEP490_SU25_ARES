import express from 'express';
import {
  searchUser,
  getApartments,
  submitVerification
} from '../controllers/residentVerificationController.js';
import { upload2 } from '../db/cloudinary.js';
const router = express.Router();

router.get("/search-user", searchUser);
router.get("/apartments", getApartments);
router.post("/verification", upload2.single("documentImage"), submitVerification);

export default router;
