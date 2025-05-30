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
    isOnline: { type: Boolean, default: false },
    lastMessageTime: { type: Date, default: null },
    verified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    //Google OAuth fields
    googleId: { type: String, unique: true, sparse: true },
    picture: { type: String },
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

const User = mongoose.model("User", userSchema);
export default User;
