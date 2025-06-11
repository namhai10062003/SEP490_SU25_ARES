import express from 'express';
import { getUsers, getUserById, changeUserStatus, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/:id/status', changeUserStatus);
router.delete('/:id', deleteUser);

export default router;