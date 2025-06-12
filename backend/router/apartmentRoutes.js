// ✅ apartmentRoutes.js (ESM version)
import express from "express";
import {
  createApartment,
  getAllApartments,
  getApartmentById,
  updateApartment,
  deleteApartment,
  assignUserToApartment
} from "../controllers/apartmentController.js";

const router = express.Router();

router.post("/", createApartment);
router.get("/", getAllApartments);
router.get("/:id", getApartmentById);
router.put("/:id", updateApartment);
router.delete("/:id", deleteApartment);
router.post("/:id/assign-user", assignUserToApartment);

export default router;
