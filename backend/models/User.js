import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {

    /* ---------- THÊM apartmentId ---------- */
    // Liên kết tới collection Apartment (hoặc đổi sang String tuỳ use‑case)
    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      default: null, // ← bỏ nếu bạn muốn bắt buộc
    },
    /* -------------------------------------- */
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "customer", "staff"],
      default: "customer",
    },

    profileImage: { type: String },
    phone: { type: String },

    lastMessageTime: { type: Date, default: null },
    verified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    isOnline: { type: Boolean, default: false },

    // Google auth
    googleId: { type: String, unique: true, sparse: true },
    picture: { type: String },

    status: { type: Number, enum: [0, 1], default: 1 }, // 1: active, 0: blocked
    deletedAt: { type: Date, default: null }, // Soft delete
  },
  {
    timestamps: true, // Tự động createdAt & updatedAt
  }
);

const User = mongoose.model("User", userSchema);
export default User;
