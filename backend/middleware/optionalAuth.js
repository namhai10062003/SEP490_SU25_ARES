// middleware/optionalAuth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    // Không có token → guest
    if (!token) {
      req.user = null;
      return next();
    }

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id || decoded.userId; // linh động key

    // Tìm user trong DB
    const user = await User.findById(userId).select("-password");

    // Nếu không tìm thấy user → guest
    req.user = user || null;
  } catch (err) {
    // Token lỗi / hết hạn → guest
    req.user = null;
  }

  next();
};
