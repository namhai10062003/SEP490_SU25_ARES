import mongoose from "mongoose";
const { Schema, models, model } = mongoose;

const postPackageSchema = new Schema({
  type: {
    type: String,
    enum: ["VIP1", "VIP2", "VIP3", "normal"],
    required: true,
  },
  price: { type: Number },
  expireAt: { type: Number },
});

// ✅ Kiểm tra nếu model đã tồn tại thì dùng lại
export default models.PostPackage || model("PostPackage", postPackageSchema);
