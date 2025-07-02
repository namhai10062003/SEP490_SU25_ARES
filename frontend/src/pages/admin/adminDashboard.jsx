import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminDashboard({ children }) {
  const location = useLocation();

  return (
    <div className="container-fluid min-vh-100 bg-light p-0">
      <div className="row g-0">
        {/* Sidebar */}
        <aside className="col-12 col-md-3 col-lg-2 bg-primary text-white d-flex flex-column p-4 min-vh-100">
          <h5 className="fw-bold text-uppercase mb-4" style={{ letterSpacing: 1 }}>ADMIN PANEL</h5>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link to="/admin-dashboard" className={`nav-link text-white ${location.pathname === "/admin-dashboard" ? "active fw-bold bg-white bg-opacity-25 rounded" : ""}`}>• Tổng quan</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin-dashboard/report" className={`nav-link text-white ${location.pathname === "/admin-dashboard/report" ? "active fw-bold bg-white bg-opacity-25 rounded" : ""}`}>• Quản lí bài Report</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin-dashboard/create-account" className={`nav-link text-white ${location.pathname === "/admin-dashboard/create-account" ? "active fw-bold bg-white bg-opacity-25 rounded" : ""}`}>• Tạo tài khoản</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin-dashboard/posts" className={`nav-link text-white ${location.pathname === "/admin-dashboard/posts" ? "active fw-bold bg-white bg-opacity-25 rounded" : ""}`}>• Quản lí bài Post</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin-dashboard/revenue" className={`nav-link text-white ${location.pathname === "/admin-dashboard/revenue" ? "active fw-bold bg-white bg-opacity-25 rounded" : ""}`}>• Phân tích doanh thu</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin-dashboard/notifications" className={`nav-link text-white ${location.pathname === "/admin-dashboard/notifications" ? "active fw-bold bg-white bg-opacity-25 rounded" : ""}`}>• Gửi thông báo</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin-dashboard/manage-user" className={`nav-link text-white ${location.pathname === "/admin-dashboard/manage-user" ? "active fw-bold bg-white bg-opacity-25 rounded" : ""}`}>• Quản lí User</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin-dashboard/manage-staff" className={`nav-link text-white ${location.pathname === "/admin-dashboard/manage-staff" ? "active fw-bold bg-white bg-opacity-25 rounded" : ""}`}>• Quản lí Staff</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin-dashboard/manage-apartment" className={`nav-link text-white ${location.pathname === "/admin-dashboard/manage-apartment" ? "active fw-bold bg-white bg-opacity-25 rounded" : ""}`}>• Quản lí Căn hộ</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin-dashboard/manage-resident-verification" className={`nav-link text-white ${location.pathname === "/admin-dashboard/manage-resident-verification" ? "active fw-bold bg-white bg-opacity-25 rounded" : ""}`}>• Quản lý xác nhận cư dân</Link>
            </li>
            <li className="nav-item mt-3">
              <Link to="/login" className="nav-link text-white">Đăng xuất</Link>
            </li>
          </ul>
        </aside>
        {/* Main Content */}
        <main className="col-12 col-md-9 col-lg-10 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}