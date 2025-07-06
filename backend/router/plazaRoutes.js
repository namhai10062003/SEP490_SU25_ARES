import express from "express";
import { createPlaza, getPlazas } from "../controllers/plazaController.js";
import verifysUser from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", verifysUser,createPlaza);
router.get("/", verifysUser,getPlazas);

export default router;
