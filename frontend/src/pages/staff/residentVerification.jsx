import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import "./ResidentVerification.css";

export default function ResidentVerification() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    apartment: "",
    contractType: "",
    contractImage: null,
  });

  const token = localStorage.getItem("token");
  let userName = "Người dùng";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userName = decoded?.name || "Người dùng";
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // TODO: gửi dữ liệu lên backend
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">BẢN QUẢN LÝ</h2>
        <nav className="sidebar-menu">
          <ul>
            <li><Link to="/staff-dashboard">Dashboard</Link></li>
            <li><Link to="/posts">Quản lý bài post</Link></li>
            <li><Link to="/real-estate">Quản lý bất động sản</Link></li>
            <li><Link to="/vehicles">Quản lý bài đồ xe</Link></li>
            <li><Link to="/expenses">Quản lý chi phí</Link></li>
            <li><Link to="/staff-dashboard/residentVerification">Quản lý người dùng</Link></li>
            <li><Link to="/revenue">Quản lý doanh thu</Link></li>
            <li><Link to="/login">Đăng Xuất</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="dashboard-container">
        <div className="topbar">
          <h2 className="dashboard-title">Xác thực cư dân</h2>
          <div className="user-info">
            <span className="user-name">{userName}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="resident-form two-columns">
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tên căn hộ</label>
            <input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Loại hợp đồng</label>
            <input
              type="text"
              name="contractType"
              value={formData.contractType}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Upload hình ảnh hợp đồng</label>
            <input
              type="file"
              name="contractImage"
              accept="image/*"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <button type="submit" className="submit-btn">Gửi xác thực</button>
          </div>
        </form>
      </main>
    </div>
  );
}
