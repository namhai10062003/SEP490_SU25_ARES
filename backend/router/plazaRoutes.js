import express from "express";
import { getPlazas, getPlazaById } from "../controllers/plazaController.js";
import verifysUser from "../middleware/authMiddleware.js";

const router = express.Router();

// Lấy tất cả Plaza
router.get("/", getPlazas);

// Lấy chi tiết 1 Plaza theo id
router.get("/:id", getPlazaById);

export default router;
