import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/authContext";

import "./register.css";

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
  const { login } = useAuth(); // từ context

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
            "282918167682-elp5kdkiutpitjc29s06v5aacavsiii6.apps.googleusercontent.com",
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
        localStorage.setItem("emailForVerify", formData.email);
        setTimeout(() => {
          navigate("/verify-otp");
        }, 1500);
      } else {
        toast.error(`Error: ${data.error || data.message || "Registration failed"}`);
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
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="password-toggle"
                onClick={toggleShowPassword}
                aria-label="Toggle password visibility"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <span
                className="password-toggle"
                onClick={toggleShowConfirmPassword}
                aria-label="Toggle confirm password visibility"
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Register"}
            </button>
          </form>

          <div className="already-account">
            <span>Bạn đã có tài khoản? </span>
            <Link to="/login" className="login-link">
              Đăng nhập ngay
            </Link>
          </div>

          <div className="social-icons">
            <button
              className="square"
              aria-label="Google"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              <FontAwesomeIcon icon={faGoogle} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
