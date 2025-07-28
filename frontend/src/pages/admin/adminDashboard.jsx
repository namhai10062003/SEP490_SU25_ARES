import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminDashboard({ children }) {
  const location = useLocation();

  const [showRevenueSub, setShowRevenueSub] = useState(
    location.pathname.startsWith("/admin-dashboard/revenue")
  );

  const [showFeedbackSub, setShowFeedbackSub] = useState(
    location.pathname.startsWith("/admin-dashboard/report") ||
    location.pathname.startsWith("/admin-dashboard/contact") ||
    location.pathname.startsWith("/admin-dashboard/updateprofile")
  );

  useEffect(() => {
    if (location.pathname.startsWith("/admin-dashboard/revenue")) {
      setShowRevenueSub(true);
    }
    if (
      location.pathname.startsWith("/admin-dashboard/report") ||
      location.pathname.startsWith("/admin-dashboard/contact")||
      location.pathname.startsWith("/admin-dashboard/updateprofile")
    ) {
      setShowFeedbackSub(true);
    }
  }, [location.pathname]);

  const navItems = [
    { to: "/admin-dashboard", label: "Tổng Quan" },
    // { to: "/admin-dashboard/create-account", label: "Tạo Tài Khoản" },
    { to: "/admin-dashboard/posts", label: "Quản Lý Bài Post" },
    { to: "/admin-dashboard/notifications", label: "Gửi Thông Báo" },
    { to: "/admin-dashboard/manage-user", label: "Quản Lý User" },
    { to: "/admin-dashboard/manage-staff", label: "Quản Lý Staff" },
    { to: "/admin-dashboard/manage-apartment", label: "Quản Lý Căn hộ" },
    { to: "/admin-dashboard/manage-resident-verification", label: "Quản Lý Xác Nhận Cư Dân" },
    { to: "/admin-dashboard/user-revenue", label: "Quản Lý Doanh Thu Của User" },
  ];

  return (
    <div className="container-fluid min-vh-100 bg-light p-0">
      <div className="row g-0 flex-nowrap">
        {/* Sidebar */}
        <aside
          className="col-12 col-md-3 col-lg-2 bg-primary text-white d-flex flex-column p-0 shadow"
          style={{ minHeight: "100vh", zIndex: 100 }}
        >
          <div className="py-4 px-3 border-bottom border-2 border-warning bg-gradient">
            <h5
              className="fw-bold text-uppercase mb-0 text-warning text-center"
              style={{ letterSpacing: 1 }}
            >
              ADMIN PANEL
            </h5>
          </div>
          <nav className="flex-grow-1">
            <ul className="nav flex-column gap-1 px-2 py-3">
              {/* Danh mục chính */}
              {navItems.map((item) => (
                <li className="nav-item" key={item.to}>
                  <Link
                    to={item.to}
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === item.to
                      ? "active bg-white text-primary fw-bold shadow-sm"
                      : "text-white"
                      }`}
                  >
                    <span style={{ fontWeight: 500 }}>•</span>
                    <span className="ms-2">{item.label}</span>
                  </Link>
                </li>
              ))}

              {/* Submenu Quản lý Phản Hồi */}
              <li className="nav-item">
                <div>
                  <button
                    type="button"
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center w-100 border-0 ${showFeedbackSub
                      ? "bg-white text-primary fw-bold shadow-sm"
                      : "text-white"
                      }`}
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                      textAlign: "left",
                      background: "transparent",
                    }}
                    onClick={() => setShowFeedbackSub((v) => !v)}
                    aria-expanded={showFeedbackSub}
                  >
                    <span style={{ fontWeight: 500 }}>•</span>
                    <span className="ms-2">Quản Lý Phản Hồi</span>
                    <span className="ms-auto">{showFeedbackSub ? "▲" : "▼"}</span>
                  </button>

                  {showFeedbackSub && (
                    <ul
                      className="nav flex-column ps-4 mt-1"
                      style={{
                        borderLeft: "2px solid #fff3",
                        transition: "all .2s",
                      }}
                    >
                      <li className="nav-item">
                        <Link
                          to="/admin-dashboard/report"
                          className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/admin-dashboard/report"
                            ? "active bg-white text-primary fw-bold shadow-sm"
                            : "text-white"
                            }`}
                        >
                          • <span className="ms-2">Báo Cáo</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/admin-dashboard/contact"
                          className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/admin-dashboard/contact"
                            ? "active bg-white text-primary fw-bold shadow-sm"
                            : "text-white"
                            }`}
                        >
                          • <span className="ms-2">Liên Hệ</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/admin-dashboard/updateprofile"
                          className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/admin-dashboard/updateprofile"
                            ? "active bg-white text-primary fw-bold shadow-sm"
                            : "text-white"
                            }`}
                        >
                          • <span className="ms-2">Cập nhật thông tin</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              </li>

              {/* Submenu Phân Tích Doanh Thu */}
              <li className="nav-item">
                <div>
                  <button
                    type="button"
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center w-100 border-0 ${showRevenueSub
                      ? "bg-white text-primary fw-bold shadow-sm"
                      : "text-white"
                      }`}
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                      textAlign: "left",
                      background: "transparent",
                    }}
                    onClick={() => setShowRevenueSub((v) => !v)}
                    aria-expanded={showRevenueSub}
                  >
                    <span style={{ fontWeight: 500 }}>•</span>
                    <span className="ms-2">Phân Tích Doanh Thu</span>
                    <span className="ms-auto">{showRevenueSub ? "▲" : "▼"}</span>
                  </button>

                  {showRevenueSub && (
                    <ul
                      className="nav flex-column ps-4 mt-1"
                      style={{
                        borderLeft: "2px solid #fff3",
                        transition: "all .2s",
                      }}
                    >
                      <li className="nav-item">
                        <Link
                          to="/admin-dashboard/revenue/post"
                          className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/admin-dashboard/revenue/post"
                            ? "active bg-white text-primary fw-bold shadow-sm"
                            : "text-white"
                            }`}
                        >
                          • <span className="ms-2">Post</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/admin-dashboard/revenue/apartment"
                          className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/admin-dashboard/revenue/apartment"
                            ? "active bg-white text-primary fw-bold shadow-sm"
                            : "text-white"
                            }`}
                        >
                          • <span className="ms-2">Căn Hộ</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/admin-dashboard/revenue/apartment-deposit"
                          className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/admin-dashboard/revenue/apartment-deposit"
                            ? "active bg-white text-primary fw-bold shadow-sm"
                            : "text-white"
                            }`}
                        >
                          • <span className="ms-2">Đặt Cọc Căn Hộ</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              </li>

              {/* Logout */}
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
        <main className="col-12 col-md-9 col-lg-10 p-4">{children}</main>
      </div>
    </div>
  );
}
