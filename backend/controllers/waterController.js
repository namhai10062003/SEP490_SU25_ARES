import xlsx from "xlsx";
import Apartment from "../models/Apartment.js";
import WaterUsage from "../models/WaterUsage.js";

// Chuyển số serial Excel thành chuỗi "yyyy-MM"
function excelDateToMonthString(value) {
  if (typeof value === "number") {
    const date = new Date((value - 25569) * 86400 * 1000); // Chuyển serial về timestamp
    return date.toISOString().slice(0, 7); // "yyyy-MM"
  }
  if (typeof value === "string") {
    // Nếu đã là chuỗi dạng "07/2025" hoặc "2025-07"
    const parts = value.split(/[\/\-]/);
    if (parts.length === 2) {
      const [month, year] = parts[0].length === 4 ? [parts[1], parts[0]] : parts;
      return `${year}-${month.padStart(2, "0")}`;
    }
  }
  return "N/A";
}

export const uploadWaterData = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // const result = await WaterUsage.deleteMany({});
    // console.log(`🗑 Đã xoá ${result.deletedCount} bản ghi cũ`);

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const saved = [];

    for (const row of rows) {
      const code = row["Căn hộ"]?.trim();
      const apartment = await Apartment.findOne({ apartmentCode: code });
      if (!apartment) continue;

      const monthRaw = row["Tháng"];
      const month = excelDateToMonthString(monthRaw);

      const start = Number(row["Chỉ số đầu kỳ"]);
      const end = Number(row["Chỉ số cuối kỳ"]);
      const usage = row["Số nước"] !== undefined ? Number(row["Số nước"]) : end - start;
      const unitPrice = Number(row["Đơn giá"]);
      const total = usage * unitPrice;

      let readingDate;
      const rawDate = row["Ngày ghi chỉ số"];

      if (typeof rawDate === "number") {
        const temp = new Date((rawDate - 25569) * 86400 * 1000);
        if (!isNaN(temp.getTime())) {
          readingDate = temp;
        }
      } else if (typeof rawDate === "string") {
        const temp = new Date(rawDate);
        if (!isNaN(temp.getTime())) {
          readingDate = temp;
        }
      }

      // Kiểm tra trùng (apartment + month)
      const existed = await WaterUsage.findOne({ apartment: apartment._id, month });
      if (existed) continue;

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
