import axios from "axios";
import React, { useEffect, useId, useState } from "react";
import { FiBell } from "react-icons/fi";
import { toast } from "react-toastify";
import { formatSmartDate } from "../utils/format";
import { Link, useNavigate } from "react-router-dom";

const NotificationBell = ({ user }) => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const navigate = useNavigate();

    const rootId = useId();
    const rootDomId = `nbell-${String(rootId).replace(/[^a-zA-Z0-9-_:.]/g, "")}`;

    const fmtTime = (d) => {
        try {
            return typeof formatSmartDate === "function"
                ? formatSmartDate(d)
                : new Date(d).toLocaleString("vi-VN");
        } catch {
            return new Date(d).toLocaleString("vi-VN");
        }
    };

    // Fetch recent notifications (10 noti)
    const fetchNotifications = async () => {
        if (!user?._id) return;
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/notifications/recent/${user._id}`,
                token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
            );
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("❌ Fetch notifications failed:", err?.response?.data || err.message);
            setNotifications([]);
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        if (!user?._id) return;
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/notifications/${user._id}/read-all`,
                {},
                token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
            );
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
            setShowDropdown(false);
        } catch (err) {
            console.error("❌ Mark all read failed:", err?.response?.data || err.message);
            toast.error("Không thể đánh dấu tất cả đã đọc");
        }
    };

    // Mark single as read
    const markOneRead = async (notificationId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
                {},
                token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
            );
            setNotifications((prev) => prev.map((n) => n._id === notificationId ? { ...n, read: true } : n));
        } catch (err) {
            console.error("❌ Mark one read failed:", err?.response?.data || err.message);
            toast.error("Không thể đánh dấu đã đọc");
        }
    };

    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!showDropdown) return;
        const onDown = (e) => {
            const root = document.getElementById(rootDomId);
            if (!root) return;
            if (!root.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [showDropdown, rootDomId]);

    // Open modal for a single notification
    const openNotification = async (note) => {
        setSelectedNotification(note);
        setShowDropdown(false);
        if (!note.read) {
            await markOneRead(note._id);
        }
    };

    const closeModal = () => {
        setSelectedNotification(null);
    };

    // Badge count = số unread
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div id={rootDomId} className="notification-bell-wrapper" style={{ position: "relative" }}>
            {/* Bell button */}
            <button
                type="button"
                className="btn btn-link p-0 position-relative"
                style={{ minWidth: 40 }}
                onClick={() => setShowDropdown((v) => !v)}
                title="Thông báo"
                aria-label="Thông báo"
            >
                <FiBell size={22} className="text-dark" />
                {unreadCount > 0 && (
                    <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.8rem", minWidth: 20, padding: "2px 6px" }}
                    >
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div
                    className="notification-dropdown shadow"
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "110%",
                        minWidth: 320,
                        maxWidth: 380,
                        background: "#fff",
                        borderRadius: 10,
                        zIndex: 2000,
                        boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
                        overflow: "hidden",
                        border: "1px solid #eee",
                    }}
                    role="menu"
                    aria-label="Danh sách thông báo"
                >
                    <div
                        className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
                        style={{ background: "#f8f9fa" }}
                    >
                        <span className="fw-semibold">Thông báo</span>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0}
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    </div>

                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <div className="text-center text-muted py-4">Không có thông báo</div>
                        ) : (
                            notifications.map((note) => (
                                <button
                                    key={note._id}
                                    type="button"
                                    className="notification-item px-3 py-2 w-100 text-start"
                                    style={{
                                        cursor: "pointer",
                                        background: "transparent",
                                        border: "none",
                                        borderBottom: "1px solid #eee",
                                        transition: "background 0.15s",
                                        opacity: note.read ? 0.6 : 1,
                                    }}
                                    onClick={() => openNotification(note)}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <div className="d-flex align-items-start">
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                className="fw-normal"
                                                style={{ whiteSpace: "normal", wordBreak: "break-word", fontSize: 15 }}
                                            >
                                                {note.message}
                                            </div>
                                            <div className="small text-muted mt-1">{fmtTime(note.createdAt)}</div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="text-end px-3 py-2 border-top bg-light">
                        <Link
                            to="/notifications"
                            className="btn btn-sm btn-primary"
                            style={{ minWidth: 100 }}
                            onClick={() => setShowDropdown(false)}
                        >
                            Xem tất cả
                        </Link>
                    </div>
                </div>
            )}

            {/* Notification Detail Modal */}
            {selectedNotification && (
                <>
                    <div
                        className="modal-backdrop show"
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            background: "rgba(0,0,0,0.35)",
                            zIndex: 3000,
                        }}
                        onClick={closeModal}
                    ></div>

                    <div
                        className="modal show"
                        tabIndex={-1}
                        role="dialog"
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            zIndex: 3100,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onClick={closeModal}
                    >
                        <div
                            className="modal-dialog modal-dialog-centered"
                            style={{ maxWidth: 500, width: "100%" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header bg-light">
                                    <h5 className="modal-title mb-0">Chi tiết thông báo</h5>
                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body">
                                    <div style={{ whiteSpace: "normal", lineHeight: 1.6, fontSize: 16 }}>
                                        {selectedNotification.message}
                                    </div>
                                    <div className="text-muted small mt-3">
                                        {fmtTime(selectedNotification.createdAt)}
                                    </div>
                                </div>
                                <div className="modal-footer bg-light">
                                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closeModal}>
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