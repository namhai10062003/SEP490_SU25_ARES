import express from 'express';
import { login, register, verifynormal } from '../controllers/authController.js';
import verifyUser from '../middleware/authMiddleware.js';


const router = express.Router()

router.post('/login', login)
router.post('/verify', verifyUser, verifynormal)
router.post('/register', register)
export default router;