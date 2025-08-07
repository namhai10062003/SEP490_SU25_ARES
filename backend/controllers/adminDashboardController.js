import Apartment from "../models/Apartment.js";
import Contact from "../models/Contact.js";
import Contract from "../models/Contract.js";
import Fee from "../models/Fee.js";
import Post from "../models/Post.js";
import Postpackage from "../models/Postpackage.js";
import ProfileUpdateRequest from "../models/ProfileUpdateRequest.js";
import Report from "../models/Report.js";
import ResidentVerification from "../models/ResidentVerification.js";
import User from "../models/User.js";
import WithdrawRequest from "../models/WithdrawRequest.js";

import {
  countTodayAndYesterday
} from "../helpers/countByDateHelper.js";


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

// Đếm tháng
export const countRevenueMonthly = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthlyData = await Fee.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          paymentDate: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$paymentDate" },
          total: { $sum: "$total" },
        },
      },
      {
        $project: {
          month: "$_id",
          total: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);

    const totalRevenue = monthlyData.reduce((acc, cur) => acc + cur.total, 0);

    res.status(200).json({ totalRevenue, monthlyData });
  } catch (err) {
    console.error("❌ Lỗi thống kê doanh thu:", err);
    res.status(500).json({ message: "Lỗi server khi thống kê doanh thu" });
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
// export const countReportsAndContacts = async (req, res) => {
//   try {
//     const totalReports = await Report.countDocuments();
//     const totalContacts = await Contact.countDocuments();
//     res.status(200).json({ total: totalReports + totalContacts });
//   } catch (err) {
//     console.error("❌ Lỗi đếm reports & contacts:", err);
//     res.status(500).json({ message: "Lỗi server khi đếm reports & contacts" });
//   }
// };

// Đếm tổng số báo cáo (Report)
export const countReports = async (req, res) => {
  try {
    const total = await Report.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi đếm reports:", err);
    res.status(500).json({ message: "Lỗi server khi đếm reports" });
  }
};

// Đếm tổng số liên hệ (Contact)
export const countContacts = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi đếm contacts:", err);
    res.status(500).json({ message: "Lỗi server khi đếm contacts" });
  }
};

// Đếm tổng số cập nhật Profile (Profile)
export const countProfiles = async (req, res) => {
  try {
    const total = await ProfileUpdateRequest.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi đếm profiles:", err);
    res.status(500).json({ message: "Lỗi server khi đếm profiles" });
  }
};

