const mongoose = require('mongoose');
const { Schema } = mongoose;

const serviceSchema = new Schema({
  apartmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Apartment',
    required: true
  },
  serviceName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: Number,
    enum: [1, 2, 3], // 1: Phí rác, 2: Phí quản lý, 3: Phí bãi đỗ xe
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Service', serviceSchema);
