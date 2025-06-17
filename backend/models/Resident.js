import mongoose from 'mongoose';
const { Schema } = mongoose;

const residentSchema = new Schema({
  fullName:        { type: String, required: true },            // Họ tên
  gender:          { type: String, enum: ['Nam', 'Nữ'], required: true },
  dateOfBirth:     { type: Date },
  relationWithOwner:{ type: String },                           // Vợ, Con, ...
  moveInDate:      { type: Date },
  nationality:     { type: String, default: 'Việt Nam' },
  idNumber:        { type: String },                            // CMND/CCCD
  issueDate:       { type: Date },
  documentFront:   { type: String },                            // Ảnh CCCD trước
  documentBack:    { type: String },                            // Ảnh CCCD sau
  apartmentId:     { type: Schema.Types.ObjectId, ref: 'Apartment', required: true }
}, { timestamps: true });

export default mongoose.model('Resident', residentSchema);
