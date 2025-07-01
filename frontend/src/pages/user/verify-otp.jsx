import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("emailForVerify");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      alert("Không tìm thấy email để xác minh!");
      navigate("/register");
    }
  }, [navigate]);

  const handleVerify = async () => {
    if (!otp) {
      alert("Vui lòng nhập mã OTP!");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/api/auth/verify-otp", {
        email,
        otp
      });

      if (res.data.success) {
        alert("✅ Xác minh thành công!");
        localStorage.removeItem("emailForVerify");
        navigate("/login");
      } else {
        alert(res.data.error || "❌ Xác minh thất bại");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      alert("❌ Lỗi hệ thống khi xác minh.");
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
              }}>🔐 Xác minh Email</h2>
              <div className="text-secondary mb-3 small">Vui lòng nhập mã OTP đã gửi về email:</div>
              <div className="fw-bold text-primary mb-3">{email}</div>
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-lg text-center"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
                autoFocus
                maxLength={8}
              />
            </div>
            <button
              className="btn btn-primary btn-lg w-100 fw-bold"
              onClick={handleVerify}
              disabled={loading}
            >
              {loading ? "Đang xác minh..." : "✅ Xác minh"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}