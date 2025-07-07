import mongoose from "mongoose";

const feeSchema = new mongoose.Schema({
  apartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Apartment",
    required: true,
  },
  apartmentCode: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  month: {
    type: String, // Ví dụ: "07/2025"
    required: true,
  },
  managementFee: {
    type: Number,
    default: 0,
  },
  waterFee: {
    type: Number,
    default: 0,
  },
  parkingFee: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

feeSchema.index({ apartmentId: 1, month: 1 }, { unique: true }); // tránh trùng dữ liệu mỗi tháng

export default mongoose.model("Fee", feeSchema);
