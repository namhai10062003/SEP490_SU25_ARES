import React, { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./Header.css";
import Navbar from "./navbar";

const Header = ({ user, name, logout }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMouseEnter = (menu) => {
    setActiveMenu(menu);
  };
  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  const [notifications, setNotifications] = useState([
    { id: 1, text: "🎉 Chào mừng bạn đến với web!", link: "/welcome" },
    {
      id: 2,
      text: "🖼️ Bạn chưa cập nhật thông tin cá nhân của mình! Hãy cập nhật bạn nhé >>>.",
      link: "/profile",
    },
    { id: 3, text: "🔔 Đã có bản cập nhật mới cho ứng dụng.", link: "/updates" },
    { id: 4, text: "🔔 Đã có bản dịch vụ mới. Mọi người vào xem nhé❤️", link: "/updates" },
    { id: 5, text: "🔔 Đã có update mới về căn hộ. Mọi người vào xem nhé❤️", link: "/updates" },
  ]);

  const dropdownRef = useRef();

  useEffect(() => {
    let timer;
    if (user) {
      setShowNotification(true);

      timer = setTimeout(() => {
        setShowNotification(false);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotification(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleNotification = () => {
    setShowNotification((prev) => !prev);
  };

  return (
    <header className="header">
      <div className="logo"> A R E S</div>
      <Navbar />
      <div className="header-right">
        {user ? (
          <div className="user-logged-in">
            <span className="welcome-message">Hello, {name}</span>
            <div
              className="avatar-wrapper"
              ref={dropdownRef}
              style={{ position: "relative" }}
            >
              {/* Chuông thông báo */}
              <div
                className="notification-icon"
                title="Notifications"
                onClick={toggleNotification}
                style={{ cursor: "pointer", position: "relative" }}
              >
                <FiBell size={20} />
                {notifications.length > 0 && (
                  <span className="notification-badge">{notifications.length}</span>
                )}
              </div>

              {/* Dropdown thông báo */}
              {showNotification && (
                <div className="notification-dropdown">
                  {notifications.length === 0 ? (
                    <p className="no-notifications">Không có thông báo mới</p>
                  ) : (
                    <div className="notification-list">
                      {notifications.map((note) => (
                        <Link
                          key={note.id}
                          to={note.link}
                          className="notification-item"
                          onClick={() => setShowNotification(false)}
                        >
                          {note.text}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div
                className="profile-dropdown"
                onMouseEnter={() => handleMouseEnter("profile")}
                onMouseLeave={handleMouseLeave}
              >
                <div className="profile-link">
                  <img
                    src="https://i.imgur.com/2DhmtJ4.png"
                    alt="Avatar"
                    className="avatar"
                  />
                  <span>My Profile</span>
                </div>

                {activeMenu === "profile" && (
                  <ul className="dropdown-menu">
                    <li>
                <Link to="/profile/quanlipostcustomer">Quản lí tin đăng</Link>
              </li>
                    <li><Link to="/profile/settings">Settings</Link></li>
                    <li><Link to="/profile/security">Security</Link></li>
                  </ul>
                )}
              </div>

              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="user-guest">
            <Link to="/login" className="login-link">
              Sign In
            </Link>
            <Link to="/register" className="register-btn">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
