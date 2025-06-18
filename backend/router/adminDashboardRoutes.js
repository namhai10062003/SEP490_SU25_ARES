import express from "express";
import {
  countCustomers,
  countStaffs,
  countApartments,
} from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get("/stats/UsersList", countCustomers);
router.get("/stats/StaffsList", countStaffs);
router.get("/stats/ApartmentsList", countApartments);

export default router;
