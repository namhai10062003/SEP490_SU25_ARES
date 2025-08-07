// controllers/revenueController.js
import Contract from "../models/Contract.js";
import Fee from "../models/Fee.js";
import Postpackage from "../models/Postpackage.js";

export const getAllRevenueSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const buildDateFilter = (field) => {
      if (!startDate && !endDate) return {};
      const filter = {};
      if (startDate) filter.$gte = new Date(startDate);
      if (endDate) filter.$lte = new Date(endDate);
      return { [field]: filter };
    };

    // 1️⃣ Doanh thu Bài Post (giả sử Postpackage có field paymentDate)
    const postRevenue = await Postpackage.aggregate([
      { $match: buildDateFilter("createdAt") },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    // 2️⃣ Doanh thu Căn hộ (chỉ lấy các đơn đã thanh toán)
    const apartmentRevenue = await Fee.aggregate([
      { $match: { paymentStatus: "paid", ...buildDateFilter("paymentDate") } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    // 3️⃣ Doanh thu Đặt cọc Hợp đồng
    const contractRevenue = await Contract.aggregate([
      { $match: buildDateFilter("createdAt") },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    res.status(200).json({
      postRevenue: postRevenue[0]?.total || 0,
      apartmentRevenue: apartmentRevenue[0]?.total || 0,
      contractRevenue: contractRevenue[0]?.total || 0,
      totalRevenue:
        (postRevenue[0]?.total || 0) +
        (apartmentRevenue[0]?.total || 0) +
        (contractRevenue[0]?.total || 0),
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy tổng doanh thu:", err);
    res.status(500).json({ message: "Lỗi server khi lấy tổng doanh thu" });
  }
};
