import React, { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Header.css";
import Navbar from "./navbar";

const Header = ({ user, name, logout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dropdownRef = useRef();

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (user?._id) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/notifications/${user._id}`
        );
        setNotifications(res.data.filter((n) => !n.read));
      } catch (err) {
        setNotifications([]);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close dropdown if modal is NOT open
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !selectedNotification // <-- Only close if modal is not open
      ) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, selectedNotification]);

  // Mark as read and show modal
  const handleNotificationClick = async (note) => {
    setSelectedNotification(note);
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${note._id}/read`
      );
      setNotifications((prev) => prev.filter((n) => n._id !== note._id));
    } catch (err) { }
  };

  // Close modal
  const closeModal = () => setSelectedNotification(null);

  return (
    <header className="header">
      <div className="logo">A R E S</div>
      <Navbar />
      <div className="header-right">
        {user ? (
          <div className="user-logged-in">
            <span className="welcome-message">Hello, {name}</span>
            <div className="avatar-wrapper" style={{ position: "relative" }}>
              {/* Notification bell */}
              <div
                className="notification-icon"
                title="Notifications"
                onClick={() => setShowDropdown((prev) => !prev)}
                style={{ cursor: "pointer", position: "relative" }}
              >
                <FiBell size={22} />
                {notifications.length > 0 && (
                  <span className="notification-badge">{notifications.length}</span>
                )}
              </div>

              {/* Notification dropdown */}
              {showDropdown && (
                <div
                  className="notification-dropdown"
                  ref={dropdownRef}
                  style={{
                    position: "absolute",
                    top: 36,
                    right: 0,
                    width: 340,
                    maxHeight: 320,
                    background: "#fff",
                    border: "1px solid #eee",
                    borderRadius: 8,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                    overflowY: "auto",
                    zIndex: 1000,
                  }}
                >
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee", fontWeight: 600 }}>
                    Thông báo mới
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ color: "#888", textAlign: "center", padding: 24 }}>
                      Không có thông báo mới
                    </div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {notifications.map((note) => (
                          <tr
                            key={note._id}
                            className="notification-row"
                            style={{
                              cursor: "pointer",
                              background: "#fff",
                              borderBottom: "1px solid #f0f0f0",
                              transition: "background 0.2s",
                            }}
                            onClick={() => handleNotificationClick(note)}
                          >
                            <td style={{ padding: "10px 8px", fontSize: 15, maxWidth: 200, wordBreak: "break-word" }}>
                              {note.message}
                            </td>
                            <td style={{ padding: "10px 8px", fontSize: 13, color: "#888", textAlign: "right", whiteSpace: "nowrap" }}>
                              {new Date(note.createdAt).toLocaleString("vi-VN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Notification modal */}
              {selectedNotification && (
                <div
                  className="notification-modal"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                  }}
                  onClick={closeModal} // Only closes modal, not dropdown
                >
                  <div
                    className="notification-modal-content"
                    style={{
                      background: "#fff",
                      borderRadius: 8,
                      minWidth: 320,
                      maxWidth: 400,
                      maxHeight: "70vh",
                      overflowY: "auto",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                      padding: 24,
                      position: "relative",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 style={{ margin: 0, marginBottom: 16 }}>Thông báo</h3>
                    <div style={{ fontSize: 16, marginBottom: 12 }}>
                      {selectedNotification.message}
                    </div>
                    <div style={{ fontSize: 13, color: "#888" }}>
                      {new Date(selectedNotification.createdAt).toLocaleString("vi-VN")}
                    </div>
                    <button
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 14,
                        background: "none",
                        border: "none",
                        fontSize: 18,
                        cursor: "pointer",
                        color: "#888",
                      }}
                      onClick={closeModal}
                      aria-label="Đóng"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <Link to="/profile" className="profile-link">
                <img
                  src="https://i.imgur.com/2DhmtJ4.png"
                  alt="Avatar"
                  className="avatar"
                />
                <span>My Profile</span>
              </Link>

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