import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/authContext";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.head.appendChild(script);
    };

    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            import.meta.env.VITE_GOOGLE_CLIENT_ID ||
            "315842115446-g9sss3lqo3b89vrdpqgd3iehgp1mvmh2.apps.googleusercontent.com",
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
        });
      }
    };

    loadGoogleScript();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
     // Kiểm tra tên
  if (!formData.firstName || formData.firstName.trim().length === 0) {
    toast.error("Vui lòng nhập tên.");
    return false;
  }

  // Kiểm tra số điện thoại (chỉ chứa số và đủ 11 số)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(formData.phone)) {
    toast.error("Số điện thoại phải gồm đúng 10 chữ số.");
    return false;
  }

  // Kiểm tra email
  if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
    toast.error("Vui lòng nhập email hợp lệ.");
    return false;
  }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email!");
      return false;
    }
    if (!/^\d{10,}$/.test(formData.phone)) {
      toast.error("Please enter a valid phone number!");
      return false;
    }
    return true;
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
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
        localStorage.setItem("emailForVerify", formData.email);
        setTimeout(() => {
          navigate("/verify-otp");
        }, 1500);
      } else {
        toast.error(`${data.error || data.message || "Registration failed"}`);
      }
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!window.google) {
      toast.error("Google services not loaded");
      return;
    }

    setGoogleLoading(true);

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setGoogleLoading(false);
        const hiddenDiv = document.createElement("div");
        hiddenDiv.style.display = "none";
        document.body.appendChild(hiddenDiv);

        window.google.accounts.id.renderButton(hiddenDiv, {
          theme: "outline",
          size: "large",
        });

        setTimeout(() => {
          const googleBtn = hiddenDiv.querySelector('div[role="button"]');
          if (googleBtn) {
            googleBtn.click();
          }
          document.body.removeChild(hiddenDiv);
        }, 100);
      }
    });
  };

  const handleGoogleResponse = async (response) => {
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await result.json();

      if (result.ok && data.success) {
        login(data.user, data.token);
        toast.success("🎉 Google register/login successful!");
        navigate("/");
      } else {
        toast.error(data.error || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Network error during Google login");
    } finally {
      setGoogleLoading(false);
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
              <h1 className="fw-bold mb-3">ARES - FPT CITY</h1>
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
              }}>Đăng ký tại đây!!!</h2>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <input
                  type="text"
                  name="firstName"
                  className="form-control form-control-lg"
                  placeholder="Họ và tên"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <input
                  type="tel"
                  name="phone"
                  className="form-control form-control-lg"
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-lg"
                  placeholder="mail@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control form-control-lg pe-5"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="position-absolute top-50 end-0 translate-middle-y me-3"
                  style={{ cursor: "pointer", color: "#aaa", fontSize: "1.3rem" }}
                  onClick={toggleShowPassword}
                  aria-label="Toggle password visibility"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </span>
              </div>
              <div className="mb-3 position-relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="form-control form-control-lg pe-5"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <span
                  className="position-absolute top-50 end-0 translate-middle-y me-3"
                  style={{ cursor: "pointer", color: "#aaa", fontSize: "1.3rem" }}
                  onClick={toggleShowConfirmPassword}
                  aria-label="Toggle confirm password visibility"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-100 mb-2"
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>
            </form>
            <div className="text-center my-3">
              <span className="text-secondary">Bạn đã có tài khoản? </span>
              <Link to="/login" className="fw-bold">Đăng nhập ngay</Link>
            </div>
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-secondary">hoặc</span>
              <hr className="flex-grow-1" />
            </div>
            <button
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 mb-2"
              aria-label="Google"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              type="button"
            >
              {googleLoading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <>
                  <FontAwesomeIcon icon={faGoogle} />
                  <span className="fw-semibold">Đăng ký với Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;