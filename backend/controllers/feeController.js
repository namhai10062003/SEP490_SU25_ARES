import Apartment from "../models/Apartment.js";
import Expense from "../models/Expense.js";
import WaterUsage from "../models/WaterUsage.js";
import ParkingRegistration from "../models/ParkingRegistration.js";

const getApartmentMonthlyFees = async (req, res) => {
  try {
    const apartments = await Apartment.find().lean();
    const expenses = await Expense.find({ deletedAt: null }).lean();
    const waterUsages = await WaterUsage.find().populate('apartment').lean();
    const parkingRegs = await ParkingRegistration.find({ status: "approved" }).lean();

    const expenseMap = {};
    expenses.forEach(e => {
      if (e.type === 1) expenseMap[e.label] = e; // Chỉ lấy loại phí quản lý
    });

    const results = [];

    for (const apt of apartments) {
      const aptId = String(apt._id);
      const aptCode = apt.apartmentCode;
      const ownerName = apt.ownerName || "Chưa rõ";
      const building = apt.building;
      const area = apt.area || 0;

      // Phí quản lý mặc định theo tòa nhà
      const mgmtExpense = expenseMap[building];
      const managementFee = mgmtExpense ? mgmtExpense.price * area : 0;

      // Lọc chi phí nước & gửi xe theo căn hộ
      const waterForApt = waterUsages.filter(w => String(w.apartment._id) === aptId);
      const parkingForApt = parkingRegs.filter(p => String(p.apartmentId) === aptId);

      // Gom tháng
      const months = new Set();
      waterForApt.forEach(w => months.add(w.month));
      parkingForApt.forEach(p => {
        const m = `${(p.registerDate.getMonth() + 1).toString().padStart(2, '0')}/${p.registerDate.getFullYear()}`;
        months.add(m);
      });

      if (months.size === 0) {
        // Nếu chưa phát sinh gì
        results.push({
          apartmentCode: aptCode,
          ownerName,
          month: "---",
          managementFee,
          waterFee: 0,
          parkingFee: 0,
          total: managementFee
        });
        continue;
      }

      // Tính từng tháng
      for (const month of months) {
        // Phí nước tháng đó
        const waterFee = waterForApt.find(w => w.month === month)?.total || 0;

        // Phí gửi xe tháng đó (tổng nhiều xe)
        const matchingParking = parkingForApt.filter(p => {
          const m = `${(p.registerDate.getMonth() + 1).toString().padStart(2, '0')}/${p.registerDate.getFullYear()}`;
          return m === month;
        });
        const parkingFee = matchingParking.reduce((sum, p) => sum + (p.price || 0), 0);

        const total = managementFee + waterFee + parkingFee;

        results.push({
          apartmentCode: aptCode,
          ownerName,
          month,
          managementFee,
          waterFee,
          parkingFee,
          total
        });
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Lỗi getApartmentMonthlyFees:", err);
    res.status(500).json({ error: "Lỗi tính toán chi phí" });
  }
};

export { getApartmentMonthlyFees };
