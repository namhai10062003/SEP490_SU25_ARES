import express from "express";
import {
  countCustomers,
  countStaffs,
  countApartments,
  countPosts,
  countResidentVerifications,
  countWithdrawRequests,
  // countReportsAndContacts,
  calculateRevenue,
  countContacts,
  countReports,
  countRevenueMonthly,
} from "../controllers/adminDashboardController.js";

const router = express.Router();

// Có sẵn
router.get("/stats/UsersList", countCustomers);
router.get("/stats/StaffsList", countStaffs);
router.get("/stats/ApartmentsList", countApartments);

// Thêm mới
router.get("/stats/PostsList", countPosts);
router.get("/stats/ResidentVerificationsList", countResidentVerifications);
router.get("/stats/WithdrawRequestsList", countWithdrawRequests);
// router.get("/stats/ReportsAndContactsList", countReportsAndContacts);
router.get("/stats/ContactsList", countContacts);
router.get("/stats/ReportsList", countReports);
router.get("/stats/RevenueMonthly", countRevenueMonthly);
router.get("/stats/Revenue", calculateRevenue);

export default router;
