import bcrypt from 'bcrypt';
import crypto from "crypto";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import jwt from 'jsonwebtoken';
import nodemailer from "nodemailer";
import User from '../models/User.js';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
// Cấu hình gửi email
const transporter = nodemailer.createTransport({
  service: "gmail",
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
      subject: "Xác thực tài khoản",
      text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
    });
    console.log("✅ OTP đã được gửi đến:", email);
  } catch (error) {
    console.error("❌ Lỗi gửi OTP:", error.message);
    throw new Error("Lỗi gửi OTP!");
  }

};
//forgotpassword
const forgotPassword = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ success: false, error: "Dữ liệu không hợp lệ!" });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Vui lòng nhập email!" });
    }

    const user = await User.findOne({ email: email.trim(), deletedAt: null });
    if (!user) {
      return res.status(400).json({ success: false, error: "Email không tồn tại!" });
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
      console.error("❌ Lỗi khi gửi email OTP:", emailError.message || emailError);
      return res.status(500).json({ success: false, error: "Không thể gửi email OTP. Vui lòng thử lại sau!" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP đã được gửi đến email của bạn.",
    });

  } catch (error) {
    console.error("❌ Lỗi server khi xử lý quên mật khẩu:", error.message || error);
    return res.status(500).json({ success: false, error: "Đã xảy ra lỗi phía server." });
  }
};
//reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Kiểm tra đủ thông tin
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: "Thiếu thông tin cần thiết!" });
    }

    // Tìm user theo email
    const user = await User.findOne({ email: email.trim(), deletedAt: null });
    if (!user) {
      return res.status(400).json({ success: false, error: "Email không tồn tại!" });
    }

    // Kiểm tra OTP và hạn sử dụng
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ success: false, error: "OTP không hợp lệ!" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, error: "Mã OTP không đúng!" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, error: "Mã OTP đã hết hạn!" });
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
      message: "Mật khẩu đã được cập nhật thành công!",
    });

  } catch (error) {
    console.error("❌ Lỗi đặt lại mật khẩu:", error.message || error);
    return res.status(500).json({ success: false, error: "Lỗi đặt lại mật khẩu!" });
  }
};

//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, error: "Người dùng không tồn tại!" });
    }

    if (!user.verified) {
      return res.status(401).json({ success: false, error: "Tài khoản chưa xác thực email!" });
    }

    // Deleted user check
    if (user.deletedAt !== null) {
      return res.status(403).json({
        success: false,
        error: "Tài khoản của bạn đã bị xóa. Vui lòng liên hệ admin@gmail.com để biết thêm chi tiết."
      });
    }

    // Blocked user check
    if (user.status === 0) {
      return res.status(403).json({
        success: false,
        error: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin@gmail.com để biết thêm chi tiết."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Sai mật khẩu!" });
    }
    user.isOnline = true;
    await user.save();
    const token = jwt.sign(
      { _id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, role: user.role, isOnline: user.isOnline },
    });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error.message);
    return res.status(500).json({ success: false, error: "Lỗi đăng nhập!" });
  }
};

