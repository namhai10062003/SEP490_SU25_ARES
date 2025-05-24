import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/authContext"; // ← chỉnh lại đường dẫn nếu cần
import "./login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast.error("Email không hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        login(data.user, data.token);

        toast.success("🎉 Đăng nhập thành công!", {
          autoClose: 1000,
          hideProgressBar: true,
        });

        navigate("/"); // 👉 Điều hướng ngay lập tức
      } else {
        toast.error(data.message || "Đăng nhập thất bại.Vui lòng kiểm tra lại email or password!");
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      toast.error("Đã xảy ra lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="left-panel">
        <h1>ARES-FPTCITY</h1>
        <p>Giải pháp tối ưu, kiến tạo tương lai tại FPT City Đà Nẵng.</p>
        </div>
        <div className="right-panel">
          <h2>Đăng nhập tại đây!!!</h2>
          <form onSubmit={handleSubmit} noValidate>
            <input
              type="email"
              name="email"
              placeholder="mail@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Login"}
            </button>
          </form>

          <div className="register-link">
            <p>
              Bạn chưa có tài khoản?{" "}
              <Link to="/register" className="highlight-link">
                Đăng ký tại đây
              </Link>
            </p>
          </div>

          <div className="social-text">
            Đăng nhập nhanh với tài khoản mạng xã hội
          </div>
          <div className="social-icons">
            <a href="#" className="square" aria-label="Google">
              <FontAwesomeIcon icon={faGoogle} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
