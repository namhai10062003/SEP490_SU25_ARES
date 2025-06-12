import express from 'express';
import { forgotPassword, googleAuth, googleCallback, login, register, resetPassword, verifyUser } from '../controllers/authController.js';
import verifysUser from '../middleware/authMiddleware.js';
const router = express.Router()

router.post('/login', login)
router.post("/verify-otp",verifyUser);
router.post('/verify', verifysUser, verifyUser)
router.post('/register', register)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google", googleAuth)
router.post("/google/callback", googleCallback)

export default router;