import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const handleResendOTP = async () => {
    if (!email) {
      toast.warn("⚠️ Vui lòng nhập email trước khi gửi lại OTP!");
      return;
    }
  
    setResendLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        toast.success(data.message || "Đã gửi lại mã OTP!");
        setResendCooldown(60); // Bắt đầu đếm ngược 60s
      } else {
        toast.error(data.error || "Gửi lại OTP thất bại.");
      }
    } catch (err) {
      console.error("❌ Lỗi gửi lại OTP:", err.message);
      toast.error("Lỗi server khi gửi lại OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendCooldown]);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
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
              }}>🔐 Đặt lại mật khẩu</h2>
            </div>
            <form onSubmit={handleReset} noValidate>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Nhập mã OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-2 d-flex justify-content-end">
  <button
    type="button"
    className="btn btn-link px-0"
    onClick={handleResendOTP}
    disabled={resendLoading || resendCooldown > 0}
    style={{ fontSize: "0.9rem" }}
  >
    {resendCooldown > 0
      ? `Gửi lại OTP sau ${resendCooldown}s`
      : resendLoading
      ? "Đang gửi lại..."
      : "Gửi lại mã OTP"}
  </button>
</div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-100 fw-bold">
                {loading ? "Đang xử lý..." : "✅ Đặt lại mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;