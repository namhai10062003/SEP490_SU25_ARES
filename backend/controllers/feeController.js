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
    const now = new Date();

    // Lấy hết các đăng ký đã APPROVED (không filter registerDate ở DB)
    const parkingRegs = await ParkingRegistration.find({
      status: "approved",
    }).lean();

    // Helpers
    const pad = (n) => n.toString().padStart(2, "0");
    const monthKeyFromDate = (d) => {
      const dd = new Date(d);
      if (isNaN(dd)) return null;
      return `${dd.getFullYear()}-${pad(dd.getMonth() + 1)}`; // YYYY-MM
    };
    const normalizeMonthKey = (raw) => {
      if (!raw) return null;
      if (typeof raw === "string") {
        const m1 = raw.match(/^(\d{4})-(\d{1,2})$/);
        if (m1) return `${m1[1]}-${pad(m1[2])}`;
        const m2 = raw.match(/^(\d{1,2})\/(\d{4})$/);
        if (m2) return `${m2[2]}-${pad(m2[1])}`;
      }
      return null;
    };
    const parsePrice = (v) => {
      if (v == null) return 0;
      const s = String(v).replace(/[^\d.-]/g, "");
      const n = Number(s);
      return isNaN(n) ? 0 : n;
    };
    const getAptIdFromParking = (p) => {
      if (!p) return "";
      if (p.apartmentId) return String(p.apartmentId);
      if (p.apartment && (p.apartment._id || p.apartment.id)) return String(p.apartment._id ?? p.apartment.id);
      if (typeof p.apartment === "string") return p.apartment;
      return "";
    };

    // expense map
    const expenseMap = {};
    expenses.forEach((e) => { if (e.type === 1) expenseMap[e.label] = e; });

    // group parking regs by apartmentId -> monthKey
    const parkingByApt = {};
    parkingRegs.forEach((p) => {
      const aptId = getAptIdFromParking(p);
      const regMonth = monthKeyFromDate(p.registerDate);
      if (!aptId || !regMonth) return;
      parkingByApt[aptId] = parkingByApt[aptId] || {};
      parkingByApt[aptId][regMonth] = parkingByApt[aptId][regMonth] || [];
      parkingByApt[aptId][regMonth].push(p);
    });

    const currentMonthKey = monthKeyFromDate(now);
    const feeDocs = [];

    // build fees
    for (const apt of apartments) {
      if (!apt.ownerName || apt.ownerName.trim() === "") {
        console.log(`⏭️ Bỏ qua căn hộ ${apt.apartmentCode} vì chưa có chủ hộ`);
        continue;
      }

      const aptId = String(apt._id);
      const aptCode = apt.apartmentCode;
      const ownerName = apt.ownerName || "Chưa rõ";
      const building = apt.building;
      const area = apt.area || 0;

      const mgmtExpense = expenseMap[building];
      const managementFee = mgmtExpense ? parsePrice(mgmtExpense.price) * area : 0;

      const waterForApt = waterUsages.filter((w) => String(w.apartment?._id ?? w.apartment ?? "") === aptId);

      // parking map for this apt
      const parkingMap = parkingByApt[aptId] || {};

      // months to bill: từ nước + các tháng đăng ký gửi xe <= currentMonthKey
      const months = new Set();
      waterForApt.forEach((w) => {
        const nk = normalizeMonthKey(w.month);
        if (nk) months.add(nk);
      });
      // thêm các tháng có đăng ký gửi xe (chỉ <= currentMonthKey)
      Object.keys(parkingMap).forEach((k) => {
        if (k <= currentMonthKey) months.add(k);
      });

      // nếu không có tháng -> chỉ QL
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
          paymentDate: null,
        });
        console.log(`ℹ️ ${aptCode} không có tháng sử dụng dịch vụ nào, chỉ tính phí quản lý`);
        continue;
      }

      // duyệt từng month
      for (const rawMonth of months) {
        const monthKey = normalizeMonthKey(rawMonth) || rawMonth;
        const [y, mRaw] = monthKey.split("-");
        const m = pad(mRaw);
        const monthDate = new Date(`${y}-${m}-01`);
        const waterFee = parsePrice(waterForApt.find((w) => normalizeMonthKey(w.month) === monthKey)?.total || 0);

        // cộng tất cả đăng ký gửi xe cho tháng đó
        const regsThisMonth = parkingMap[monthKey] || [];
        // Gom tất cả đăng ký gửi xe từ đầu đến tháng hiện tại
const allMonthsKeys = Object.keys(parkingMap).sort(); // YYYY-MM sort
const monthsUpToNow = allMonthsKeys.filter((k) => k <= monthKey);

let parkingFee = 0;
monthsUpToNow.forEach((mKey) => {
  const [yStr, mStr] = mKey.split("-");
  const m = parseInt(mStr, 10);
  const y = parseInt(yStr, 10);

  const regs = parkingMap[mKey] || [];
  regs.forEach((p) => {
    const price = parsePrice(p.price);
    parkingFee += price;
    console.log(
      `✅ [${aptCode}] Phí xe tháng ${m}/${y}: +${price} (từ ${new Date(p.registerDate).toString()}${
        p.plate ? `, biển: ${p.plate}` : ""
      })`
    );
  });
});

// In tổng cộng dồn
console.log(`💰 [${aptCode}] Tổng phí gửi xe cộng dồn đến ${m}/${y}: ${parkingFee}`);

        const total = managementFee + waterFee + parkingFee;
        console.log(`💰 [${aptCode}] Tổng phí tháng ${m}/${y} = ${total} (QL: ${managementFee} | Nước: ${waterFee} | Xe: ${parkingFee})`);

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
          paymentDate: null,
        });

        // debug: nếu có đăng ký nhưng parkingFee = 0 thì in chi tiết
        if (Object.keys(parkingMap).length > 0 && parkingFee === 0) {
          console.log(`⚠️ [DEBUG] ${aptCode} có đăng ký gửi xe nhưng tổng = 0 cho tháng ${monthKey}. parkingMap months = ${Object.keys(parkingMap).join(", ")}`);
        }
      }
    }

    // lưu xuống DB (cẩn thận ở production)
    await Fee.deleteMany({});
    await Fee.insertMany(feeDocs);

    console.log("✅ Đã tính và lưu xong tất cả phí. Tổng:", feeDocs.length);
    res.status(200).json({ message: "Tính toán và lưu phí thành công", count: feeDocs.length, data: feeDocs });
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
  getAllFees, getFeeByApartmentAndMonth, getMonthlyFeeByApartment, updateParkingFee
};

