import {
  faGoogle
} from "@fortawesome/free-brands-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Thêm icon mắt
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/authContext";
import "./Register.css";
// Import Firebase
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../libs/firebase";
const googleProvider = new GoogleAuthProvider();


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
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  // Replace the existing Google sign-in with Firebase Google auth
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      // Send the token to your backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken })
      });
      console.log("Google sign-in response:", response);
      const data = await response.json();

      if (response.ok && data.success) {
        login(data.user, data.token);
        toast.success("🎉 Google login successful!");
        navigate("/");
      } else {
        toast.error(data.error || "Google login failed");
      }
    } catch (error) {
      console.error("Firebase Google Auth Error:", error);
      toast.error("Đăng nhập với Google thất bại");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {

      // Firebase email/password authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      // Get token from Firebase user
      const idToken = await user.getIdToken();
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
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
          <div className="social-text">
            Đăng nhập nhanh với tài khoản mạng xã hội
          </div>
          <div className="social-icons">
            <div className="social-icons">
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="google-sign-in-button"
                type="button"
              >
                {googleLoading ? (
                  <span className="spinner"></span>
                ) : (
                  <FontAwesomeIcon icon={faGoogle} />
                )}
                <span>Đăng nhập với Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;