import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Đảm bảo User.js export default

const isStaff = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token.' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('❌ Token không hợp lệ:', err.message);
      return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    // ⚠️ Fix tại đây: đổi id thành _id
    const userId = decoded._id;

    if (!userId) {
      console.error('❌ Token không chứa _id hợp lệ:', decoded);
      return res.status(403).json({ message: 'Token không chứa thông tin người dùng.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ Không tìm thấy người dùng với ID:', userId);
      return res.status(401).json({ message: 'Người dùng không tồn tại.' });
    }

    if (user.role !== 'staff') {
      return res.status(403).json({ message: 'Bạn không có quyền duyệt đăng ký.' });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error('❌ Lỗi trong middleware isStaff:', err);
    res.status(500).json({ message: 'Lỗi server khi xác thực quyền staff.' });
  }
};

export default isStaff;
