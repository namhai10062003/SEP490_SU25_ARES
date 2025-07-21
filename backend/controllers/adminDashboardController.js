import User from "../models/User.js";
import Apartment from "../models/Apartment.js";
import Post from "../models/Post.js";
import ResidentVerification from "../models/ResidentVerification.js";
import WithdrawRequest from "../models/WithdrawRequest.js";
import Report from "../models/Report.js";
import Contact from "../models/Contact.js";
import PostPackage from "../models/PostPackage.js";
import Contract from "../models/Contract.js";

// Đếm Customers
export const countCustomers = async (req, res) => {
  try {
    const total = await User.countDocuments({
      role: "customer",
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    });
    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi đếm customers:", err);
    res.status(500).json({ message: "Lỗi server khi đếm customers" });
  }
};

// Đếm Staffs
export const countStaffs = async (req, res) => {
  try {
    const total = await User.countDocuments({ role: "staff" });
    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi đếm staffs:", err);
    res.status(500).json({ message: "Lỗi server khi đếm staffs" });
  }
};

// Đếm Apartments
export const countApartments = async (req, res) => {
  try {
    const total = await Apartment.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi đếm apartments:", err);
    res.status(500).json({ message: "Lỗi server khi đếm apartments" });
  }
};

// Đếm Posts
export const countPosts = async (req, res) => {
  try {
    const total = await Post.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi đếm posts:", err);
    res.status(500).json({ message: "Lỗi server khi đếm posts" });
  }
};

// Đếm Đơn xác nhận cư dân
export const countResidentVerifications = async (req, res) => {
  try {
    const total = await ResidentVerification.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi đếm resident verifications:", err);
    res.status(500).json({ message: "Lỗi server khi đếm resident verifications" });
  }
};

// Đếm Đơn rút tiền
export const countWithdrawRequests = async (req, res) => {
  try {
    const total = await WithdrawRequest.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi đếm withdraw requests:", err);
    res.status(500).json({ message: "Lỗi server khi đếm withdraw requests" });
  }
};

// Đếm Phản hồi (Report + Contact)
export const countReportsAndContacts = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const totalContacts = await Contact.countDocuments();
    res.status(200).json({ total: totalReports + totalContacts });
  } catch (err) {
    console.error("❌ Lỗi đếm reports & contacts:", err);
    res.status(500).json({ message: "Lỗi server khi đếm reports & contacts" });
  }
};

// Tính tổng doanh thu
export const calculateRevenue = async (req, res) => {
  try {
    const postRevenue = await PostPackage.aggregate([{ $group: { _id: null, total: { $sum: "$price" } } }]);
    const apartmentRevenue = await Apartment.aggregate([{ $group: { _id: null, total: { $sum: "$price" } } }]);
    const contractRevenue = await Contract.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]);

    const total =
      (postRevenue[0]?.total || 0) +
      (apartmentRevenue[0]?.total || 0) +
      (contractRevenue[0]?.total || 0);

    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi tính revenue:", err);
    res.status(500).json({ message: "Lỗi server khi tính revenue" });
  }
};
