import mongoose from "mongoose";

const withdrawRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountHolder: { type: String, required: true },
    bankNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedAt: { type: Date },
    rejectedReason: { type: String }, // ⚠️ tên chính xác
  },
  { timestamps: true }
);

export default mongoose.model("WithdrawRequest", withdrawRequestSchema);
