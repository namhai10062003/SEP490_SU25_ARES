import express from 'express';
import { changePassword, blockUser, unBlockUser, deleteUser, getUserById, getUserProfileById, getUsers, getUsersDepartment, updateProfile } from '../controllers/userController.js';
import verifysUser from "../middleware/authMiddleware.js";
import { uploadProfileImage } from "../middleware/uploadProfileImage.js";
const router = express.Router();

router.get('/', getUsers);
router.get('/get-user-apartment', getUsersDepartment);
router.get('/:id', getUserById);
router.patch('/block/:id', verifysUser, blockUser);
router.patch('/unblock/:id', verifysUser, unBlockUser);
router.delete('/:id', deleteUser);
//update profile 
router.patch("/updateprofile", verifysUser, uploadProfileImage, updateProfile);
//get profile 
router.get("/profile/:id", verifysUser, getUserProfileById);
//change password
router.patch("/changepassword", verifysUser, changePassword);
export default router;