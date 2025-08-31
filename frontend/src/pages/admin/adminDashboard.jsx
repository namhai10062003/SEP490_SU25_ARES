import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import "./adminDashboard.css"; // thanh scroll

export default function AdminDashboard({ children }) {
  const location = useLocation();
  const { logout } = useAuth();
  const [showRevenueSub, setShowRevenueSub] = useState(false);
  const [showFeedbackSub, setShowFeedbackSub] = useState(false);

  useEffect(() => {
    setShowRevenueSub(location.pathname.startsWith("/admin-dashboard/revenue"));
    setShowFeedbackSub(
      location.pathname.startsWith("/admin-dashboard/report") ||
      location.pathname.startsWith("/admin-dashboard/contact") ||
      location.pathname.startsWith("/admin-dashboard/updateprofile")
    );
  }, [location.pathname]);

  const navItems = [
    { to: "/admin-dashboard", label: "Tổng Quan" },
    { to: "/admin-dashboard/posts", label: "Quản Lý Bài Đăng" },
    { to: "/admin-dashboard/manage-notification", label: "Quản lý Thông Báo" },
    { to: "/admin-dashboard/manage-contract", label: "Quản lý Hợp Đồng" },
    { to: "/admin-dashboard/manage-user", label: "Quản Lý Người Dùng" },
    { to: "/admin-dashboard/manage-staff", label: "Quản Lý Nhân Viên" },
    { to: "/admin-dashboard/manage-apartment", label: "Quản Lý Căn hộ" },
    { to: "/admin-dashboard/manage-resident-verification", label: "Quản Lý Xác Nhận Cư Dân" },
    { to: "/admin-dashboard/user-revenue", label: "Quản Lý Yêu Cầu Rút Tiền" },
    { to: "/admin-dashboard/changePassWord", label: "Đổi mật khẩu" },
  ];

  const isActive = (path) => location.pathname === path;

  // Consistent menu item style: prevent wrapping, ellipsis for overflow, fixed height
  const menuItemStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    minHeight: 40,
    lineHeight: "24px",
    display: "flex",
    alignItems: "center",
    width: "100%",
    fontSize: 15,
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <aside
        className="bg-primary text-white shadow position-fixed"
        style={{
          width: 240,
          height: "100vh",
          top: 0,
          left: 0,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="py-4 px-3 border-bottom border-warning" style={{ flex: "0 0 auto" }}>
          <h5 className="fw-bold text-uppercase mb-0 text-warning text-center" style={{ fontSize: 14 }}>
            ADMIN PANEL
          </h5>
        </div>

        {/* Navigation */}
        <nav className="p-3 sidebar-scroll" style={{ flex: "1 1 auto", overflowY: "auto" }}>
          <ul className="nav flex-column gap-1">
            {navItems.map((item) => (
              <li className="nav-item" key={item.to}>
                <Link
                  to={item.to}
                  className={`nav-link rounded px-3 py-2 d-flex align-items-center ${isActive(item.to) ? "bg-white text-primary fw-bold" : "text-white"}`}
                  style={menuItemStyle}
                  title={item.label}
                >
                  <span className="me-2">•</span>
                  <span className="flex-grow-1" style={{ minWidth: 0 }}>{item.label}</span>
                </Link>
              </li>
            ))}

            {/* Feedback Submenu */}
            <li className="nav-item mt-2">
              <button
                type="button"
                className={`nav-link rounded px-3 py-2 d-flex align-items-center w-100 border-0 ${showFeedbackSub ? "bg-white text-primary fw-bold" : "text-white"}`}
                style={{ ...menuItemStyle, background: "transparent" }}
                onClick={() => setShowFeedbackSub(!showFeedbackSub)}
                title="Quản Lý Phản Hồi"
              >
                <span className="me-2">•</span>
                <span style={{ minWidth: 0 }}>Quản Lý Phản Hồi</span>
                <span className="ms-auto">{showFeedbackSub ? "▲" : "▼"}</span>
              </button>

              {showFeedbackSub && (
                <ul className="nav flex-column ms-3 mt-1">
                  <li className="nav-item">
                    <Link
                      to="/admin-dashboard/report"
                      className={`nav-link rounded px-3 py-2 d-flex align-items-center ${isActive("/admin-dashboard/report") ? "bg-white text-primary fw-bold" : "text-white"}`}
                      style={menuItemStyle}
                      title="Báo Cáo"
                    >
                      <span className="me-2">•</span>
                      <span className="flex-grow-1" style={{ minWidth: 0 }}>Báo Cáo</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/admin-dashboard/contact"
                      className={`nav-link rounded px-3 py-2 d-flex align-items-center ${isActive("/admin-dashboard/contact") ? "bg-white text-primary fw-bold" : "text-white"}`}
                      style={menuItemStyle}
                      title="Liên Hệ"
                    >
                      <span className="me-2">•</span>
                      <span className="flex-grow-1" style={{ minWidth: 0 }}>Liên Hệ</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/admin-dashboard/updateprofile"
                      className={`nav-link rounded px-3 py-2 d-flex align-items-center ${isActive("/admin-dashboard/updateprofile") ? "bg-white text-primary fw-bold" : "text-white"}`}
                      style={menuItemStyle}
                      title="Cập nhật thông tin"
                    >
                      <span className="me-2">•</span>
                      <span className="flex-grow-1" style={{ minWidth: 0 }}>Cập nhật thông tin</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Revenue Submenu */}
            <li className="nav-item mt-2">
              <button
                type="button"
                className={`nav-link rounded px-3 py-2 d-flex align-items-center w-100 border-0 ${showRevenueSub ? "bg-white text-primary fw-bold" : "text-white"}`}
                style={{ ...menuItemStyle, background: "transparent" }}
                onClick={() => setShowRevenueSub(!showRevenueSub)}
                title="Phân Tích Doanh Thu"
              >
                <span className="me-2">•</span>
                <span style={{ minWidth: 0 }}>Phân Tích Doanh Thu</span>
                <span className="ms-auto">{showRevenueSub ? "▲" : "▼"}</span>
              </button>

              {showRevenueSub && (
                <ul className="nav flex-column ms-3 mt-1">
                  <li className="nav-item">
                    <Link
                      to="/admin-dashboard/revenue/post"
                      className={`nav-link rounded px-3 py-2 d-flex align-items-center ${isActive("/admin-dashboard/revenue/post") ? "bg-white text-primary fw-bold" : "text-white"}`}
                      style={menuItemStyle}
                      title="Post"
                    >
                      <span className="me-2">•</span>
                      <span className="flex-grow-1" style={{ minWidth: 0 }}>Post</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/admin-dashboard/revenue/apartment"
                      className={`nav-link rounded px-3 py-2 d-flex align-items-center ${isActive("/admin-dashboard/revenue/apartment") ? "bg-white text-primary fw-bold" : "text-white"}`}
                      style={menuItemStyle}
                      title="Căn Hộ"
                    >
                      <span className="me-2">•</span>
                      <span className="flex-grow-1" style={{ minWidth: 0 }}>Căn Hộ</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/admin-dashboard/revenue/apartment-deposit"
                      className={`nav-link rounded px-3 py-2 d-flex align-items-center ${isActive("/admin-dashboard/revenue/apartment-deposit") ? "bg-white text-primary fw-bold" : "text-white"}`}
                      style={menuItemStyle}
                      title="Đặt Cọc"
                    >
                      <span className="me-2">•</span>
                      <span className="flex-grow-1" style={{ minWidth: 0 }}>Đặt Cọc</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Logout */}
            <li className="nav-item mt-4">
              <button
                onClick={logout}
                className="nav-link rounded px-3 py-2 d-flex align-items-center text-white w-100 border-0"
                style={{ ...menuItemStyle, background: "rgba(255,255,255,0.1)" }}
                title="Đăng xuất"
              >
                <span className="me-2">•</span>
                <span className="flex-grow-1" style={{ minWidth: 0 }}>Đăng xuất</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-4" style={{ background: "#f7f8fa", marginLeft: 240 }}>
        {children}
      </main>
    </div>
  );
}
