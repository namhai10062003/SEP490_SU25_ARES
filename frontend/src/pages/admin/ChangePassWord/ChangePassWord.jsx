import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
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
        }
      );
  
      if (response.status === 200) {
        toast.success("Đổi mật khẩu thành công! 🎉");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(
          response.data.message || "Đổi mật khẩu thất bại. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Change password error:", error);
  
      // ✅ lấy message từ backend nếu có
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại.";
  
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center bg-light py-5">
      <div className="card border-0 shadow-lg rounded-4" style={{ maxWidth: "600px", width: "100%" }}>
        
        {/* Header gradient */}
        <div className="text-center text-white rounded-top-4 py-4 px-3" 
             style={{ background: "linear-gradient(135deg, #0d6efd, #00c6ff)" }}>
          <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
               style={{ width: "70px", height: "70px", fontSize: "30px" }}>
            🔒
          </div>
          <h3 className="fw-bold mb-1">Đổi Mật Khẩu</h3>
          <p className="mb-0">Cập nhật mật khẩu để bảo mật tài khoản của bạn</p>
        </div>

        <div className="card-body p-4">
          {/* Thông báo */}
          {message.text && (
            <div
              className={`alert ${
                message.type === "success" ? "alert-success" : "alert-danger"
              } d-flex align-items-center`}
              role="alert"
            >
              {message.type === "success" ? "✅" : "❌"} {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Current Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Mật khẩu hiện tại *</label>
              <div className="input-group">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPasswords.current ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Mật khẩu mới *</label>
              <div className="input-group">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPasswords.new ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Xác nhận mật khẩu mới *</label>
              <div className="input-group">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPasswords.confirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="rounded-3 p-3 mb-4 text-white" 
                 style={{ background: "linear-gradient(135deg, #0d6efd, #00c6ff)" }}>
              <h6 className="fw-bold mb-2">🛡️ Yêu cầu mật khẩu:</h6>
              <ul className="mb-0 small">
                <li>Tối thiểu 6 ký tự</li>
                <li>Nên bao gồm chữ hoa, chữ thường và số</li>
                <li>Không sử dụng thông tin cá nhân dễ đoán</li>
                <li>Khác hoàn toàn với mật khẩu hiện tại</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-between">
              <Link to="/admin-dashboard" className="btn btn-outline-secondary px-4">
                ⬅ Quay Lại
              </Link>
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang xử lý...
                  </>
                ) : (
                  "Cập Nhật"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
