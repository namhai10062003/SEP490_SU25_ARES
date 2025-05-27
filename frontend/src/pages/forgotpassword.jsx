import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error("Email không hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Yêu cầu đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra email của bạn.",
          { autoClose: 2000 }
        );
        setEmail("");

        // Sau 2 giây, chuyển sang trang reset-password kèm email
        setTimeout(() => {
          navigate(`/reset-password`);
        }, 2000);
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi gửi yêu cầu.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      toast.error("Lỗi kết nối, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <h2>Quên mật khẩu</h2>
      <p>Nhập email để nhận liên kết đặt lại mật khẩu.</p>
      <form onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          name="email"
          placeholder="mail@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi yêu cầu"}
        </button>
      </form>

      <p>
        Quay lại trang{" "}
        <Link to="/login" className="highlight-link">
          đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
