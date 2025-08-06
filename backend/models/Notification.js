import mongoose from 'mongoose';
const { Schema } = mongoose;

const notificationSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: String,
    message: String,
    data: mongoose.Schema.Types.Mixed, // 👈 chỗ để lưu các dữ liệu kèm theo
    read: { type: Boolean, default: false },
  }, { timestamps: true });
  
const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;    