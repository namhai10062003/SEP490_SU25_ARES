import express from "express";
import {
  // Đếm tổng
  countCustomers,
  countStaffs,
  countApartments,
  countPosts,
  countResidentVerifications,
  countWithdrawRequests,
  countContacts,
  countReports,
  countRevenueMonthly,
  calculateRevenue,

  // Đếm theo ngày (so sánh hôm nay - hôm qua)
  countCustomersTodayAndYesterday,
  countStaffsTodayAndYesterday,
  countApartmentsTodayAndYesterday,
  countPostsTodayAndYesterday,
  countResidentVerificationsTodayAndYesterday,
  countWithdrawRequestsTodayAndYesterday,
  countContactsTodayAndYesterday,
  countReportsTodayAndYesterday,

  // Lấy toàn bộ
  getAllUsers,
  getAllStaffs,
  getAllApartments,
  getAllPosts,
  getAllResidentVerifications,
  getAllWithdrawRequests,
  getAllReports,
  getAllContacts,
} from "../controllers/adminDashboardController.js";

const router = express.Router();

// ----------- 📊 Tổng số ----------- //
router.get("/stats/UsersList", countCustomers);
router.get("/stats/StaffsList", countStaffs);
router.get("/stats/ApartmentsList", countApartments);
router.get("/stats/PostsList", countPosts);
router.get("/stats/ResidentVerificationsList", countResidentVerifications);
router.get("/stats/WithdrawRequestsList", countWithdrawRequests);
router.get("/stats/ContactsList", countContacts);
router.get("/stats/ReportsList", countReports);
router.get("/stats/RevenueMonthly", countRevenueMonthly);
router.get("/stats/Revenue", calculateRevenue);

// ----------- 📆 Đếm theo ngày (so sánh) ----------- //
router.get("/stats/customers-today-and-yesterday", countCustomersTodayAndYesterday);
router.get("/stats/staffs-today-and-yesterday", countStaffsTodayAndYesterday);
router.get("/stats/apartments-today-and-yesterday", countApartmentsTodayAndYesterday);
router.get("/stats/posts-today-and-yesterday", countPostsTodayAndYesterday);
router.get("/stats/resident-verifications-today-and-yesterday", countResidentVerificationsTodayAndYesterday);
router.get("/stats/withdraw-requests-today-and-yesterday", countWithdrawRequestsTodayAndYesterday);
router.get("/stats/contacts-today-and-yesterday", countContactsTodayAndYesterday);
router.get("/stats/reports-today-and-yesterday", countReportsTodayAndYesterday);


// ----------- 📥 Lấy toàn bộ dữ liệu ----------- //
router.get("/get-all-users", getAllUsers);
router.get("/get-all-staffs", getAllStaffs);
router.get("/get-all-apartments", getAllApartments);
router.get("/get-all-posts", getAllPosts);
router.get("/get-all-resident-verifications", getAllResidentVerifications);
router.get("/get-all-withdraw-requests", getAllWithdrawRequests);
router.get("/get-all-reports", getAllReports);
router.get("/get-all-contacts", getAllContacts);

export default router;
