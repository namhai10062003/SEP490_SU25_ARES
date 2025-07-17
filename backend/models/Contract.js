import mongoose from "mongoose";

const contractSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Bên thuê
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Bên cho thuê

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  agreed: { type: Boolean, default: false },

  fullNameA: String,
  cmndA: String,
  addressA: String,
  phoneA: String,
  emailA: String,

  fullNameB: String,
  cmndB: String,
  addressB: String,
  phoneB: String,
  emailB: String,
  
  contractTerms: String, // chứa nội dung điều khoản hợp đồng
  depositAmount: {
    type: Number,
    required: true,
  },
    // Trạng thái duyệt
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "expired"],
        default: "pending"
      },
    rejectionReason: { type: String },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed'],
      default: 'unpaid'
    },
    orderCode: {
      type: String,
    },
    paymentDate: {
      type: Date
    },
    apartmentCode: { type: String },
    withdrawableAmount: {
  type: Number,
  default: 0, // mặc định là 0 cho hợp đồng mới
},
}, { timestamps: true });

export default mongoose.model("Contract", contractSchema);
