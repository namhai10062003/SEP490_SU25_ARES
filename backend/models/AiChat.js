import mongoose from "mongoose";
const { Schema } = mongoose;

const AiChatSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    {
      sender: { type: String, enum: ["user", "ai"], required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export default mongoose.model("AiChat", AiChatSchema);
