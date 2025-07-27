import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";

const ChangePassword = () => {
  const { user, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!newPassword || !confirmPassword) {
      toast.warn("⚠️ Vui lòng nhập mật khẩu mới và xác nhận.");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      toast.error("❌ Mật khẩu xác nhận không khớp.");
      return;
    }
  
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/users/changepassword`,
        { oldPassword, newPassword }, // nếu oldPassword rỗng thì backend sẽ bỏ qua
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
    <div className="bg-light min-vh-100">
      <Header user={user} name={user?.name} logout={logout} />
      <div className="container py-5">
        <div className="bg-white rounded-4 shadow p-4 mx-auto" style={{ maxWidth: 500 }}>
          <h2 className="fw-bold text-center mb-4">Đổi mật khẩu</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={user?.email || ""} disabled />
            </div>
            <div className="mb-3">
  <label className="form-label">Mật khẩu hiện tại</label>
  <input
    type="password"
    className="form-control"
    value={oldPassword}
    onChange={(e) => setOldPassword(e.target.value)}
    placeholder="Nhập mật khẩu hiện tại"
    required
  />
</div>

            <div className="mb-3">
              <label className="form-label">Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 fw-bold">
              Cập nhật mật khẩu
            </button>
            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                ⬅️ Quay lại
              </button>
            </div>
          </form>
        </div>
        <footer className="text-center mt-4 text-secondary small">
          &copy; 2025 Đổi mật khẩu
        </footer>
      </div>
    </div>
  );
};

export default ChangePassword;