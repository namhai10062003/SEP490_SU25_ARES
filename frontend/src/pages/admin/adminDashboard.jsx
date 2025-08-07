import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminDashboard({ children }) {
  const location = useLocation();
  const navRef = useRef(null);

  // submenu visibility (controlled by pathname + toggles)
  const [showRevenueSub, setShowRevenueSub] = useState(false);
  const [showFeedbackSub, setShowFeedbackSub] = useState(false);

  useEffect(() => {
    // open submenus when path matches
    setShowRevenueSub(location.pathname.startsWith("/admin-dashboard/revenue"));
    setShowFeedbackSub(
      location.pathname.startsWith("/admin-dashboard/report") ||
      location.pathname.startsWith("/admin-dashboard/contact") ||
      location.pathname.startsWith("/admin-dashboard/updateprofile")
    );

    // scroll active item into view inside the nav scroll area (smooth)
    // run after a tick to ensure DOM rendered
    setTimeout(() => {
      try {
        if (!navRef.current) return;
        const active = navRef.current.querySelector(".nav-link.active");
        if (active) {
          // scroll so active link is visible with some offset from top
          const rect = active.getBoundingClientRect();
          const containerRect = navRef.current.getBoundingClientRect();
          const offsetTop = rect.top - containerRect.top;
          const padding = 24; // some breathing room
          navRef.current.scrollTo({
            top: Math.max(0, offsetTop - padding),
            behavior: "smooth",
          });
        }
      } catch (err) {
        // ignore
      }
    }, 50);
  }, [location.pathname]);

  const navItems = [
    { to: "/admin-dashboard", label: "Tổng Quan" },
    { to: "/admin-dashboard/posts", label: "Quản Lý Bài Post" },
    { to: "/admin-dashboard/manage-notification", label: "Quản lý Notification" },
    { to: "/admin-dashboard/manage-user", label: "Quản Lý User" },
    { to: "/admin-dashboard/manage-staff", label: "Quản Lý Staff" },
    { to: "/admin-dashboard/manage-apartment", label: "Quản Lý Căn hộ" },
    { to: "/admin-dashboard/manage-resident-verification", label: "Quản Lý Xác Nhận Cư Dân" },
    { to: "/admin-dashboard/user-revenue", label: "Quản Lý Yêu Cầu Rút Tiền Của User" },
  ];

  // helper to render Link class names
  const linkClass = (path) =>
    `nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === path ? "active bg-white text-primary fw-bold shadow-sm" : "text-white"
    }`;

  return (
    <div className="admin-dashboard-root" style={{ minHeight: "100vh" }}>
      {/* Sidebar + main layout */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside
          className="sidebar bg-primary text-white shadow"
          style={{
            width: 240,
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
          }}
        >
          {/* Branding / header (fixed inside sidebar) */}
          <div
            className="sidebar-header py-4 px-3 border-bottom border-warning bg-gradient"
            style={{ flex: "0 0 auto" }}
          >
            <h5
              className="fw-bold text-uppercase mb-0 text-warning text-center"
              style={{ letterSpacing: 1, fontSize: 14 }}
            >
              ADMIN PANEL
            </h5>
          </div>

          {/* Scrollable menu area */}
          <nav
            ref={navRef}
            className="sidebar-nav flex-grow-1"
            style={{
              overflowY: "auto",
              padding: "12px 8px",
              scrollBehavior: "smooth",
            }}
            aria-label="Admin navigation"
          >
            <ul className="nav flex-column gap-1 px-2 py-1">
              {navItems.map((item) => (
                <li className="nav-item" key={item.to}>
                  <Link to={item.to} className={linkClass(item.to)}>
                    <span style={{ fontWeight: 600 }}>•</span>
                    <span className="ms-2">{item.label}</span>
                  </Link>
                </li>
              ))}

              {/* Feedback submenu */}
              <li className="nav-item mt-2" key="feedback-group">
                <div>
                  <button
                    type="button"
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center w-100 border-0 ${showFeedbackSub ? "bg-white text-primary fw-bold shadow-sm" : "text-white"}`}
                    style={{ cursor: "pointer", userSelect: "none", textAlign: "left", background: "transparent" }}
                    onClick={() => setShowFeedbackSub((v) => !v)}
                    aria-expanded={showFeedbackSub}
                    aria-controls="feedback-submenu"
                  >
                    <span style={{ fontWeight: 600 }}>•</span>
                    <span className="ms-2">Quản Lý Phản Hồi</span>
                    <span className="ms-auto" aria-hidden>{showFeedbackSub ? "▲" : "▼"}</span>
                  </button>

                  {showFeedbackSub && (
                    <ul id="feedback-submenu" className="nav flex-column ps-4 mt-1" style={{ borderLeft: "2px solid rgba(255,255,255,0.12)", transition: "all .18s" }}>
                      <li className="nav-item">
                        <Link to="/admin-dashboard/report" className={linkClass("/admin-dashboard/report") + " ps-3"}>
                          • <span className="ms-2">Báo Cáo</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin-dashboard/contact" className={linkClass("/admin-dashboard/contact") + " ps-3"}>
                          • <span className="ms-2">Liên Hệ</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin-dashboard/updateprofile" className={linkClass("/admin-dashboard/updateprofile") + " ps-3"}>
                          • <span className="ms-2">Cập nhật thông tin</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              </li>

              {/* Revenue submenu */}
              <li className="nav-item mt-2" key="revenue-group">
                <div>
                  <button
                    type="button"
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center w-100 border-0 ${showRevenueSub ? "bg-white text-primary fw-bold shadow-sm" : "text-white"}`}
                    style={{ cursor: "pointer", userSelect: "none", textAlign: "left", background: "transparent" }}
                    onClick={() => setShowRevenueSub((v) => !v)}
                    aria-expanded={showRevenueSub}
                    aria-controls="revenue-submenu"
                  >
                    <span style={{ fontWeight: 600 }}>•</span>
                    <span className="ms-2">Phân Tích Doanh Thu</span>
                    <span className="ms-auto" aria-hidden>{showRevenueSub ? "▲" : "▼"}</span>
                  </button>

                  {showRevenueSub && (
                    <ul id="revenue-submenu" className="nav flex-column ps-4 mt-1" style={{ borderLeft: "2px solid rgba(255,255,255,0.12)", transition: "all .18s" }}>
                      <li className="nav-item">
                        <Link to="/admin-dashboard/revenue/post" className={linkClass("/admin-dashboard/revenue/post") + " ps-3"}>
                          • <span className="ms-2">Post</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin-dashboard/revenue/apartment" className={linkClass("/admin-dashboard/revenue/apartment") + " ps-3"}>
                          • <span className="ms-2">Căn Hộ</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin-dashboard/revenue/apartment-deposit" className={linkClass("/admin-dashboard/revenue/apartment-deposit") + " ps-3"}>
                          • <span className="ms-2">Đặt Cọc Căn Hộ</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              </li>

              {/* Logout at bottom: push down with margin top */}
              <li className="nav-item mt-4">
                <Link to="/login" className="nav-link rounded-3 px-3 py-2 d-flex align-items-center text-white" style={{ background: "rgba(255,255,255,0.04)", transition: "all .15s" }}>
                  <span style={{ fontWeight: 600 }}>•</span>
                  <span className="ms-2">Đăng xuất</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main
          className="main-content"
          style={{
            marginLeft: 240,
            width: `calc(100% - 240px)`,
            minHeight: "100vh",
            padding: "20px",
            background: "#f7f8fa",
          }}
        >
          {children}
        </main>
      </div>

      {/* Inline styles for scrollbar + small utilities */}
      <style>{`
        /* make sidebar nav scrollbar slim + styled */
        .sidebar-nav::-webkit-scrollbar { width: 8px; }
        .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 8px;
        }
        .sidebar-nav:hover::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.18);
        }

        /* Firefox scrollbar */
        .sidebar-nav { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }

        /* active link visual tweak */
        .nav-link.active {
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        /* ensure submenu indent looks good on small screens */
        @media (max-width: 768px) {
          .sidebar { width: 220px; }
          main { margin-left: 220px; width: calc(100% - 220px); }
        }
      `}</style>
    </div>
  );
}
