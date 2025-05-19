import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["admin", "customer", "host"],
        default: "customer", // Mặc định là "customer" nếu không nhập
    },
    profileImage: { type: String },
    phone: { type: String },
    createAT: { type: Date, default: Date.now },
    updateAT: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    lastMessageTime: { type: Date, default: null }
})

const User = mongoose.model("User", userSchema)
export default User;