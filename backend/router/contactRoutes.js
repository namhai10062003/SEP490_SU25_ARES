// routes/contact.route.js
import express from "express";
import {
  deleteContact,
  createContact,
  getAllContacts,
  updateContactStatus, // ✅ Thêm dòng này
} from "../controllers/contactController.js";

const router = express.Router();

router.post("/", createContact); // ✅ Dùng controller đã tách
router.get("/list", getAllContacts); // ✅ Dùng controller đã tách
router.delete("/list/:id", deleteContact); // ✅ Đã đúng
router.put("/list/:id/status", updateContactStatus); // ✅ Đã đúng

export default router;
