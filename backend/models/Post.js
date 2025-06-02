const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: ['ban', 'cho_thue', 'dich_vu'],
    required: true,
  },

  title: { type: String, required: true },
  description: { type: String },

  location: {
    province: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String, required: true },
  },

  property: {
    category: {
      type: String,
      enum: ['real_estate', 'apartment', 'parking_lot'],
      required: true,
    },
    realEstateId: { type: Schema.Types.ObjectId, ref: 'RealEstate' },
    apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment' },
    parkingLotId: { type: Schema.Types.ObjectId, ref: 'ParkingLot' },
    area: { type: Number, required: true },
    price: { type: Number, required: true },
    legalDocument: { type: String },
    interiorStatus: { type: String },
    amenities: [{ type: String }],
  },

  contactInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
  },

  images: [{ type: String }],

  postPackage: {
    type: {
      type: String,
      enum: ['VIP1', 'VIP2', 'VIP3', 'normal'],
      required: true,
    },
    price: { type: Number },
    expireAt: { type: Date },
  },

  status: {
    type: String,
    enum: ['active', 'pending', 'hidden'],
    default: 'pending',
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Post', PostSchema);
