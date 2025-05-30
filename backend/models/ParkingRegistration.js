const mongoose = require('mongoose');
const { Schema } = mongoose;

const ParkingRegistrationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },          // Người đăng ký
  plazaId: { type: Schema.Types.ObjectId, ref: 'Plaza', required: true },        // Chung cư
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true },// Căn hộ
  serviceID:{type: Schema.Types.ObjectId, ref: 'Service', required: true },

  slotInfo: {
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'reserved', 'occupied'],
      default: 'available'
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },

  vehicleInfo: {
    type: { type: String, enum: ['Xe máy', 'Ô tô'], required: true },
    licensePlate: { type: String, required: true },
    chassisNumber: { type: String },
    engineNumber: { type: String },
    ownerName: { type: String, required: true },
    registerLocation: {
      province: { type: String, required: true },
      district: { type: String, required: true }
    }
  },

  documents: {
    imageFront: { type: String },
    imageBack: { type: String }
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'expired', 'rejected', 'active'],
    default: 'pending'
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ParkingRegistration', ParkingRegistrationSchema);
