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

    status: { type: Number, enum: [0, 1, 2], default: 1 }, // 1: active, 0: blocked from posting, 3: blocked completely cant login
    deletedAt: { type: Date, default: null }, // Soft delete
    // update profile 
    gender: {
      type: String,
      enum: ["male", "female", "other"], // đổi theo kiểu tiếng Anh
      default: "other",
    },
    dob: { type: Date },
    address: { type: String },
    identityNumber: { type: String },
    bio: { type: String },
    jobTitle: { type: String },
    cccdFrontImage: { type: String }, // ảnh CCCD mặt trước
    cccdBackImage: { type: String },  // ảnh CCCD mặt sau  
  },
  {
    timestamps: true, // Tự động createdAt & updatedAt
  }
);

const User = mongoose.model("User", userSchema);
export default User;
