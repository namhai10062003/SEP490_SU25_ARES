// middlewares/isAdmin.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Đảm bảo models/User.js export default

const isAdmin = async (req, res, next) => {
  try {
    /* 1. Lấy token từ header */
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token.' });
    }
    const token = authHeader.split(' ')[1];

    /* 2. Giải mã token */
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('❌ Token không hợp lệ:', err.message);
      return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    /* 3. Lấy _id người dùng */
    const userId = decoded._id;
    if (!userId) {
      return res.status(403).json({ message: 'Token không chứa thông tin người dùng.' });
    }

    /* 4. Tìm user trong DB */
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại.' });
    }

    /* 5. Kiểm tra quyền admin */
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền quản trị.' });
    }

    /* 6. Cho phép qua middleware */
    req.user = user;
    next();
    
  } catch (err) {
    console.error('❌ Lỗi trong middleware isAdmin:', err);
    res.status(500).json({ message: 'Lỗi server khi xác thực quyền admin.' });
  }
};

export default isAdmin;
