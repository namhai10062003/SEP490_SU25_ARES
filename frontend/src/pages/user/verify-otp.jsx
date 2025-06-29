import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './verify-otp.css';

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("emailForVerify");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      alert("Không tìm thấy email để xác minh!");
      navigate("/register");
    }
  }, []);

  const handleVerify = async () => {
    try {
      const res = await axios.post("http://localhost:4000/api/auth/verify-otp", {
        email,
        otp
      });

      if (res.data.success) {
        alert("✅ Xác minh thành công!");
        localStorage.removeItem("emailForVerify"); // 👉 Xoá email sau khi dùng
        navigate("/login");
      } else {
        alert(res.data.error || "❌ Xác minh thất bại");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      alert("❌ Lỗi hệ thống khi xác minh.");
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-left">
          <h2 className="title">ARES-FPTCITY</h2>
          <p className="subtitle">
            Giải pháp tối ưu, kiến tạo tương lai tại FPT City Đà Nẵng.
          </p>
        </div>

        <div className="verify-right">
          <h2 className="form-title">🔐 Xác minh Email</h2>
          <p className="email-display">📧 {email}</p>
          <input
            type="text"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerify}>✅ Xác minh</button>
        </div>
      </div>
    </div>
  );
}
