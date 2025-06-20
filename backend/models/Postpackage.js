import mongoose from 'mongoose';
const { Schema } = mongoose; // ✅ Sửa lỗi này

const postPackageSchema = new Schema({
    type: {
      type: String,
      enum: ['VIP1', 'VIP2', 'VIP3', 'normal'],
      required: true,
    },
    price: { type: Number },
    expireAt: { type: Number },
})
const PostPackage = mongoose.model('PostPackage', postPackageSchema);
export default PostPackage;