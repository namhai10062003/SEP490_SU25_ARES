import mongoose from "mongoose";
import Apartment from "../models/Apartment.js";
import Expense from "../models/Expense.js";
import Fee from "../models/Fee.js"; // 🆕 Fee model mới
import ParkingRegistration from "../models/ParkingRegistration.js";
import WaterUsage from "../models/WaterUsage.js";
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

      // Gom các tháng có chi phí
      waterForApt.forEach((w) => {
        const [year, month] = w.month.split("-");
        const key = `${month}/${year}`;
        months.add(key);
      });

      // Gom các tháng đăng ký gửi xe (duyệt mỗi tháng từ ngày bắt đầu -> hiện tại)
      parkingForApt.forEach((p) => {
        const start = new Date(p.registerDate);
        const end = new Date(); // không dùng expireDate

        const cur = new Date(start.getFullYear(), start.getMonth(), 1);
        while (cur <= end) {
          const key = `${(cur.getMonth() + 1).toString().padStart(2, "0")}/${cur.getFullYear()}`;
          months.add(key);
          cur.setMonth(cur.getMonth() + 1);
        }
      });

      // Nếu không có tháng nào
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
            // 👇 Thêm các trường này
  paymentStatus: "unpaid",
  orderCode: null,
  paymentDate: null
        });
        continue;
      }

      for (const month of months) {
        const waterFee = waterForApt.find((w) => {const [year, mon] = w.month.split("-");
          const formatted = `${mon}/${year}`;
          return formatted === month;
        })?.total || 0;

        const matchingParking = parkingForApt.filter((p) => {
          const start = new Date(p.registerDate);
          const [m, y] = month.split("/");
          const check = new Date(`${y}-${m}-01`);
          return start <= check;
        });

        const parkingFee = matchingParking.reduce((sum, p) => sum + (p.price || 0), 0);

        const total = managementFee + waterFee + parkingFee;

        feeDocs.push({
          apartmentId: apt._id,
          apartmentCode: aptCode,
          ownerName,
          month,
          managementFee,
          waterFee,
          parkingFee,
          total,
            // 👇 Thêm các trường này
  paymentStatus: "unpaid",
  orderCode: null,
  paymentDate: null
        });
      }
    }

    // 🧹 Xoá dữ liệu cũ để tránh trùng lặp
     // 🧹 Xoá dữ liệu cũ để tránh trùng lặp
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
    const data = await Fee.find().sort({ month: -1 });
    res.json({ data });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách phí:", err);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách phí" });
  }
};
// hàm lấy tiền theo tháng 
export const getMonthlyFeeByApartment = async (req, res) => {
  try {
    const { apartmentId } = req.params;

    if (!apartmentId) {
      return res.status(400).json({ success: false, message: "Thiếu apartmentId" });
    }

    const fees = await Fee.aggregate([
      {
        $match: {
          apartmentId: new mongoose.Types.ObjectId(apartmentId)
        }
      },
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
// get ra dữ liệu của các phí 
export const getFeeByApartmentAndMonth = async (req, res) => {
  try {
    const { apartmentId, month } = req.params;

    const fee = await Fee.findOne({ apartmentId, month });
    if (!fee)
      return res.status(404).json({ message: "Không tìm thấy phí", success: false });

    res.json({
      success: true,
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

// tính phí gửi xe vào 
export const updateParkingFee = async (req, res) => {
  const { apartmentId, month } = req.params;
  const { parkingFee } = req.body;

  try {
    const fee = await Fee.findOneAndUpdate(
      { apartmentId, month }, // VD: month = "07/2025"
      { $set: { parkingFee } },
      { new: true, upsert: true } // tạo mới nếu chưa có
    );

    res.status(200).json({ success: true, data: fee });
  } catch (err) {
    console.error("❌ Lỗi cập nhật phí gửi xe:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export { calculateAndSaveFees, getAllFees };

