import mongoose from "mongoose";
import Apartment from "../models/Apartment.js";
import Expense from "../models/Expense.js";
import Fee from "../models/Fee.js";
import ParkingRegistration from "../models/ParkingRegistration.js";
import WaterUsage from "../models/WaterUsage.js";

// Tính và lưu tất cả các phí theo tháng
const calculateAndSaveFees = async (req, res) => {
  try {
    const apartments = await Apartment.find().lean();
    const expenses = await Expense.find({ deletedAt: null }).lean();
    const waterUsages = await WaterUsage.find().populate("apartment").lean();
    const parkingRegs = await ParkingRegistration.find({ status: "approved" }).lean();

    const expenseMap = {};
    expenses.forEach((e) => {
      if (e.type === 1) expenseMap[e.label] = e; // phí quản lý theo tòa
    });

    const feeDocs = [];

    for (const apt of apartments) {
      const aptId = String(apt._id);
      const aptCode = apt.apartmentCode;
      const ownerName = apt.ownerName || "Chưa rõ";
      const building = apt.building;
      const area = apt.area || 0;

      const mgmtExpense = expenseMap[building];
      const managementFee = mgmtExpense ? mgmtExpense.price * area : 0;

      const waterForApt = waterUsages.filter((w) => String(w.apartment._id) === aptId);
      const parkingForApt = parkingRegs.filter((p) => String(p.apartmentId) === aptId);

      const months = new Set();

      // Gom các tháng có chi phí nước
      waterForApt.forEach((w) => {
        const [year, month] = w.month.split("-");
        const key = `${year}-${month.padStart(2, "0")}`;
        months.add(key);
      });

      // Gom các tháng đăng ký gửi xe
      parkingForApt.forEach((p) => {
        const start = new Date(p.registerDate);
        const end = new Date();
        const cur = new Date(start.getFullYear(), start.getMonth(), 1);

        while (cur <= end) {
          const key = `${cur.getFullYear()}-${(cur.getMonth() + 1).toString().padStart(2, "0")}`;
          months.add(key);
          cur.setMonth(cur.getMonth() + 1);
        }
      });

      if (months.size === 0) {
        feeDocs.push({
          apartmentId: apt._id,
          apartmentCode: aptCode,
          ownerName,
          month: "---",
          managementFee,
          waterFee: 0,
          parkingFee: 0,
          total: managementFee,
          paymentStatus: "unpaid",
          orderCode: null,
          paymentDate: null
        });
        continue;
      }

      for (const month of months) {
        const [y, m] = month.split("-");
        const monthDate = new Date(`${y}-${m}-01`);

        const waterFee = waterForApt.find((w) => w.month === `${y}-${m}`)?.total || 0;

        const parkingFee = parkingForApt.reduce((sum, p) => {
          const register = new Date(p.registerDate);
          const targetMonth = new Date(`${y}-${m}-01`);
          if (register <= targetMonth) {
            return sum + (p.price || 0);
          }
          return sum;
        }, 0);

        const total = managementFee + waterFee + parkingFee;

        feeDocs.push({
          apartmentId: apt._id,
          apartmentCode: aptCode,
          ownerName,
          month: `${m}/${y}`,
          monthDate,
          managementFee,
          waterFee,
          parkingFee,
          total,
          paymentStatus: "unpaid",
          orderCode: null,
          paymentDate: null
        });
      }
    }

    await Fee.deleteMany({});
    await Fee.insertMany(feeDocs);

    res.status(200).json({
      message: "Tính toán và lưu phí thành công",
      count: feeDocs.length,
      data: feeDocs,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tính và lưu phí:", err);
    res.status(500).json({ error: "Lỗi server khi tính toán phí" });
  }
};

const getAllFees = async (req, res) => {
  try {
    const data = await Fee.find().sort({ monthDate: -1 });
    res.json({ data });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách phí:", err);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách phí" });
  }
};

// Lấy tổng phí theo tháng của 1 căn hộ
const getMonthlyFeeByApartment = async (req, res) => {
  try {
    const { apartmentId } = req.params;

    if (!apartmentId) {
      return res.status(400).json({ success: false, message: "Thiếu apartmentId" });
    }

    const fees = await Fee.aggregate([
      { $match: { apartmentId: new mongoose.Types.ObjectId(apartmentId) } },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$total" },
          status: { $first: "$paymentStatus" }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          total: 1,
          paymentStatus: "$status"
        }
      },
      { $sort: { month: 1 } }
    ]);

    res.json({ success: true, data: fees });
  } catch (error) {
    console.error("❌ Lỗi khi lấy tổng phí từng tháng của căn hộ:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy chi tiết phí theo căn hộ và tháng
const getFeeByApartmentAndMonth = async (req, res) => {
  try {
    const { apartmentId, month } = req.params;
    const formattedMonth = `${month.slice(5, 7)}/${month.slice(0, 4)}`;

    const fee = await Fee.findOne({ apartmentId, month: formattedMonth });

    if (!fee) {
      return res.status(404).json({ message: "Không tìm thấy phí", success: false });
    }

    res.json({
      success: true,
      _id: fee._id,
      orderCode: fee.orderCode || null,
      ownerName: fee.ownerName || "Không rõ",
      month: fee.month,
      managementFee: fee.managementFee,
      waterFee: fee.waterFee,
      parkingFee: fee.parkingFee,
      total: fee.total,
      paymentStatus: fee.paymentStatus || "unpaid",
    });
  } catch (error) {
    console.error("❌ Lỗi getFeeByApartmentAndMonth:", error);
    res.status(500).json({ message: "Lỗi server", success: false });
  }
};

// Cập nhật phí gửi xe cho 1 tháng và căn hộ
const updateParkingFee = async (req, res) => {
  const { apartmentId, month } = req.params;
  const { parkingFee } = req.body;

  try {
    const fee = await Fee.findOneAndUpdate(
      { apartmentId, month },
      { $set: { parkingFee } },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: fee });
  } catch (err) {
    console.error("❌ Lỗi cập nhật phí gửi xe:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  calculateAndSaveFees,
  getAllFees,
  getMonthlyFeeByApartment,
  getFeeByApartmentAndMonth,
  updateParkingFee
};
