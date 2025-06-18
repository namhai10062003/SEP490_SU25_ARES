import mongoose from 'mongoose';

const { Schema } = mongoose; // ✅ Sửa lỗi này

const apartmentSchema = new Schema({
  apartmentCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  floor: {
    type: Number,
    required: true
  },
  area: {
    type: Number,
    required: true
  },
  bedrooms: {
    type: Number,
    required: true
  },
  furniture: {
    type: String,
    enum: ['Đầy đủ', 'Cơ bản', 'Không có'],
    default: 'Không có'
  },
  status: {
    type: String,
    enum: ['đang ở', 'đang cho thuê', 'chưa có chủ sở hữu'],
    default: 'chưa có chủ sở hữu'
  },
  direction: {
    type: String,
    enum: ['Đông', 'Tây', 'Nam', 'Bắc'],
    required: true
  },
  building: {
    type: String,
    enum: ['Plaza 1', 'Plaza 2'],
    required: true
  },
  legalDocuments: {
    type: String,
    enum: ['sổ hồng', 'chưa có sổ'],
    required: true
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  ownerPhone: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isOwner: { type: Boolean, default: false }, //true là chủ nhà
  isRenter: { type: Boolean, default: false }, //true là người thuê
}, {
  timestamps: true
});

const Apartment = mongoose.model('Apartment', apartmentSchema);
export default Apartment;
