import express from 'express';
import { blockUserAccount, blockUserFromPosting, changePassword, checkUserDependencies, deleteUser, getUserById, getUserProfileById, getUsers, getUsersDepartment, unBlockUserFromPosting, unblockUserAccount, updateProfile } from '../controllers/userController.js';
import verifysUser from "../middleware/authMiddleware.js";
import { uploadProfileAndCCCD } from "../middleware/uploadProfileImage.js";
const router = express.Router();

router.get('/',getUsers);
router.get('/get-user-apartment', getUsersDepartment);
router.get('/:id', getUserById);
router.patch('/block/:id', verifysUser, blockUserFromPosting);
router.patch('/unblock/:id', verifysUser, unBlockUserFromPosting);
router.patch('/blockAccount/:id', verifysUser, blockUserAccount);
router.patch('/unblockAccount/:id', verifysUser, unblockUserAccount);
router.get('/checkDependency/:id', verifysUser, checkUserDependencies);
router.delete('/:id', deleteUser);
//update profile 
router.patch("/updateprofile", verifysUser, uploadProfileAndCCCD, updateProfile);
//get profile 
router.get("/profile/:id", verifysUser, getUserProfileById);
//change password
router.patch("/changepassword", verifysUser, changePassword);
export default router;