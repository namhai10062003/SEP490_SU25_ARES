// models/ResidenceDeclaration.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const residenceDeclarationSchema = new Schema({
  type: { 
    type: String, 
    enum: ['Tạm trú / Tạm vắng'], 
    default: 'Tạm trú / Tạm vắng', 
    required: true 
  },

  fullName: { type: String, required: true },
  gender: { type: String, enum: ['Nam', 'Nữ'], required: true },
  dateOfBirth: { type: Date },
  relationWithOwner: { type: String },
  nationality: { type: String },
  idNumber: { type: String , required: true }, // sẽ mã hóa khi lưu
  // issueDate: { type: Date },

  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true },

  startDate: { type: Date, required: true }, // thời gian bắt đầu
  endDate: { type: Date, required: true },   // thời gian kết thúc

  documentImage: { type: String, required: true }, // chỉ 1 ảnh

  verifiedByStaff: {
    type: String,
    enum: ["pending", "true", "false", "expired"],
    default: "pending",
  },

  rejectReason: { type: String, default: null },
  rejectedAt: { type: Date, default: null },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

}, { timestamps: true });

export default mongoose.models.ResidenceDeclaration ||
  mongoose.model('ResidenceDeclaration', residenceDeclarationSchema);
