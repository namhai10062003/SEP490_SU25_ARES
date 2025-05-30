import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/authContext";
import "./login.css";
// Import Firebase
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../libs/firebase";
const googleProvider = new GoogleAuthProvider();

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [googleLoading, setGoogleLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
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
            // Firebase email/password authentication
            const userCredential = await signInWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            // Get token from Firebase user
            const idToken = await user.getIdToken();

            // Verify with your backend
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`
                },
                body: JSON.stringify({ email: formData.email })
            });

            const data = await response.json();

            if (response.ok && data.token && data.user) {
                login(data.user, data.token);
                toast.success("🎉 Đăng nhập thành công!", {
                    autoClose: 1000,
                    hideProgressBar: true
                });
                navigate("/");
            } else {
                toast.error(
                    data.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc password!"
                );
            }
        } catch (error) {
            console.error("Lỗi khi đăng nhập:", error);
            const errorMessage =
                error.code === "auth/invalid-credential"
                    ? "Email hoặc mật khẩu không chính xác"
                    : "Đã xảy ra lỗi kết nối.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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

                        {/* Thêm phần Forgot Password */}
                        <div className="forgot-password">
                            <Link to="/forgot-password" className="forgot-link">
                                Quên mật khẩu?
                            </Link>
                        </div>

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

                    <div className="social-text">Đăng nhập nhanh với tài khoản mạng xã hội</div>

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
    );
};

export default Login;
