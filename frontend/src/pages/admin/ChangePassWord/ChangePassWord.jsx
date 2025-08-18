import React, { useState } from "react";
import AdminDashboard from "../adminDashboard";
import axios from "axios";
function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear message when user starts typing
    if (message.text) setMessage({ type: "", text: "" });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập mật khẩu hiện tại" });
      return false;
    }
    if (!formData.newPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập mật khẩu mới" });
      return false;
    }
    if (formData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Xác nhận mật khẩu không khớp" });
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setMessage({
        type: "error",
        text: "Mật khẩu mới phải khác mật khẩu hiện tại",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      // Replace with your actual API endpoint
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/users/changepassword`,
        {
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: function (status) {
            // chỉ ném lỗi (catch) nếu là 500
            return status < 500 || status > 500;
          },
        }
      );

      const data = response;
      console.log(data);
      if (data.status === 200) {
        setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({
          type: "error",
          text: data.data.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
      setMessage({
        type: "error",
        text: "Có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setMessage({ type: "", text: "" });
  };

  return (
    <AdminDashboard>
      <div style={styles.body}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.lockIcon}>🔐</div>
            <h1 style={styles.headerTitle}>Đổi Mật Khẩu</h1>
            <p style={styles.headerSubtitle}>
              Cập nhật mật khẩu để bảo mật tài khoản của bạn
            </p>
          </div>

          <div style={styles.formContainer}>
            {/* Alert Message */}
            {message.text && (
              <div
                style={{
                  ...styles.alert,
                  ...(message.type === "success"
                    ? styles.alertSuccess
                    : styles.alertError),
                }}
              >
                <span style={styles.alertIcon}>
                  {message.type === "success" ? "✅" : "❌"}
                </span>
                <span>{message.text}</span>
              </div>
            )}

            {/* Current Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Mật khẩu hiện tại *</label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  style={styles.formControl}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  style={styles.togglePassword}
                >
                  {showPasswords.current ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Mật khẩu mới *</label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  style={styles.formControl}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  style={styles.togglePassword}
                >
                  {showPasswords.new ? "🙈" : "👁️"}
                </button>
              </div>
              {formData.newPassword && formData.newPassword.length < 6 && (
                <div style={styles.validationMessage}>
                  Mật khẩu phải có ít nhất 6 ký tự
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Xác nhận mật khẩu mới *</label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  style={styles.formControl}
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  style={styles.togglePassword}
                >
                  {showPasswords.confirm ? "🙈" : "👁️"}
                </button>
              </div>
              {formData.confirmPassword &&
                formData.newPassword !== formData.confirmPassword && (
                  <div style={styles.validationMessage}>
                    Xác nhận mật khẩu không khớp
                  </div>
                )}
            </div>

            {/* Password Requirements */}
            <div style={styles.passwordRequirements}>
              <h4 style={styles.requirementsTitle}>🛡️ Yêu cầu mật khẩu:</h4>
              <ul style={styles.requirementsList}>
                <li style={styles.requirementsItem}>Tối thiểu 6 ký tự</li>
                <li style={styles.requirementsItem}>
                  Nên bao gồm chữ hoa, chữ thường và số
                </li>
                <li style={styles.requirementsItem}>
                  Không sử dụng thông tin cá nhân dễ đoán
                </li>
                <li style={styles.requirementsItem}>
                  Khác hoàn toàn với mật khẩu hiện tại
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  ...styles.btn,
                  ...styles.btnPrimary,
                  ...(loading ? styles.btnDisabled : {}),
                }}
              >
                {loading ? (
                  <div style={styles.loadingContent}>
                    <div style={styles.loadingSpinner}></div>
                    Đang xử lý...
                  </div>
                ) : (
                  "Cập Nhật Mật Khẩu"
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                style={{
                  ...styles.btn,
                  ...styles.btnSecondary,
                }}
              >
                Hủy Bỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboard>
  );
}

const styles = {
  body: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#f5f7fa",
    minHeight: "100vh",
    padding: "20px",
    margin: 0,
  },
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
  },
  header: {
    background: "linear-gradient(135deg, #4285f4 0%, #34a853 100%)",
    padding: "25px",
    textAlign: "center",
    color: "white",
  },
  lockIcon: {
    width: "50px",
    height: "50px",
    background: "rgba(255, 255, 255, 0.15)",
    borderRadius: "50%",
    margin: "0 auto 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  headerTitle: {
    fontSize: "1.8rem",
    fontWeight: "600",
    marginBottom: "8px",
    margin: "0 0 8px 0",
  },
  headerSubtitle: {
    opacity: "0.9",
    fontSize: "0.9rem",
    margin: 0,
  },
  formContainer: {
    padding: "30px",
  },
  alert: {
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    fontWeight: "500",
    fontSize: "14px",
  },
  alertSuccess: {
    background: "#e8f5e8",
    color: "#2e7d32",
    border: "1px solid #c8e6c9",
  },
  alertError: {
    background: "#ffeaea",
    color: "#c62828",
    border: "1px solid #ffcdd2",
  },
  alertIcon: {
    marginRight: "10px",
    fontSize: "18px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
    color: "#374151",
    fontSize: "14px",
  },
  inputWrapper: {
    position: "relative",
  },
  formControl: {
    width: "100%",
    padding: "12px 45px 12px 12px",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    background: "#ffffff",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    outline: "none",
  },
  togglePassword: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    fontSize: "16px",
    transition: "color 0.2s ease",
  },
  validationMessage: {
    color: "#ef4444",
    fontSize: "13px",
    marginTop: "4px",
  },
  passwordRequirements: {
    background: "linear-gradient(135deg, #4285f4 0%, #34a853 100%)",
    color: "white",
    padding: "16px",
    borderRadius: "8px",
    margin: "20px 0",
  },
  requirementsTitle: {
    marginBottom: "12px",
    fontSize: "15px",
    margin: "0 0 12px 0",
    fontWeight: "600",
  },
  requirementsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  requirementsItem: {
    marginBottom: "6px",
    paddingLeft: "18px",
    position: "relative",
    fontSize: "13px",
    lineHeight: "1.4",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "25px",
  },
  btn: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #4285f4 0%, #34a853 100%)",
    color: "white",
    boxShadow: "0 2px 8px rgba(66, 133, 244, 0.3)",
  },
  btnSecondary: {
    background: "#f8f9fa",
    color: "#6b7280",
    border: "1.5px solid #e5e7eb",
  },
  btnDisabled: {
    background: "#9ca3af",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  loadingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "50%",
    borderTopColor: "white",
    animation: "spin 1s ease-in-out infinite",
    marginRight: "8px",
  },
  securityTips: {
    background: "linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)",
    padding: "20px",
    borderRadius: "8px",
    marginTop: "20px",
  },
  securityTitle: {
    color: "#92400e",
    marginBottom: "12px",
    fontSize: "15px",
    margin: "0 0 12px 0",
    fontWeight: "600",
  },
  securityList: {
    listStyle: "none",
    color: "#92400e",
    padding: 0,
    margin: 0,
  },
  securityItem: {
    marginBottom: "8px",
    paddingLeft: "22px",
    position: "relative",
    fontSize: "13px",
    lineHeight: "1.4",
  },
};

// Add CSS animation keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
document.head.appendChild(styleSheet);

export default ChangePassword;
