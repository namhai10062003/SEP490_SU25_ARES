import User from "../models/User.js";
import Apartment from "../models/Apartment.js";
import Post from "../models/Post.js";
import ResidentVerification from "../models/ResidentVerification.js";
import WithdrawRequest from "../models/WithdrawRequest.js";
import Report from "../models/Report.js";
import Contact from "../models/Contact.js";
import PostPackage from "../models/PostPackage.js";
import Contract from "../models/Contract.js";
import Fee from "../models/Fee.js";

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

// Tính tổng doanh thu
export const calculateRevenue = async (req, res) => {
  try {
    const postRevenue = await PostPackage.aggregate([
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
