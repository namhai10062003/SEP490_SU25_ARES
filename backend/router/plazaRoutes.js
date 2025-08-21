import express from "express";
import { getPlazaById, getPlazas } from "../controllers/plazaController.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

const router = express.Router();

// Lấy tất cả Plaza
router.get("/", optionalAuth,getPlazas);

// Lấy chi tiết 1 Plaza theo id
router.get("/:id", optionalAuth,getPlazaById);

export default router;
