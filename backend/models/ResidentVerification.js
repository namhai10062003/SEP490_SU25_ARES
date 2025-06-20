import mongoose from 'mongoose';
const { Schema } = mongoose;
const ResidentVerificationSchema = new Schema({
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // optional if not always present
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },  // optional if not always present
    fullName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: false },
    apartmentCode: { type: String, required: true },
    documentType: { type: String, enum: ['Hợp đồng mua bán', 'Hợp đồng cho thuê', 'Giấy chủ quyền'], required: true },
    contractStart: { type: Date },
    contractEnd: { type: Date },
    documentImage: { type: String }, // use this if your data uses documentImage
    status: { type: String, enum: ['Chờ duyệt', 'Đã duyệt', 'Đã từ chối'], default: 'Chờ duyệt' },
    note: { type: String }
}, { timestamps: true });

const ResidentVerification = mongoose.model('ResidentVerification', ResidentVerificationSchema);
export default ResidentVerification;

