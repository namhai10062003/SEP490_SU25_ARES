import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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

    // Use timestamps to automatically manage createdAt and updatedAt fields, createAt not createdAT(sai chinh tả)
    // createAT: { type: Date, default: Date.now },
    // updateAT: { type: Date, default: Date.now },
    lastMessageTime: { type: Date, default: null },
    verified: { type: Boolean, default: false }, // Trạng thái xác thực email
    otp: { type: String }, // Mã OTP tạm thời
    otpExpires: { type: Date }, // Thời gian hết hạn OTP
    isOnline: { type: Boolean, default: false },
    // NEW FIELDS for google authentication
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null values
    },
    picture: {
        type: String, // Google profile picture URL
    },
    status: { type: Number, enum: [0, 1], default: 1 }, // 1: active, 0: blocked
    // NEW FIELDS END
    deletedAt: { type: Date, default: null }, // Soft delete
}, {
    timestamps: true    // Automatically manage createdAt and updatedAt fields
})
const User = mongoose.model("User", userSchema);
export default User;
