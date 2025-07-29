// models/Contact.js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "reviewed", "archived"],
    default: "pending"
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true // ⬅️ đảm bảo luôn có mặt trong document
  }
}, { timestamps: true });


export default mongoose.model("Contact", contactSchema);
