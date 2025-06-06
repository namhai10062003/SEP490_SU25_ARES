import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js"; // Đảm bảo file User.js cũng dùng ES Module

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env chính xác từ thư mục backend
dotenv.config({ path: path.join(__dirname, "..", ".env") });

console.log("✅ MONGO_URL:", process.env.MONGODB_URL);


mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists.");
      return mongoose.disconnect();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      name: "Admin Master",
      email: "admin@gmail.com",
      password: hashedPassword,
      phone: "0999999999",
      role: "admin",
      verified: true,
      isOnline: false,
    });

    await admin.save();
    console.log("✅ Admin user created!");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ Failed to create admin:", err);
  });
