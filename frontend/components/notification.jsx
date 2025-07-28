import React, { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
const NotificationBell = ({ user }) => {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef();

    const fetchNotifications = async () => {
        if (user?._id) {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/${user._id}`);
                setNotifications(res.data.filter((n) => !n.read));
            } catch (err) {
                setNotifications([]);
            }
        }
    };
    const handleMarkAllRead = async () => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/notifications/${user._id}/read-all`);
            setNotifications([]);
            toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
            setShowDropdown(false);
        } catch (err) {
            console.error("Mark all failed:", err);
        }
    };
    useEffect(() => {
        fetchNotifications();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [user, showDropdown]);

    const handleNotificationClick = (note, e) => {
        e.stopPropagation();
        e.preventDefault();
        setSelectedNotification(note);
    };
    const extractPostId = (msg) => {
        const match = msg.match(/bài đăng ([a-f0-9]{24})/i); // i = ignore case, match ObjectId chuẩn
        return match ? match[1] : null;
    };
    const closeModal = async () => {
        if (selectedNotification) {
            try {
                await axios.patch(`${import.meta.env.VITE_API_URL}/api/notifications/${selectedNotification._id}/read`);
                setNotifications((prev) => prev.filter((n) => n._id !== selectedNotification._id));
            } catch (err) {
                console.error("Failed to mark as read");
            }
        }
        setSelectedNotification(null);
    };

    return (
        <div className="position-relative" style={{ minWidth: 40 }}>
            <div ref={dropdownRef} className="position-relative">
                <button
                    className="btn btn-link p-0 position-relative"
                    onClick={() => setShowDropdown((prev) => !prev)}
                    title="Thông báo"
                >
                    <FiBell size={22} className="text-dark" />
                    {notifications.length > 0 && (
                        <span
                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                            style={{ fontSize: "0.75rem", minWidth: 20 }}
                        >
                            {notifications.length}
                        </span>
                    )}
                </button>

                {showDropdown && (
                    <div
                        className="dropdown-menu show shadow border-0 rounded-3 mt-2"
                        style={{
                            minWidth: 260,
                            maxWidth: 340,
                            right: 0,
                            left: "auto",
                            top: "100%",
                            zIndex: 1050,
                            fontSize: 15,
                            overflow: "hidden",
                        }}
                    >
                        {notifications.length > 0 && (
                            <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                                <span className="fw-semibold">Thông báo mới</span>
                                <button
                                    className="btn btn-sm btn-link text-decoration-none"
                                    onClick={handleMarkAllRead}
                                >
                                    Đánh dấu tất cả đã đọc
                                </button>
                            </div>
                        )}
                        {notifications.length === 0 ? (
                            <div className="text-center py-3 text-muted">
                                Không có thông báo mới
                            </div>

                        ) : (
                            <div style={{ maxHeight: 260, overflowY: "auto" }}>
                                {notifications.map((note) => (
                                    <button
                                        key={note._id}
                                        className="dropdown-item text-start py-2"
                                        onClick={(e) => handleNotificationClick(note, e)}
                                        style={{ whiteSpace: "normal", lineHeight: 1.4 }}
                                    >
                                        <div>{note.message}</div>

                                        <div className="small text-muted mt-1">
                                            {new Date(note.createdAt).toLocaleString("vi-VN")}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedNotification && (
                <>
                    {/* Modal Backdrop */}
                    <div
                        className="modal-backdrop show"
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            zIndex: 1050,
                        }}
                        onClick={() => closeModal()}
                    ></div>

                    {/* Modal Centered */}
                    <div
                        className="modal fade show d-flex align-items-center justify-content-center"
                        tabIndex="-1"
                        role="dialog"
                        style={{
                            display: "flex",
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            zIndex: 1060,
                        }}
                        onClick={() => closeModal()}
                    >
                        <div
                            className="modal-dialog modal-dialog-centered"
                            style={{ maxWidth: "500px" }}
                            onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
                        >
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header bg-light">
                                    <h5 className="modal-title">Chi tiết thông báo</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeModal}
                                    ></button>
                                </div>

                                <div className="modal-body">
                                    <p style={{ whiteSpace: "normal", lineHeight: 1.5 }}>
                                        {selectedNotification.message}
                                    </p>
                                    <div className="text-muted small mt-2">
                                        {new Date(selectedNotification.createdAt).toLocaleString("vi-VN")}
                                    </div>
                                </div>

                                <div
                                    className="modal-footer bg-light"
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: "10px",
                                        flexWrap: "nowrap",
                                    }}
                                >
                                    {extractPostId(selectedNotification.message) ? (
                                        <a
                                            href={`/postdetail/${extractPostId(selectedNotification.message)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                        >
                                            Xem chi tiết
                                        </a>
                                    ) : null}
                                    <button className="btn btn-outline-secondary" onClick={closeModal}>
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

export default NotificationBell;