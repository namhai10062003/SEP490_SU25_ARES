import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },

    accountHolder: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },

    note: { type: String },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectReason: { type: String },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Refund", refundSchema);
