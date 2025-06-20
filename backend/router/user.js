import express from 'express';
import { getUsers, getUserById, changeUserStatus, deleteUser, getUsersDepartment } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/get-user-apartment', getUsersDepartment);
router.get('/:id', getUserById);
router.patch('/:id/status', changeUserStatus);
router.delete('/:id', deleteUser);

export default router;