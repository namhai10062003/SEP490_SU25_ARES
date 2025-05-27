import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div style={styles.container}>
      <h2 style={styles.title}>🔐 Xác minh Email</h2>
      <p style={styles.email}>📧 {email}</p>
      <input
        type="text"
        placeholder="Nhập mã OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleVerify} style={styles.button}>
        ✅ Xác minh
      </button>
    </div>
  );
}

// Các styles như cũ
const styles = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "30px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    textAlign: "center",
    backgroundColor: "#fdfdfd",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
  },
  title: {
    marginBottom: "10px",
    fontSize: "22px"
  },
  email: {
    marginBottom: "20px",
    color: "#555"
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    marginBottom: "20px",
    border: "1px solid #aaa",
    borderRadius: "5px"
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    color: "#fff",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};