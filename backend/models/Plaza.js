import mongoose from "mongoose";
const { Schema } = mongoose;

const plazaSchema = new Schema({
  admin_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  description: { type: String, trim: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Plaza = mongoose.model("Plaza", plazaSchema);
export default Plaza;