// verify email 
const verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Trường hợp xác thực qua OTP (đăng ký/đăng nhập bước 2)
    if (otp && email) {
      const user = await User.findOne({ email: email.trim(), deletedAt: null });

      if (!user) {
        return res.status(400).json({ success: false, error: "Email không tồn tại!" });
      }

      if (user.verified) {
        return res.status(400).json({ success: false, error: "Tài khoản đã xác thực!" });
      }
      console.log("📨 OTP nhập:", otp);
      console.log("🧾 OTP lưu:", user.otp);
      console.log("⏰ Hết hạn:", new Date(user.otpExpires), "Hiện tại:", new Date());

      if (user.otp !== otp.trim() || Date.now() > user.otpExpires) {
        return res.status(400).json({ success: false, error: "OTP không hợp lệ hoặc đã hết hạn!" });
      }

      user.verified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      const token = jwt.sign(
        { _id: user._id, role: user.role, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "10d" }
      );

      return res.status(200).json({
        success: true,
        message: "Xác thực OTP thành công!",
        token,
        user: {
          _id: user._id,
          name: user.name,
          role: user.role,
          email: user.email,
        },
      });
    }

    // Trường hợp xác thực token thông thường (đã đăng nhập)
    if (req.user) {
      // Always fetch the latest user data from DB
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(401).json({ success: false, error: "Người dùng không tồn tại!" });
      }
      if (user.deletedAt !== null) {
        return res.status(403).json({ success: false, error: "Tài khoản đã bị xóa." });
      }
      if (user.status === 0) {
        return res.status(403).json({ success: false, error: "Tài khoản đã bị khóa." });
      }

      return res.status(200).json({
        success: true,
        message: "Token hợp lệ!",
        user: {
          _id: user._id,
          name: user.name,
          role: user.role,
          email: user.email,
        },
      });
    }

    return res.status(400).json({ success: false, error: "Thiếu dữ liệu xác thực!" });
  } catch (error) {
    console.error("❌ Lỗi xác thực:", error);
    return res.status(500).json({ success: false, error: "Lỗi xác thực!" });
  }
};
// register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Kiểm tra email đã tồn tại chưa,  không bị xóa
    const existingUser = await User.findOne({ email, deletedAt: null });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email đã tồn tại!" });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kiểm tra role hợp lệ
    const validRoles = ["customer", "host"];
    const userRole = validRoles.includes(role) ? role : "customer";

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
      return res.status(500).json({ success: false, error: "Lỗi gửi OTP!" });
    }


    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công! OTP đã được gửi đến email.",
      userId: newUser._id,
    });

  } catch (error) {
    console.error("❌ Lỗi đăng ký:", error.message);
    return res.status(500).json({ success: false, error: "Lỗi đăng ký tài khoản!" });
  }
};
// login with gooogle
const googleAuth = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Google token is required",
      })
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { sub: googleId, email, name, picture } = payload

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId, deletedAt: null });

    if (user) {
      // User exists with Google ID, just log them in
      user.isOnline = true
      await user.save()
    } else {
      // Check if user exists with this email (from regular registration)
      user = await User.findOne({ email, deletedAt: null });

      if (user) {
        // User exists with email, link Google account
        user.googleId = googleId
        user.picture = picture
        user.isOnline = true
        await user.save()
      } else {
        // Create new user with Google account
        // Generate a random password since it's required in your schema
        const randomPassword = Math.random().toString(36).slice(-8)
        const hashedPassword = await bcrypt.hash(randomPassword, 10)

        user = new User({
          name,
          email,
          password: hashedPassword, // Required field, but won't be used for Google users
          googleId,
          picture,
          role: "customer",
          isOnline: true,
        })

        await user.save()
      }
    }

    // Generate JWT token (same format as your login function)
    const jwtToken = jwt.sign({ _id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    })

    // Send response in same format as your login function
    return res.status(200).json({
      success: true,
      token: jwtToken,
      user: { _id: user._id, name: user.name, role: user.role },
      isOnline: user.isOnline,
    })
  } catch (error) {
    console.error("Google Auth Error:", error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}


const googleCallback = async (req, res) => {
  try {
    const { code } = req.body

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.CLIENT_URL}/auth/google/callback`,
      }),
    })

    const tokens = await tokenResponse.json()

    // Get user info from Google
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`)
    const googleUser = await userResponse.json()

    // Use your existing logic to create/find user
    let user = await User.findOne({ googleId: googleUser.id, deletedAt: null });

    if (!user) {
      user = await User.findOne({ email: googleUser.email, deletedAt: null });
      if (user) {
        user.googleId = googleUser.id
        await user.save()
      } else {
        const randomPassword = Math.random().toString(36).slice(-8)
        const hashedPassword = await bcrypt.hash(randomPassword, 10)

        user = new User({
          name: googleUser.name,
          email: googleUser.email,
          password: hashedPassword,
          googleId: googleUser.id,
          role: "customer",
          isOnline: true,
        })
        await user.save()
      }
    }

    const jwtToken = jwt.sign({ _id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    })

    return res.status(200).json({
      success: true,
      token: jwtToken,
      user: { _id: user._id, name: user.name, role: user.role },
      isOnline: user.isOnline,
    })
  } catch (error) {
    console.error("Google callback error:", error)
    return res.status(500).json({ success: false, error: error.message })
  }
}

export { forgotPassword, googleAuth, googleCallback, login, register, resetPassword, verifyUser };

