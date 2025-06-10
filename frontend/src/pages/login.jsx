// ... import giữ nguyên
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/authContext";
import "./login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // 👉 điều hướng theo role
  const redirectByRole = (role) => {
    switch (role) {
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "staff":
        navigate("/staff-dashboard");
        break;
      default:
        navigate("/");
    }
  };

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

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true);
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await result.json();
      if (result.ok && data.success) {
        login(data.user, data.token);
        toast.success("🎉 Google login successful!");
        redirectByRole(data.user.role);
      } else {
        toast.error(data.error || "Google login failed");
      }
    } catch (error) {
      console.error("Backend error:", error);
      toast.error("Network error during Google login");
    } finally {
      setGoogleLoading(false);
    }
  };

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
        toast.success("🎉 Đăng nhập thành công!");
        redirectByRole(data.user.role);
      } else {
        toast.error(data.error || "Login failed!");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error.");
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

  return (
    <div className="login-page">
      <div className="container">
        <div className="left-panel">
          <div className="brand-content">
            <h1>OFFICIAL</h1>
            <p>Lorem Ipsum Dolor Sit Amet. Consectetur Adipiscing Elit.</p>
            <div className="decorative-line"></div>
          </div>
        </div>
        <div className="right-panel">
          <div className="form-container">
            <h2>Official Login Form</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="mail@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="forgot-password">
                <Link to="/forgot-password" className="highlight-link">
                  Quên mật khẩu?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="primary-btn">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Đang đăng nhập...
                  </>
                ) : (
                  "Login"
                )}
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

            <div className="divider">
              <span>hoặc</span>
            </div>

            <div className="social-login">
              <div className="social-text">Đăng nhập nhanh với tài khoản mạng xã hội</div>
              <div className="social-icons">
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-2xl border border-gray-300 shadow-sm transition duration-200 
    ${googleLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:shadow-md hover:bg-gray-50"}`}
                  aria-label="Đăng nhập với Google"
                >
                  {googleLoading ? (
                    <span className="spinner w-5 h-5 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FcGoogle size={20} />
                      <span className="text-sm font-medium text-gray-700">Đăng nhập với Google</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
