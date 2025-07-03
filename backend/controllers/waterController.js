import xlsx from "xlsx";
import Apartment from "../models/Apartment.js";
import WaterUsage from "../models/WaterUsage.js";

// POST /water/upload
export const uploadWaterData = async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      await WaterUsage.deleteMany({});
      console.log("🗑 Đã xoá toàn bộ dữ liệu cũ");
  
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet);
  
      const saved = [];
  
      for (const row of rows) {
        const code = row["Căn hộ"]?.trim();
        const apartment = await Apartment.findOne({ apartmentCode: code });
        console.log("🔍 Tìm thấy căn hộ:", code, apartment);
        if (!apartment) continue;
  
        const month = row["Tháng"];
        const start = Number(row["Chỉ số đầu kỳ"]);
        const end = Number(row["Chỉ số cuối kỳ"]);
        const usage = row["Số nước"] !== undefined ? Number(row["Số nước"]) : end - start;
        const unitPrice = Number(row["Đơn giá"]);
        const total = usage * unitPrice;
        const readingDate = row["Ngày ghi chỉ số"] ? new Date(row["Ngày ghi chỉ số"]) : undefined;
  
        // ✅ Kiểm tra trùng (apartment + month)
        const existed = await WaterUsage.findOne({ apartment: apartment._id, month });
        if (existed) continue; // bỏ qua nếu đã có
  
        const record = await WaterUsage.create({
          apartment: apartment._id,
          month,
          readingDate,
          startIndex: start,
          endIndex: end,
          usage,
          unitPrice,
          total,
        });
        console.log("👉 Đã lưu:", record);
        saved.push(record);
      }
  
      res.json(saved);
    } catch (err) {
      console.error("Upload Water Error:", err);
      res.status(500).json({ error: "Lỗi xử lý file Excel" });
    }
  };
  
  

// GET /water/usage
export const getWaterUsages = async (req, res) => {
  try {
    const usages = await WaterUsage.find()
      .populate("apartment", "apartmentCode ownerName")
      .sort({ month: -1 });

    const result = usages.map(u => ({
      apartmentCode: u.apartment?.apartmentCode || "N/A",
      ownerName: u.apartment?.ownerName || "Chưa rõ",
      month: u.month,
      readingDate: u.readingDate?.toISOString().split("T")[0],
      usage: u.usage,
      unitPrice: u.unitPrice,
      total: u.total,
    }));

    res.json(result);
  } catch (err) {
    console.error("Fetch Water Usage Error:", err);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu nước" });
  }
};
