import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function ChangePasswordStaff() {
  const navigate = useNavigate();

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
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return false;
    }
    if (!formData.newPassword) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return false;
    }
    if (formData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      return false;
    }
    return true;
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setLoading(true);

  try {
    const token = localStorage.getItem("token");
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/users/changepassword`,
      {
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: (status) => status < 500 || status > 500, // tránh throw axios error
      }
    );

    if (response.status === 200) {
      toast.success("Đổi mật khẩu thành công! 🎉");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect sau 2s
      setTimeout(() => {
        navigate("/staffDashboard");
      }, 2000);
    } else {
      toast.error(
        response.data.message || "Đổi mật khẩu thất bại. Vui lòng thử lại."
      );
    }
  } catch (error) {
    console.error("Change password error:", error);
    const errorMessage =
      error.response?.data?.message ||
      "Có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại.";
    toast.error(errorMessage);
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
    <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center p-4">
    <div
      className="card border-0 shadow-lg w-100"
      style={{
        maxWidth: "600px",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="text-center text-white py-5"
        style={{
          background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
        }}
      >
        <div
          className="bg-white text-primary d-inline-flex align-items-center justify-content-center mb-3"
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          🔒
        </div>
        <h2 className="fw-bold mb-2">Đổi Mật Khẩu</h2>
        <p className="mb-0">Cập nhật mật khẩu để bảo mật tài khoản của bạn</p>
      </div>
  
      {/* Body */}
      <div className="card-body p-5">
        {/* Alert */}
        {message.text && (
          <div
            className={`alert d-flex align-items-center ${
              message.type === "success" ? "alert-success" : "alert-danger"
            } shadow-sm mb-4`}
            role="alert"
          >
            <span className="me-2 fs-5">
              {message.type === "success" ? "✅" : "❌"}
            </span>
            <span className="fw-medium">{message.text}</span>
          </div>
        )}
  
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              Mật khẩu hiện tại *
            </label>
            <div className="input-group input-group-lg">
              <input
                type={showPasswords.current ? "text" : "password"}
                className="form-control"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => togglePasswordVisibility("current")}
              >
                {showPasswords.current ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
  
          {/* New Password */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Mật khẩu mới *</label>
            <div className="input-group input-group-lg">
              <input
                type={showPasswords.new ? "text" : "password"}
                className="form-control"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
  
          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              Xác nhận mật khẩu mới *
            </label>
            <div className="input-group input-group-lg">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                className="form-control"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
  
          {/* Password Rules */}
          <div
            className="p-3 rounded shadow-sm mb-4 text-white"
            style={{
              background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
            }}
          >
            <h6 className="fw-bold mb-2">🛡️ Yêu cầu mật khẩu:</h6>
            <ul className="small mb-0 ps-3">
              <li>Tối thiểu 6 ký tự</li>
              <li>Nên bao gồm chữ hoa, chữ thường và số</li>
              <li>Không sử dụng thông tin cá nhân dễ đoán</li>
              <li>Khác hoàn toàn với mật khẩu hiện tại</li>
            </ul>
          </div>
  
          {/* Buttons */}
          <div className="d-flex justify-content-between align-items-center">
            {/* Back button */}
            <button
              type="button"
              onClick={() => navigate("/staff-dashboard")}
              className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
              style={{ borderRadius: "10px" }}
            >
              ⬅️ Quay Lại
            </button>
  
            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
              style={{ borderRadius: "10px" }}
            >
              {loading && (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              )}
              {loading ? "Đang xử lý..." : "Cập Nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  

  );
}

export default ChangePasswordStaff;
