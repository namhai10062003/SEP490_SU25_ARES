import {
  faGoogle
} from "@fortawesome/free-brands-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Thêm icon mắt
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Trạng thái show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.firstName,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registered successfully!");
        localStorage.setItem("emailForVerify", formData.email); // 👉 Lưu email
        setTimeout(() => {
          navigate("/verify-otp");
        }, 1500);
      } else {
        toast.error(`Error: ${data.message || "Registration failed"}`);
      }
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="left-panel">
          <h1>ARES-FPTCITY</h1>
          <p>Giải pháp tối ưu, kiến tạo tương lai tại FPT City Đà Nẵng.</p>
        </div>
        <div className="right-panel">
          <h2>Đăng ký tại đây!!!</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
<input
              type="email"
              name="email"
              placeholder="mail@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {/* Password input với icon mắt */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span className="password-toggle" onClick={toggleShowPassword} aria-label="Toggle password visibility">
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            {/* Confirm Password input với icon mắt */}
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <span className="password-toggle" onClick={toggleShowConfirmPassword} aria-label="Toggle confirm password visibility">
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            <button type="submit">Register</button>
          </form>
          <div className="already-account">
            <span>Bạn đã có tài khoản? </span>
            <a href="/login" className="login-link">Đăng nhập ngay</a>
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

export default Register;