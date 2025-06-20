// ✅ apartmentRoutes.js (ESM version)
import express from "express";
import { getPackage } from "../controllers/postPackageController.js"
const router = express.Router();

router.get("/get-postpackage", getPackage);
// router.get("/", getAllApartments);
// router.get("/:id", getApartmentById);
// router.put("/:id", updateApartment);
// router.delete("/:id", deleteApartment);
// router.post("/:id/assign-user", assignUserToApartment);

export default router;
