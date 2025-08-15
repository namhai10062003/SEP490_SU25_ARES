import axios from "axios";
import React, { useEffect, useId, useState } from "react";
import { FiBell } from "react-icons/fi";
import { toast } from "react-toastify";
import { formatSmartDate } from "../utils/format";
import { Link, useNavigate } from "react-router-dom";

/**
 * NotificationBell
 * - No useRef (uses useId + getElementById for outside click)
 * - Works with endpoints:
 *   GET    /api/notifications/unread/:userId
 *   PATCH  /api/notifications/:notificationId/read
 *   PATCH  /api/notifications/:userId/read-all
 */
const NotificationBell = ({ user }) => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const navigate = useNavigate();

    // Stable unique id to scope outside-click without useRef
    const rootId = useId();
    const rootDomId = `nbell-${String(rootId).replace(/[^a-zA-Z0-9-_:.]/g, "")}`;

    // Helpers
    const extractPostId = (msg = "") => {
        const match = msg.match(/bài đăng ([a-f0-9]{24})/i);
        return match ? match[1] : null;
    };
    const extractDeclarationId = (msg = "") => {
        const match = msg.match(/hồ sơ ([a-f0-9]{24})/i);
        return match ? match[1] : null;
    };
    const fmtTime = (d) => {
        try {
            return typeof formatSmartDate === "function"
                ? formatSmartDate(d)
                : new Date(d).toLocaleString("vi-VN");
        } catch {
            return new Date(d).toLocaleString("vi-VN");
        }
    };

    // Fetch unread notifications
    const fetchNotifications = async () => {
        if (!user?._id) return;
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/notifications/unread/${user._id}`,
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
            setNotifications([]);
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
            setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        } catch (err) {
            console.error("❌ Mark one read failed:", err?.response?.data || err.message);
            toast.error("Không thể đánh dấu đã đọc");
        }
    };

    // When user changes, refetch unread
    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id]);

    // Close dropdown when clicking outside (without useRef)
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
    const openNotification = (note) => {
        setSelectedNotification(note);
        setShowDropdown(false);
    };

    // Close modal and mark selected as read
    const closeModal = async () => {
        if (selectedNotification?._id) {
            await markOneRead(selectedNotification._id);
        }
        setSelectedNotification(null);
    };

    // Navigate helpers (no preventDefault/stopPropagation)
    const handleViewPost = () => {
        const postId = extractPostId(selectedNotification?.message);
        if (postId) {
            navigate(`/postdetail/${postId}`);
            // Mark read & close
            closeModal();
        }
    };
    const handleViewDeclaration = () => {
        const id = selectedNotification?.data?.declarationId || extractDeclarationId(selectedNotification?.message);
        if (id) {
            navigate(`/residence-declaration/detail/${id}`);
            closeModal();
        }
    };

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
                {notifications.length > 0 && (
                    <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.8rem", minWidth: 20, padding: "2px 6px" }}
                    >
                        {notifications.length}
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
                        <span className="fw-semibold">Thông báo mới</span>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleMarkAllRead}
                            disabled={notifications.length === 0}
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    </div>

                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <div className="text-center text-muted py-4">Không có thông báo mới</div>
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
                    {/* Backdrop */}
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

                    {/* Modal */}
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
                            onClick={(e) => e.stopPropagation()} // allow clicking inside without closing
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

                                <div className="modal-footer bg-light d-flex flex-wrap justify-content-between gap-2">
                                    <div>
                                        <button
                                            type="button"
                                            className="btn btn-outline-success btn-sm"
                                            onClick={closeModal}
                                        >
                                            Đánh dấu đã đọc
                                        </button>
                                    </div>
                                    <div className="d-flex gap-2">
                                        {extractPostId(selectedNotification.message) && (
                                            <button type="button" className="btn btn-primary btn-sm" onClick={handleViewPost}>
                                                Xem bài đăng
                                            </button>
                                        )}
                                        {selectedNotification?.data?.declarationId ||
                                            extractDeclarationId(selectedNotification?.message) ? (
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                onClick={handleViewDeclaration}
                                            >
                                                Xem hồ sơ
                                            </button>
                                        ) : null}
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedNotification(null)}>
                                            Đóng
                                        </button>
                                    </div>
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
