import mongoose from 'mongoose';
const { Schema } = mongoose;

const PostSchema = new Schema({
  type: {
    type: String,
    enum: ['ban', 'cho_thue', 'dich_vu'],
    required: true,
  },
  apartmentCode: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  // sửa lại thành address
  location: {
    type: String, required: true
  },
  // loại hình đăng tin
  property: {
    type: String,
    required: true,
  },
  area: { type: Number, required: false },
  price: { type: Number, required: true },
  legalDocument: { type: String },
  interiorStatus: { type: String },
  amenities: [{ type: String }],

  contactInfo: {
    type: Schema.Types.ObjectId, ref: 'User',
    required: true
  },
  // them plaza
  toaPlaza: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plaza' // trỏ tới model bạn vừa có
  },
  images: [{ type: String }],
  // tiền gói đăng tin
  postPackage: {
    type: Schema.Types.ObjectId, ref: 'PostPackage',
    required: true
  },
  // trạng thái của bài post
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'deleted', 'expired'],
    default: 'pending'
  },
  
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'failed'],
    default: 'unpaid'
  },
  orderCode: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  reasonreject: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: false
  },
  deletedAt: { type: Date, default: null },
  expiredDate: { type: Date },
  isEditing: { type: Boolean, default: false },
editingAt: { type: Date },
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

const Post = mongoose.model('Post', PostSchema);
export default Post;
