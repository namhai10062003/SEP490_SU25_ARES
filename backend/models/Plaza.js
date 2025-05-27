const mongoose = require('mongoose');
const { Schema } = mongoose;

const plazaSchema = new Schema({
  admin_id: {
    type: Schema.Types.ObjectId,
    ref: 'User', // hoặc 'Admin' nếu bạn có collection riêng
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // Đổi tên theo yêu cầu
});

module.exports = mongoose.model('Plaza', plazaSchema);
