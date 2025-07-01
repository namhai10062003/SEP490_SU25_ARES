import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/authContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedMsg, setBlockedMsg] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

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
      if (response.status === 403 && data.error) {
        setBlockedMsg(data.error);
        setShowBlockedModal(true);
        return;
      }
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
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
      style={{
        background: "url('/images/banner_login.jpg') center/cover no-repeat",
        minHeight: "100vh"
      }}
    >
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="row shadow-lg rounded-4 overflow-hidden bg-white">
          {/* Left panel */}
          <div className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center p-4" style={{
            background: "url('../images/content_login.jpeg') center/cover no-repeat",
            minHeight: 480
          }}>
            <div className="text-white text-center" style={{ textShadow: "0 2px 8px #000" }}>
              <h1 className="fw-bold mb-3">OFFICIAL</h1>
              <p>Lorem Ipsum Dolor Sit Amet. Consectetur Adipiscing Elit.</p>
              <hr className="border-light opacity-50" style={{ width: "60px", margin: "24px auto" }} />
            </div>
          </div>
          {/* Right panel */}
          <div className="col-12 col-md-6 bg-white p-4 d-flex flex-column justify-content-center">
            <div className="mb-4 text-center">
              <h2 className="fw-bold mb-1" style={{
                background: "linear-gradient(to right, #00c6ff, #0072ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>Đăng nhập</h2>
              <div className="text-secondary small">Chào mừng bạn quay lại!</div>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-lg"
                  placeholder="mail@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>
              <div className="mb-2">
                <input
                  type="password"
                  name="password"
                  className="form-control form-control-lg"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="mb-3 text-end">
                <Link to="/forgot-password" className="link-primary small">Quên mật khẩu?</Link>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-100 mb-2">
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>
            <div className="text-center my-3">
              <span className="text-secondary">Bạn chưa có tài khoản? </span>
              <Link to="/register" className="fw-bold link-primary">Đăng ký tại đây</Link>
            </div>
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-secondary">hoặc</span>
              <hr className="flex-grow-1" />
            </div>
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 mb-2"
              aria-label="Đăng nhập với Google"
              type="button"
            >
              {googleLoading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <>
                  <FcGoogle size={22} />
                  <span className="fw-semibold">Đăng nhập với Google</span>
                </>
              )}
            </button>
          </div>
        </div>
        {/* Modal thông báo bị khóa */}
        {showBlockedModal && (
          <div
            className="modal fade show"
            style={{ display: "block", background: "rgba(0,0,0,0.3)" }}
            onClick={() => setShowBlockedModal(false)}
          >
            <div
              className="modal-dialog"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header justify-content-between align-items-center">
                  <h5 className="modal-title text-danger fw-bold flex-grow-1 text-center mb-0">
                    {blockedMsg.includes("xóa")
                      ? "Tài khoản bị xóa"
                      : "Tài khoản bị khóa"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowBlockedModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <p className="mb-0">{blockedMsg}</p>
                </div>
                <div className="modal-footer justify-content-center">
                  <button className="btn btn-secondary" onClick={() => setShowBlockedModal(false)}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
