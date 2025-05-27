import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
    <div style={styles.page}>
      <form style={styles.form} onSubmit={handleReset}>
        <h2 style={styles.title}>🔐 Đặt lại mật khẩu</h2>

        <input
          type="email"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Nhập mã OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Đang xử lý..." : "✅ Đặt lại mật khẩu"}
        </button>
      </form>
    </div>
  );
};

// 🔧 CSS styles with better contrast
const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(to right, #667eea, #764ba2)",
    padding: "20px",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "30px 40px",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  title: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#333",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#f8f8f8", // nền xám nhạt
    color: "#333", // màu chữ đậm hơn
    outline: "none",
    transition: "border-color 0.3s, box-shadow 0.3s",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    backgroundColor: "#5a67d8",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

export default ResetPassword;
