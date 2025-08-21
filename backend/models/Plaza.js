import mongoose from "mongoose";

const plazaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    img: { type: String }, // ảnh đại diện

    // Thông tin chi tiết (tương tự object info bạn có)
    info: {
      investor: { type: String },
      totalCapital: { type: String },
      scale: { type: String },
      type: { type: String },
      floors: { type: Number },
      contractor: { type: String },
      totalArea: { type: String },
      constructionDensity: { type: String },
      completion: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Plaza || mongoose.model("Plaza", plazaSchema);
