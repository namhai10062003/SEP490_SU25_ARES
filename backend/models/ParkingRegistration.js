import mongoose from 'mongoose';
const { Schema } = mongoose;

const parkingRegistrationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true },
  apartmentCode: { type: String, required: true },
  slug: { type: String, required: true },
  owner: { type: String, required: true },
  ownerPhone: { type: String, required: true },

  vehicleType: { type: String, enum: ['xe máy', 'ô tô'], required: true },
  licensePlate: { type: String, required: true },
  chassisNumber: { type: String },
  engineNumber: { type: String },

  registeredCity: { type: String, required: true },
  registeredDistrict: { type: String, required: true },
  registerDate: { type: Date, required: true },
  expireDate: { type: Date },

  documentFront: { type: String },
  documentBack: { type: String },

  // Trường mới: giá cố định dựa theo loại xe
  price: { type: Number, required: true }, // sẽ được tự động set
  // 🔴 Thêm lý do từ chối
  rejectionReason: { type: String, default: null },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'], // ← thêm cancelled
    default: 'pending'
  }
}, {
  timestamps: true
});


// 🧠 Tính giá tự động trước khi lưu
parkingRegistrationSchema.pre('save', function (next) {
  if (this.vehicleType === 'ô tô') {
    this.price = 800000; // 800 nghìn đồng
  } else if (this.vehicleType === 'xe máy') {
    this.price = 80000; // 80 nghìn đồng
  }
  next();
});

const ParkingRegistration = mongoose.model('ParkingRegistration', parkingRegistrationSchema);

export default ParkingRegistration;
