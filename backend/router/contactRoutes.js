// routes/contact.route.js
import express from "express";
import {
  adminGetContacts,
  createContact,
  deleteContact,
  getAllContacts,
  updateContactStatus
} from "../controllers/contactController.js";
import verifysUser from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
const router = express.Router();

router.post("/",optionalAuth,createContact); // ✅ Dùng controller đã tách
router.get("/list", getAllContacts); // ✅ Dùng controller đã tách
router.delete("/list/:id", deleteContact); // ✅ Đã đúng
router.put("/list/:id/status", updateContactStatus); // ✅ Đã đúng
// Admin xem tất cả + filter
router.get("/admin", verifysUser, isAdmin, adminGetContacts);
export default router;
