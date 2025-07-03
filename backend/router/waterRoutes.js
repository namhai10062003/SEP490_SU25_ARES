import express from "express";
import multer from "multer";
import { uploadWaterData, getWaterUsages } from "../controllers/waterController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), uploadWaterData);
router.get("/usage", getWaterUsages);

export default router;
