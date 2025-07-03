import mongoose from "mongoose";

const waterUsageSchema = new mongoose.Schema({
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Apartment",
    required: true,
  },
  month: {
    type: String, // ví dụ: "07/2025"
    required: true,
  },
  readingDate: {
    type: Date, // đổi từ String sang Date cho chuẩn
  },
  startIndex: {
    type: Number, // Chỉ số đầu kỳ
    required: false,
  },
  endIndex: {
    type: Number, // Chỉ số cuối kỳ
    required: false,
  },
  usage: {
    type: Number, // Số nước m³
    required: true,
  },
  unitPrice: {
    type: Number, // VND / m³
    required: true,
  },
  total: {
    type: Number, // usage * unitPrice
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("waterusage", waterUsageSchema);
