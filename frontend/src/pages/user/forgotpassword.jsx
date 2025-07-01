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
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: "url('/images/banner_login.jpg')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        minHeight: "100vh"
      }}
    >
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="row shadow-lg rounded-4 overflow-hidden bg-white">
          {/* Left panel */}
          <div
            className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center p-4"
            style={{
              backgroundImage: "url('/images/content_login.jpeg')",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              minHeight: 480,
              position: "relative"
            }}
          >
            <div className="text-white text-center" style={{ textShadow: "0 2px 8px #000", zIndex: 1 }}>
              <h1 className="fw-bold mb-3 text-warning">ARES-FPTCITY</h1>
              <p>Giải pháp tối ưu, kiến tạo tương lai tại FPT City Đà Nẵng.</p>
            </div>
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 0
              }}
            />
          </div>
          {/* Right panel */}
          <div className="col-12 col-md-6 bg-white p-4 d-flex flex-column justify-content-center">
            <div className="mb-4 text-center">
              <h2 className="fw-bold mb-1" style={{
                background: "linear-gradient(to right, #00c6ff, #0072ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>Đặt lại mật khẩu</h2>
              <div className="text-secondary small">Nhập email để nhận liên kết đặt lại mật khẩu.</div>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-lg"
                  placeholder="mail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-100 fw-bold mb-3">
                {loading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </form>
            <div className="text-center mt-3">
              <span className="text-secondary">Quay lại </span>
              <Link to="/login" className="fw-bold link-primary">đăng nhập</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;