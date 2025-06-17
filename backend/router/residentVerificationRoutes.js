import express from 'express';
import {
  searchUser,
  getApartments,
  submitVerification
} from '../controllers/residentVerificationController.js';

const router = express.Router();

router.get("/search-user", searchUser);
router.get("/apartments", getApartments);
router.post("/verify", submitVerification);

export default router;
