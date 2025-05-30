const mongoose = require('mongoose');
const { Schema } = mongoose;

const apartmentSchema = new Schema({
  apartmentName: {
    type: String,
    required: true,
    trim: true
  },
  floor: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'rented'],
    default: 'available'
  },
  amenities: {
    type: [String],
    default: []
  },
  plazaId: {
    type: Schema.Types.ObjectId,
    ref: 'Plaza',
    required: true
  },
  staffId: {
    type: Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Apartment', apartmentSchema);
