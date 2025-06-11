import mongoose from 'mongoose';
const { Schema } = mongoose;

const parkingRegistrationSchema = new Schema({
  // Liên kết tới các bảng khác
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plazaId: { type: Schema.Types.ObjectId, ref: 'Plaza', required: true },
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true },
  serviceID: { type: Schema.Types.ObjectId, ref: 'Service', required: true },

  // Thông tin căn hộ và chủ sở hữu
  apartmentCode: { type: String, required: true },      // Mã căn hộ
  apartmentName: { type: String, required: true },      // Tên căn hộ
  owner: { type: String, required: true },              // Tên chủ sở hữu

  // Thông tin xe
  vehicleType: { type: String, enum: ['xe máy', 'ô tô'], required: true },
  licensePlate: { type: String, required: true },
  chassisNumber: { type: String },                      // Số khung (tùy chọn)
  engineNumber: { type: String },                       // Số máy (tùy chọn)

  // Thông tin đăng ký xe
  registeredCity: { type: String, required: true },     // Tỉnh/Thành phố
  registeredDistrict: { type: String, required: true }, // Quận/Huyện
  registerDate: { type: Date, required: true },         // Ngày đăng ký
  expireDate: { type: Date },                           // Ngày hết hạn (nếu có)

  // Giấy tờ xe
  documentFront: { type: String },                      // Ảnh giấy tờ mặt trước
  documentBack: { type: String },                       // Ảnh giấy tờ mặt sau

  // Trạng thái đăng ký
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  }

}, {
  timestamps: true // Tự động thêm createdAt & updatedAt
});

const ParkingRegistration = mongoose.model('ParkingRegistration', parkingRegistrationSchema);

export default ParkingRegistration;
