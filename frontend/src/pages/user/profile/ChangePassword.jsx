import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import "./changePassword.css";

const ChangePassword = () => {
  const { user, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.warn("⚠️ Vui lòng điền đầy đủ các trường!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("❌ Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      await axios.patch(
        "http://localhost:4000/api/users/changepassword",
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("✅ Đổi mật khẩu thành công!");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error(err?.response?.data?.message || "❌ Đổi mật khẩu thất bại!");
    }
  };

  return (
    <div className="change-password-page">
      <Header user={user} name={user?.name} logout={logout} />
      <div className="change-password-container">
        <h2 className="change-password-title">Đổi mật khẩu</h2>

        <form className="change-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user?.email || ""} disabled />
          </div>

          <div className="form-group">
            <label>Mật khẩu cũ</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Cập nhật mật khẩu
          </button>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
  <button
    type="button"
    className="back-button"
    onClick={() => navigate(-1)}
  >
    ⬅️ Quay lại
  </button>
</div>
        </form>
      </div>
      <footer className="update-profile-footer">&copy; 2025 Đổi mật khẩu</footer>
    </div>
  );
};

export default ChangePassword;
