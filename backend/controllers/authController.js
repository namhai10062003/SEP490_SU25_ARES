import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { loginGoogle } from '../services/auth.service.js';

dotenv.config();

// Cấu hình gửi email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});
// Gửi OTP qua email
const sendOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: email,
      subject: 'Xác thực tài khoản',
      text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
    });
    console.log('✅ OTP đã được gửi đến:', email);
  } catch (error) {
    console.error('❌ Lỗi gửi OTP:', error.message);
    throw new Error('Lỗi gửi OTP!');
  }
};
//forgotpassword
const forgotPassword = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res
        .status(400)
        .json({ success: false, error: 'Dữ liệu không hợp lệ!' });
    }

    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: 'Vui lòng nhập email!' });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: 'Email không tồn tại!' });
    }

    // Tạo OTP và lưu vào DB
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // OTP hết hạn sau 5 phút
    await user.save();

    // Gửi OTP qua email
    try {
      await sendOTP(email, otp);
    } catch (emailError) {
      console.error(
        '❌ Lỗi khi gửi email OTP:',
        emailError.message || emailError,
      );
      return res.status(500).json({
        success: false,
        error: 'Không thể gửi email OTP. Vui lòng thử lại sau!',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP đã được gửi đến email của bạn.',
    });
  } catch (error) {
    console.error(
      '❌ Lỗi server khi xử lý quên mật khẩu:',
      error.message || error,
    );
    return res
      .status(500)
      .json({ success: false, error: 'Đã xảy ra lỗi phía server.' });
  }
};
//reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Kiểm tra đủ thông tin
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ success: false, error: 'Thiếu thông tin cần thiết!' });
    }

    // Tìm user theo email
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: 'Email không tồn tại!' });
    }

    // Kiểm tra OTP và hạn sử dụng
    if (!user.otp || !user.otpExpires) {
      return res
        .status(400)
        .json({ success: false, error: 'OTP không hợp lệ!' });
    }

    if (user.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, error: 'Mã OTP không đúng!' });
    }

    if (user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, error: 'Mã OTP đã hết hạn!' });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật user
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Mật khẩu đã được cập nhật thành công!',
    });
  } catch (error) {
    console.error('❌ Lỗi đặt lại mật khẩu:', error.message || error);
    return res
      .status(500)
      .json({ success: false, error: 'Lỗi đặt lại mật khẩu!' });
  }
};

//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'Người dùng không tồn tại!' });
    }

    if (!user.verified) {
      return res
        .status(401)
        .json({ success: false, error: 'Tài khoản chưa xác thực email!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Sai mật khẩu!' });
    }
    user.isOnline = true;
    await user.save();
    const token = jwt.sign(
      { _id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '10d' },
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        isOnline: user.isOnline,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error.message);
    return res.status(500).json({ success: false, error: 'Lỗi đăng nhập!' });
  }
};

// verify email
const verify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, error: 'Thiếu email hoặc OTP!' });
    }

    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: 'Email không tồn tại!' });
    }

    if (user.verified) {
      return res
        .status(400)
        .json({ success: false, error: 'Tài khoản đã xác thực!' });
    }

    // Log để debug
    console.log('📨 OTP nhập:', otp);
    console.log('🧾 OTP lưu:', user.otp);
    console.log(
      '⏰ Hết hạn:',
      new Date(user.otpExpires),
      'Hiện tại:',
      new Date(),
    );

    // Kiểm tra OTP hợp lệ
    if (user.otp !== otp.trim() || Date.now() > user.otpExpires) {
      return res
        .status(400)
        .json({ success: false, error: 'OTP không hợp lệ hoặc đã hết hạn!' });
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    const token = jwt.sign(
      { _id: user._id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '10d' },
    );

    return res.status(200).json({
      success: true,
      message: 'Xác thực thành công!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi xác thực OTP:', error.message);
    return res.status(500).json({ success: false, error: 'Lỗi xác thực OTP!' });
  }
};
//verify normal
const verifynormal = async (req, res) => {
  try {
    // Lấy user từ middleware
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'Không tìm thấy người dùng!' });
    }

    return res.status(200).json({
      success: true,
      message: 'Token hợp lệ!',
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi xác minh token:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Lỗi xác minh token!' });
  }
};
// register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: 'Email đã tồn tại!' });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kiểm tra role hợp lệ
    const validRoles = ['customer', 'host'];
    const userRole = validRoles.includes(role) ? role : 'customer';

    // Tạo mã OTP và thời gian hết hạn
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 phút

    // Tạo người dùng mới
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      phone,
      verified: false,
      otp,
      otpExpires,
    });
    // Gán chính xác:
    // Gán chính xác:
    newUser.otp = otp;
    newUser.otpExpires = otpExpires;

    await newUser.save();

    // Gửi OTP qua email
    try {
      await sendOTP(email, otp);
    } catch (error) {
      await User.deleteOne({ email }); // Xóa nếu lỗi gửi OTP
      return res.status(500).json({ success: false, error: 'Lỗi gửi OTP!' });
    }

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! OTP đã được gửi đến email.',
      userId: newUser._id,
    });
  } catch (error) {
    console.error('❌ Lỗi đăng ký:', error.message);
    return res
      .status(500)
      .json({ success: false, error: 'Lỗi đăng ký tài khoản!' });
  }
};

// Google authentication
const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Google authorization code is required',
      });
    }

    // Check if user already exists with this Google ID
    const user = await loginGoogle({ idToken: token });

    // Generate JWT token (same format as your login function)
    const jwttoken = jwt.sign(
      { _id: user._id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '10d' },
    );
    // Send response in same format as your login function
    return res.status(200).json({
      success: true,
      token: jwttoken,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
      isOnline: user.isOnline,
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export {
  forgotPassword,
  login,
  register,
  resetPassword,
  verify,
  verifynormal,
  googleAuth,
};
