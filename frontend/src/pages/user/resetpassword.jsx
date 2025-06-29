import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import './resetpassword.css';

// ResetPassword component
const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email || !otp || !newPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Mật khẩu đã được đặt lại thành công!");
        navigate("/login");
      } else {
        toast.error(data.error || "Có lỗi xảy ra khi đặt lại mật khẩu.");
      }
    } catch (err) {
      console.error("❌ Lỗi kết nối reset password:", err.message);
      toast.error("Lỗi server, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-container">
        <div className="reset-left">
          <h1>ARES-FPTCITY</h1>
          <p>Giải pháp tối ưu, kiến tạo tương lai tại FPT City Đà Nẵng.</p>
        </div>

        <div className="reset-right">
          <h2>🔐 Đặt lại mật khẩu</h2>
          <form onSubmit={handleReset}>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "✅ Đặt lại mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ResetPassword;
