import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./navbar";
import NotificationBell from "./notification";

const Header = ({ user, name, logout }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef();

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

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top py-2 px-3">
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
              <div className="dropdown" ref={profileDropdownRef} style={{ position: "relative" }}>
                <button
                  className={`btn btn-link p-0 dropdown-toggle${showProfileDropdown ? " show" : ""}`}
                  type="button"
                  id="profileDropdown"
                  onClick={() => setShowProfileDropdown((prev) => !prev)}
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
                  className={`dropdown-menu dropdown-menu-end mt-2${showProfileDropdown ? " show" : ""}`}
                  aria-labelledby="profileDropdown"
                  style={{ minWidth: 180, position: "absolute" }}
                >
                  <li>
                    <Link className="dropdown-item" to="/profile" onClick={() => setShowProfileDropdown(false)}>
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-apartment" onClick={() => setShowProfileDropdown(false)}>
                      Căn Hộ Của Tôi
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-verified" onClick={() => setShowProfileDropdown(false)}>
                      Lịch Sử Xác Nhận Cư Dân
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-contracts" onClick={() => setShowProfileDropdown(false)}>
                      Quản Lý Hợp Đồng
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-requests" onClick={() => setShowProfileDropdown(false)}>
                      Quản Lí Yêu Cầu
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/profile/quanlipostcustomer" onClick={() => setShowProfileDropdown(false)}>
                      Quản lí Tin Đăng
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-revenue" onClick={() => setShowProfileDropdown(false)}>
                      Doanh Thu Của Tôi
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 👇 Logout */}
              <button onClick={logout} className="btn btn-outline-warning ms-2">
                Log out
              </button>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn btn-link text-secondary fw-semibold">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-warning fw-semibold px-3 rounded-pill">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;