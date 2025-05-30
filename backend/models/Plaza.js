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
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Plaza', plazaSchema);
