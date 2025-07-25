// models/Resident.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const residentSchema = new Schema({
  fullName: { type: String, required: true },
  gender: { type: String, enum: ['Nam', 'Nữ'], required: true },
  dateOfBirth: { type: Date },
  relationWithOwner: { type: String },
  moveInDate: { type: Date },
  nationality: { type: String },
  idNumber: { type: String },
  issueDate: { type: Date },
  documentFront: { type: String },
  documentBack: { type: String },
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true },

  // ✅ Chỉ giữ verifiedByStaff
  verifiedByStaff: {
    type: String,
    enum: ["pending", "true", "false"],
    default: "pending",
  },
  
  //từ chối nữa 
  rejectReason: { type: String, default: null }, // 👈 thêm field này
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // 👈 cần có để liên kết
  rejectedAt: { type: Date, default: null },

}, { timestamps: true });

export default mongoose.model('Resident', residentSchema);
