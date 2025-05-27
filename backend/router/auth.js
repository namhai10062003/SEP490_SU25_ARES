import express from 'express';
import { forgotPassword, login, register, resetPassword, verify, verifynormal } from '../controllers/authController.js';
import verifyUser from '../middleware/authMiddleware.js';


const router = express.Router()

router.post('/login', login)
router.post('/verify', verifyUser, verifynormal)
router.post('/register', register)
router.post("/verify-otp", verify); 
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
export default router;