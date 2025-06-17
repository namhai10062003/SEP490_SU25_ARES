import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: String,
  email: String,
  phone: String,
  apartmentCode: String,
  documentType: String,
  contractStart: Date,
  contractEnd: Date,
  documentImage: String // URL ảnh upload (Cloudinary nếu có)
}, { timestamps: true });

export default mongoose.model('ResidentVerification', verificationSchema);
