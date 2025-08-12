import jwt from 'jsonwebtoken';
import { decrypt } from '../db/encryption.js';
import User from '../models/User.js';

function safeDecrypt(value, fieldName, postId) {
    const isHex = /^[0-9a-fA-F]+$/.test(value);
    if (!value || !isHex) return value;
    try {
        return decrypt(value);
    } catch (err) {
        console.warn(`⚠️ Không thể giải mã ${fieldName} (postId: ${postId}) - ${err.message}`);
        console.warn(new Error().stack);
        return value;
    }
}

const verifysUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        console.log("🛡️ Token:", token);
        if (!token) {
            return res.status(400).json({ success: false, error: "Token not provided" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 📝 Log bản gốc (chưa giải mã)
        console.log("🔓 Decoded token (raw):", decoded);

        if (!decoded || !decoded._id) {
            return res.status(401).json({ success: false, error: "Token not valid" });
        }

        // Giải mã CCCD trong token
        if (decoded.identityNumber) {
            const decryptedCCCD = safeDecrypt(decoded.identityNumber, "identityNumber (token)", decoded._id);
            console.log("🆔 CCCD giải mã từ token:", decryptedCCCD);
            decoded.identityNumber = decryptedCCCD;
        }

        // Tìm user từ DB
        const user = await User.findById(decoded._id).select('-password');

        // 📝 Log bản gốc (chưa giải mã)
        console.log("👤 User tìm được (raw):", user);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Giải mã CCCD từ DB
        if (user.identityNumber) {
            const decryptedCCCD_DB = safeDecrypt(user.identityNumber, "identityNumber (DB)", user._id);
            console.log("🆔 CCCD giải mã từ DB:", decryptedCCCD_DB);
            user.identityNumber = decryptedCCCD_DB;
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("❌ Lỗi trong verifysUser:", error.message);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

export default verifysUser;
