import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminDashboard({ children }) {
  const location = useLocation();

  const navItems = [
    { to: "/admin-dashboard", label: "Tổng quan" },
    { to: "/admin-dashboard/report", label: "Quản lí bài Report" },
    { to: "/admin-dashboard/create-account", label: "Tạo tài khoản" },
    { to: "/admin-dashboard/posts", label: "Quản lí bài Post" },
    { to: "/admin-dashboard/revenue", label: "Phân tích doanh thu" },
    { to: "/admin-dashboard/notifications", label: "Gửi thông báo" },
    { to: "/admin-dashboard/manage-user", label: "Quản lí User" },
    { to: "/admin-dashboard/manage-staff", label: "Quản lí Staff" },
    { to: "/admin-dashboard/manage-apartment", label: "Quản lí Căn hộ" },
    { to: "/admin-dashboard/manage-resident-verification", label: "Quản lý xác nhận cư dân" },
  ];

  return (
    <div className="container-fluid min-vh-100 bg-light p-0">
      <div className="row g-0 flex-nowrap">
        {/* Sidebar */}
        <aside
          className="col-12 col-md-3 col-lg-2 bg-primary text-white d-flex flex-column p-0 shadow"
          style={{
            minHeight: "100vh",
            zIndex: 100,
          }}
        >
          <div className="py-4 px-3 border-bottom border-2 border-warning bg-gradient">
            <h5 className="fw-bold text-uppercase mb-0 text-warning text-center" style={{ letterSpacing: 1 }}>
              ADMIN PANEL
            </h5>
          </div>
          <nav className="flex-grow-1">
            <ul className="nav flex-column gap-1 px-2 py-3">
              {navItems.map((item) => (
                <li className="nav-item" key={item.to}>
                  <Link
                    to={item.to}
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === item.to
                      ? "active bg-white text-primary fw-bold shadow-sm"
                      : "text-white"
                      }`}
                    style={{
                      background:
                        location.pathname === item.to
                          ? "white"
                          : "transparent",
                      transition: "all .15s",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>•</span>
                    <span className="ms-2">{item.label}</span>
                  </Link>
                </li>
              ))}
              <li className="nav-item mt-3">
                <Link
                  to="/login"
                  className="nav-link rounded-3 px-3 py-2 d-flex align-items-center text-white"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    transition: "all .15s",
                  }}
                >
                  <span className="material-icons me-2" style={{ fontSize: 20 }}>
                    Đăng xuất
                  </span>

                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="col-12 col-md-9 col-lg-10 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}