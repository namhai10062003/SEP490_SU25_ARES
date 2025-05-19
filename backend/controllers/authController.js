import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(401).json({ success: false, error: "User not found" });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Wrong password" });
        }
     
        user.isOnline = true;
        await user.save();
        // Generate JWT token
        const token = jwt.sign(

            { _id: user._id, role: user.role , name: user.name},
            process.env.JWT_SECRET, 

            { expiresIn: "10d" }
        );

        // Send the response with the token and user details
        return res.status(200).json({

            success: true, 
            token, 
            user: { _id: user._id, name: user.name, role: user.role },
            isOnline: user.isOnline

        });

    } catch (error) {
        console.error("Login Error:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
    
}

const verifynormal = async (req, res) => {
  try {
    // Lấy user từ middleware
    const user = req.user; 

    if (!user) {
      return res.status(401).json({ success: false, error: "Không tìm thấy người dùng!" });
    }

    return res.status(200).json({
      success: true,
      message: "Token hợp lệ!",
      user: { _id: user._id, name: user.name, role: user.role, email: user.email },
    });

  } catch (error) {
    console.error("❌ Lỗi xác minh token:", error);
    return res.status(500).json({ success: false, error: "Lỗi xác minh token!" });
  }
};

const register = async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
  
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, error: "Email already exists" });
      }
  
      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Thiết lập role mặc định là 'customer'
      const userRole = "customer";
  
      // Tạo user mới
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: userRole,
        phone
      });
  
      // Lưu vào cơ sở dữ liệu
      await newUser.save();
  
      // Kiểm tra biến môi trường
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ success: false, error: "Missing JWT_SECRET in server configuration" });
      }
  
      // Tạo JWT token
      const token = jwt.sign(
        {
          id: newUser._id,
          name: newUser.name,
          role: newUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
  
      // Phản hồi thành công
      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: newUser._id,
          name: newUser.name,
          role: newUser.role
        }
      });
  
    } catch (error) {
      console.error("Register Error:", error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  };
  

export { login, register, verifynormal };

