import React, { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import axios from "axios";

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
                        <div className="px-3 py-2 border-bottom fw-semibold bg-light">
                            Thông báo mới
                        </div>
                        {notifications.length === 0 ? (
                            <div className="text-center text-muted py-3 small">
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
                    <div
                        className="modal fade show"
                        style={{
                            display: "block",
                            background: "rgba(0, 0, 0, 0.4)",
                        }}
                        tabIndex={-1}
                        onClick={closeModal}
                    >
                        <div
                            className="modal-dialog modal-dialog-centered"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-content shadow">
                                <div className="modal-header">
                                    <h5 className="modal-title">Chi tiết thông báo</h5>
                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body">
                                    <p>{selectedNotification.message}</p>
                                    <div className="text-muted small mt-2">
                                        {new Date(selectedNotification.createdAt).toLocaleString("vi-VN")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Optional backdrop effect */}
                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
