import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";
import Navbar from "./navbar";

const Header = ({ user, name, logout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef();
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

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !selectedNotification
      ) {
        setShowDropdown(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };
    if (showDropdown || showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user, showDropdown, selectedNotification, showProfileDropdown]);

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
    <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top py-2 px-3">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-warning fs-4" to="/">
          A R E S
        </Link>
        <Navbar />
        <div className="d-flex align-items-center gap-3 ms-auto">
          {user ? (
            <>
              <span className="fw-semibold text-secondary">Hello, {name}</span>
              {/* Notification bell */}
              <div className="d-flex align-items-center" style={{ minWidth: 40 }}>
                <button
                  className="btn btn-link p-0 d-flex align-items-center"
                  style={{ color: "#333", minWidth: 0 }}
                  onClick={() => setShowDropdown((prev) => !prev)}
                  title="Notifications"
                  ref={dropdownRef}
                >
                  <span className="position-relative">
                    <FiBell size={22} />
                    {notifications.length > 0 && (
                      <span
                        className="position-absolute start-75 translate-middle badge rounded-pill bg-danger"
                        style={{
                          fontSize: 12,
                          left: 15,
                          top: 5,
                          padding: "2px 6px",
                          minWidth: 20,
                          lineHeight: "16px",
                        }}
                      >
                        {notifications.length}
                      </span>
                    )}
                  </span>
                </button>
                {/* Notification dropdown */}
                {showDropdown && (
                  <div
                    className="dropdown-menu show p-0"
                    style={{
                      minWidth: 240, // Giảm chiều rộng
                      maxWidth: 320,
                      right: 0,
                      left: "auto",
                      top: 40,
                      zIndex: 1000,
                      position: "absolute",
                      fontSize: 15,
                    }}
                  >
                    <div className="px-3 py-2 border-bottom fw-bold" style={{ fontSize: 16 }}>
                      Thông báo mới
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center text-secondary py-3" style={{ fontSize: 14 }}>
                        Không có thông báo mới
                      </div>
                    ) : (
                      <div style={{ maxHeight: 260, overflowY: "auto" }}>
                        {notifications.map((note) => (
                          <div
                            key={note._id}
                            className="dropdown-item"
                            style={{
                              cursor: "pointer",
                              whiteSpace: "normal",
                              fontSize: 14,
                              padding: "10px 16px",
                            }}
                            onClick={() => handleNotificationClick(note)}
                          >
                            <div className="fw-normal">{note.message}</div>
                            <div className="small text-muted">
                              {new Date(note.createdAt).toLocaleString("vi-VN")}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Notification modal */}
              {selectedNotification && (
                <div
                  className="modal fade show"
                  style={{
                    display: "block",
                    background: "rgba(0,0,0,0.3)",
                  }}
                  tabIndex={-1}
                  onClick={closeModal}
                >
                  <div
                    className="modal-dialog modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Thông báo</h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={closeModal}
                        ></button>
                      </div>
                      <div className="modal-body">
                        <div>{selectedNotification.message}</div>
                        <div className="small text-muted mt-2">
                          {new Date(selectedNotification.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Profile dropdown */}
              <div className="dropdown" ref={profileDropdownRef} style={{ position: "relative" }}>
                <button
                  className={`btn btn-link p-0 dropdown-toggle${showProfileDropdown ? " show" : ""}`}
                  type="button"
                  id="profileDropdown"
                  onClick={() => setShowProfileDropdown((prev) => !prev)}
                  tabIndex={0}
                // KHÔNG dùng data-bs-toggle hay aria-expanded
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
                      Căn hộ của tôi
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-verified" onClick={() => setShowProfileDropdown(false)}>
                      Lịch Sử Xác Nhận Cư Dân
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-contracts" onClick={() => setShowProfileDropdown(false)}>
                      Quản lí hợp đồng
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-requests" onClick={() => setShowProfileDropdown(false)}>
                      Quản Lí Yêu Cầu
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/profile/quanlipostcustomer" onClick={() => setShowProfileDropdown(false)}>
                      Quản lí tin đăng
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-revenue" onClick={() => setShowProfileDropdown(false)}>
                      Doanh Thu Của Tôi
                    </Link>
                  </li>
                  {/* <li>
                    <Link className="dropdown-item" to="/profile/settings" onClick={() => setShowProfileDropdown(false)}>
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/profile/security" onClick={() => setShowProfileDropdown(false)}>
                      Security
                    </Link>
                  </li> */}
                </ul>
              </div>
              <button onClick={logout} className="btn btn-outline-warning ms-2">
                Logout
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