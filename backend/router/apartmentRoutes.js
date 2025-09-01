// ✅ apartmentRoutes.js (ESM version)
import express from "express";
import {
  assignUserToApartment,
  createApartment,
  deleteApartment,
  getAllApartments,
  getApartmentById,
  getApartmentExpense,
  getApartmentHistory,
  getFeesByApartmentCode,
  getPaymentStatus,
  getUserApartment,
  togglePaymentStatus,
  updateApartment
} from "../controllers/apartmentController.js";
const router = express.Router();

router.post("/", createApartment);
router.get("/", getAllApartments);
router.get("/payment-status-all", getPaymentStatus);
router.get("/:id", getApartmentById);
router.put("/:id", updateApartment);
router.delete("/:id", deleteApartment);
router.post("/:id/assign-user", assignUserToApartment);
router.get('/my-apartment/:userId', getUserApartment);
router.get("/expense/:apartmentId", getApartmentExpense);
router.get("/history/:code", getApartmentHistory);
router.get("/:code/fees", getFeesByApartmentCode);
router.patch("/payment-status-all", togglePaymentStatus);

export default router;
