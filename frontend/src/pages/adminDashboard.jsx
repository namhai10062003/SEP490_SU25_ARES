// src/components/AdminDashboard.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard({ children }) {
  const location = useLocation();

  return (
    <div className="adminx-layout">
      {/* Sidebar chiếm 30% */}
      <aside className="adminx-sidebar">
        <h5 className="adminx-sidebar-title">ADMIN PANEL</h5>
        <ul className="adminx-nav-list">
          <li><Link to="/admin-dashboard" className="adminx-nav-link">• Tổng quan</Link></li>
          <li><Link to="/admin-dashboard/report" className="adminx-nav-link">• Quản lí bài Report</Link></li>
          <li><Link to="/admin-dashboard/create-account" className="adminx-nav-link">• Tạo tài khoản</Link></li>
          <li><Link to="/admin-dashboard/posts" className="adminx-nav-link">• Quản lí bài Post</Link></li>
          <li><Link to="/admin-dashboard/revenue" className="adminx-nav-link">• Phân tích doanh thu</Link></li>
          <li><Link to="/admin-dashboard/notifications" className="adminx-nav-link">• Gửi thông báo</Link></li>
          <li><Link to="/admin-dashboard/manage-user" className="adminx-nav-link">• Quản lí User</Link></li>
          <li><Link to="/admin-dashboard/manage-staff" className="adminx-nav-link">• Quản lí Staff</Link></li>
          <li><Link to="/admin-dashboard/manage-apartment" className="adminx-nav-link">• Quản lí Căn hộ</Link></li>
          <li><Link to="/admin-dashboard/manage-resident-verification" className="text-white text-decoration-none d-block py-1">• Quản lý xác nhận cư dân</Link></li>
          <li><Link to="/login" className="adminx-nav-link">Đăng xuất</Link></li>
        </ul>
      </aside>
      {/* Main content chiếm 70% */}
      <main className="adminx-main">
        {children}
      </main>
    </div>
  );
}
