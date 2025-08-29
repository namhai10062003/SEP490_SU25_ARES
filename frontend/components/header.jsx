import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import NotificationBell from "./notificationBell";
import { useAuth } from "/context/AuthContext";
const HEADER_HEIGHT = 64; // px, adjust if your header is taller/shorter

const Header = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // Hàm xử lý logout
  // const handleLogout = () => {
  //   logout();
  //   navigate("/login");
  // };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Custom style for fixed header
  const fixedHeaderStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1050, // higher than modal, dropdown, etc.
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  };

  // Add a spacer div after the header to push content down
  // You can adjust the height if your header is taller/shorter
  return (
    <>
      <nav
        className="navbar navbar-expand-lg py-2 px-3"
        style={fixedHeaderStyle}
      >
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold text-warning fs-4" to="/">
            A R E S
          </Link>

          <Navbar />

          <div className="d-flex align-items-center gap-3 ms-auto">
            {user ? (
              <>
                <span className="fw-semibold text-secondary">
                  Hello, {name || user?.name || "Người dùng"}
                </span>

                {/* 👇 Notification Bell */}
                <NotificationBell user={user} />

                {/* 👇 Profile Dropdown */}
                <div
                  className="dropdown"
                  ref={profileDropdownRef}
                  style={{ position: "relative" }}
                >
                  <button
                    className={`btn btn-link p-0 dropdown-toggle${showProfileDropdown ? " show" : ""
                      }`}
                    type="button"
                    id="profileDropdown"
                    onClick={() =>
                      setShowProfileDropdown((prev) => !prev)
                    }
                    tabIndex={0}
                  >
                    <img
                      src="https://i.imgur.com/2DhmtJ4.png"
                      alt="Avatar"
                      className="rounded-circle border"
                      style={{ width: 36, height: 36, objectFit: "cover" }}
                    />
                  </button>
                  <ul
                    className={`dropdown-menu dropdown-menu-end mt-2${showProfileDropdown ? " show" : ""
                      }`}
                    aria-labelledby="profileDropdown"
                    style={{ minWidth: 180, position: "absolute" }}
                  >
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Trang Cá Nhân
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/my-apartment"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Căn Hộ Của Tôi
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/my-verified"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Lịch Sử Xác Nhận Cư Dân
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/my-contracts"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Quản Lý Hợp Đồng
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/my-requests"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Quản Lí Yêu Cầu
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/profile/quanlipostcustomer"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Quản lí Tin Đăng
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/my-revenue"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Doanh Thu Của Tôi
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/payment-history"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Lịch Sử Thanh Toán
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* 👇 Logout */}
                <button
                  onClick={logout}
                  className="btn btn-outline-warning ms-2"
                >
                  Đăng Xuất
                </button>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-link text-secondary fw-semibold"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="btn btn-warning fw-semibold px-3 rounded-pill"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content being hidden under the fixed header */}
      <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT }} />
    </>
  );
};

export default Header;