// Tính tổng doanh thu
export const calculateRevenue = async (req, res) => {
  try {
    const postRevenue = await Postpackage.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    console.log("💰 postRevenue:", postRevenue);

    const apartmentRevenue = await Apartment.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    console.log("💰 apartmentRevenue:", apartmentRevenue);

    const contractRevenue = await Contract.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    console.log("💰 contractRevenue:", contractRevenue);

    const total =
      (postRevenue[0]?.total || 0) +
      (apartmentRevenue[0]?.total || 0) +
      (contractRevenue[0]?.total || 0);

    console.log("💰 Tổng doanh thu:", total);

    res.status(200).json({ total });
  } catch (err) {
    console.error("❌ Lỗi tính revenue:", err);
    res.status(500).json({ message: "Lỗi server khi tính revenue" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find(); // hoặc logic theo yêu cầu
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách posts:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy tất cả Users (role customer)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "customer" });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error("❌ Lỗi khi lấy all users:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy tất cả Staffs
export const getAllStaffs = async (req, res) => {
  try {
    const staffs = await User.find({ role: "staff" });
    res.status(200).json({ success: true, data: staffs });
  } catch (err) {
    console.error("❌ Lỗi khi lấy all staffs:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy tất cả Apartments
export const getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find();
    res.status(200).json({ success: true, data: apartments });
  } catch (err) {
    console.error("❌ Lỗi khi lấy all apartments:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy tất cả Resident Verifications
export const getAllResidentVerifications = async (req, res) => {
  try {
    const verifications = await ResidentVerification.find();
    res.status(200).json({ success: true, data: verifications });
  } catch (err) {
    console.error("❌ Lỗi khi lấy all resident verifications:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy tất cả Withdraw Requests
export const getAllWithdrawRequests = async (req, res) => {
  try {
    const requests = await WithdrawRequest.find();
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    console.error("❌ Lỗi khi lấy all withdraw requests:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy tất cả Reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    console.error("❌ Lỗi khi lấy all reports:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy tất cả Contacts
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    console.error("❌ Lỗi khi lấy all contacts:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy tất cả Profiles
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await ProfileUpdateRequest.find();
    res.status(200).json({ success: true, data: profiles });
  } catch (err) {
    console.error("❌ Lỗi khi lấy all profiles:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// 👥 User (Customers)
export const countCustomersTodayAndYesterday = async (req, res) => {
  try {
    const counts = await countTodayAndYesterday(User, {
      role: "customer",
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    });
    res.status(200).json(counts);
  } catch (err) {
    console.error("❌ Lỗi countCustomersTodayAndYesterday:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 🧑‍💼 Staff
export const countStaffsTodayAndYesterday = async (req, res) => {
  try {
    const counts = await countTodayAndYesterday(User, { role: "staff" });
    res.status(200).json(counts);
  } catch (err) {
    console.error("❌ Lỗi countStaffsTodayAndYesterday:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 🏢 Apartment
export const countApartmentsTodayAndYesterday = async (req, res) => {
  try {
    const counts = await countTodayAndYesterday(Apartment);
    res.status(200).json(counts);
  } catch (err) {
    console.error("❌ Lỗi countApartmentsTodayAndYesterday:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 📝 Post
export const countPostsTodayAndYesterday = async (req, res) => {
  try {
    const counts = await countTodayAndYesterday(Post);
    res.status(200).json(counts);
  } catch (err) {
    console.error("❌ Lỗi countPostsTodayAndYesterday:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ✅ Resident Verification
export const countResidentVerificationsTodayAndYesterday = async (req, res) => {
  try {
    const counts = await countTodayAndYesterday(ResidentVerification);
    res.status(200).json(counts);
  } catch (err) {
    console.error("❌ Lỗi countResidentVerificationsTodayAndYesterday:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 💸 Withdraw Request
export const countWithdrawRequestsTodayAndYesterday = async (req, res) => {
  try {
    const counts = await countTodayAndYesterday(WithdrawRequest);
    res.status(200).json(counts);
  } catch (err) {
    console.error("❌ Lỗi countWithdrawRequestsTodayAndYesterday:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 📣 Report
export const countReportsTodayAndYesterday = async (req, res) => {
  try {
    const counts = await countTodayAndYesterday(Report);
    res.status(200).json(counts);
  } catch (err) {
    console.error("❌ Lỗi countReportsTodayAndYesterday:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 📩 Contact
export const countContactsTodayAndYesterday = async (req, res) => {
  try {
    const counts = await countTodayAndYesterday(Contact);
    res.status(200).json(counts);
  } catch (err) {
    console.error("❌ Lỗi countContactsTodayAndYesterday:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 📩 Profile
export const countProfilesTodayAndYesterday = async (req, res) => {
  try {
    const counts = await countTodayAndYesterday(ProfileUpdateRequest);
    res.status(200).json(counts);
  } catch (err) {
    console.error("❌ Lỗi countProfilesTodayAndYesterday:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const countByDataTypeTodayAndYesterday = async (req, res) => {
  const { dataType } = req.params;

  const map = {
    users: { model: User, filter: { role: "customer", $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] } },
    staffs: { model: User, filter: { role: "staff" } },
    apartments: { model: Apartment },
    posts: { model: Post },
    residentVerifications: { model: ResidentVerification },
    withdrawRequests: { model: WithdrawRequest },
    contacts: { model: Contact },
    reports: { model: Report },
    profiles: { model: ProfileUpdateRequest },
  };

  const entry = map[dataType];

  if (!entry) {
    return res.status(400).json({ error: "Loại dữ liệu không hợp lệ" });
  }

  try {
    const counts = await countTodayAndYesterday(entry.model, entry.filter || {});
    return res.status(200).json(counts);
  } catch (err) {
    console.error(`❌ Lỗi thống kê today/yesterday cho ${dataType}:`, err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getRevenueSummary = async (req, res) => {
  try {
    const posts = await Post.find({ paymentStatus: "paid" }).populate("Postpackage");
    const PACKAGE_PRICES = { VIP1: 10000, VIP2: 20000, VIP3: 30000 };

    console.log("📊 Bắt đầu tính toán doanh thu bài đăng:");

    const vip2Posts = posts.filter((p) => p.Postpackage?.type === "VIP2");
    const vip3Posts = posts.filter((p) => p.Postpackage?.type === "VIP3");

    vip2Posts.forEach((p) => {
      console.log(`✅ VIP2 | Post: ${p._id} | +${PACKAGE_PRICES.VIP2} | Ngày: ${new Date(p.paymentDate).toLocaleDateString()}`);
    });

    vip3Posts.forEach((p) => {
      console.log(`✅ VIP3 | Post: ${p._id} | +${PACKAGE_PRICES.VIP3} | Ngày: ${new Date(p.paymentDate).toLocaleDateString()}`);
    });

    const sumByType = (type) =>
      posts.filter((p) => p.Postpackage?.type === type).reduce((sum, p) => sum + (PACKAGE_PRICES[type] || 0), 0);

    console.log(`💰 Tổng tiền Quản lý căn hộ (VIP2): ${sumByType("VIP2").toLocaleString()}`);
    console.log(`💰 Tổng tiền Hợp đồng (VIP3): ${sumByType("VIP3").toLocaleString()}`);

    // ... tính toán doanh thu trả về client như cũ
    return res.status(200).json({
      postRevenue: sumByType("VIP1") + sumByType("VIP2") + sumByType("VIP3"),
      apartmentRevenue: sumByType("VIP2"),
      contractRevenue: sumByType("VIP3"),
      totalRevenue: sumByType("VIP1") + sumByType("VIP2") + sumByType("VIP3"),
    });
  } catch (err) {
    console.error("❌ Lỗi khi tính doanh thu:", err);
    return res.status(500).json({ error: "Server error" });
  }
};






