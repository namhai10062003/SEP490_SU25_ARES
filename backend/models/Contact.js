import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Nếu có bảng user
    default: null
  },
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
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Contact", contactSchema);
