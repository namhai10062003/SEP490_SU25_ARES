import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import StatusFilter from "../../../components/admin/statusFilter.jsx";
import Pagination from "../../../components/Pagination.jsx";
import Header from "../../../components/header.jsx";
import Footer from "../../../components/footer.jsx";
import ReuseableModal from "../../../components/ReusableModal.jsx";
import { formatSmartDate } from "../../../utils/format.jsx";
import { getNotificationLink, maskNotificationMessage } from "../../../utils/getLinkFromNoti.jsx";
const NotificationPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Lấy query params
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const filterRead = searchParams.get("read") || "";

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem("token");
            if (!token || !user?._id) {
                navigate("/login");
                return;
            }

            setLoading(true);
            try {
                const params = { page, limit: pageSize };
                if (filterRead !== "") params.read = filterRead;

                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/notifications/${user._id}`,
                    {
                        params,
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setNotifications(res.data.notifications || res.data);
                setTotalPages(res.data.totalPages || 1);
                setTotalItems(
                    res.data.totalItems ||
                    (res.data.notifications
                        ? res.data.notifications.length
                        : res.data.length)
                );
            } catch (err) {
                console.error("❌ Lỗi lấy thông báo:", err);
                setNotifications([]);
                setTotalPages(1);
                setTotalItems(0);
            }
            setLoading(false);
        };

        fetchNotifications();
    }, [user, navigate, page, pageSize, filterRead]);

    const markAsRead = async (notificationId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`
            );
            setNotifications((prev) =>
                prev.map((n) =>
                    n._id === notificationId ? { ...n, read: true } : n
                )
            );
        } catch { }
    };

    const handleNotificationClick = async (notification) => {
        setSelectedNotification(notification);
        setShowModal(true);

        if (!notification.read) {
            await markAsRead(notification._id);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedNotification(null);
    };

    // Chặn scroll background khi mở modal
    useEffect(() => {
        if (showModal) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => {
            document.body.classList.remove("modal-open");
        };
    }, [showModal]);



    // Cập nhật query string
    const updateSearchParams = (updates) => {
        const newSearchParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === "" || value === null || value === undefined) {
                newSearchParams.delete(key);
            } else {
                newSearchParams.set(key, value.toString());
            }
        });
        setSearchParams(newSearchParams);
    };

    const handlePageChange = (newPage) => {
        updateSearchParams({ page: newPage });
    };

    const handlePageSizeChange = (newPageSize) => {
        updateSearchParams({ pageSize: newPageSize, page: 1 });
    };

    const handleFilterChange = (newFilter) => {
        updateSearchParams({ read: newFilter, page: 1 });
    };

    return (
        <>
            <style>
                {`
        body.modal-open {
          overflow: hidden;
        }
      `}
            </style>
            <Header user={user} logout={logout} />

            <div className="container py-4" style={{ maxWidth: 700 }}>
                <h2 className="mb-4 fw-bold">Thông báo</h2>
                <div className="d-flex align-items-center gap-3 mb-3">
                    <StatusFilter
                        value={filterRead}
                        onChange={handleFilterChange}
                        type="notification"
                    />
                    <span className="text-muted small ms-auto">
                        Tổng cộng: <strong>{totalItems}</strong> thông báo
                    </span>
                </div>

                <div className="bg-white rounded shadow-sm border p-0">
                    {loading ? (
                        <div className="text-center py-5 text-secondary">
                            Đang tải...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            Không có thông báo nào
                        </div>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {notifications.map((note) => (
                                <li
                                    key={note._id}
                                    className="list-group-item d-flex align-items-start gap-3"
                                    style={{
                                        opacity: note.read ? 0.5 : 1,
                                        background: note.read
                                            ? "#f8f9fa"
                                            : "#fff",
                                        transition: "opacity 0.2s",
                                        cursor: "pointer",
                                    }}
                                    onClick={() =>
                                        handleNotificationClick(note)
                                    }
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {
                                            handleNotificationClick(note);
                                        }
                                    }}
                                    aria-label={`Thông báo: ${maskNotificationMessage(note.message)}`}
                                >
                                    <div className="flex-grow-1">
                                        <div
                                            className="fw-medium"
                                            style={{ whiteSpace: "normal" }}
                                        >
                                            {maskNotificationMessage(note.message)}
                                        </div>
                                        <div className="small text-muted mt-1">
                                            {formatSmartDate(note.createdAt)}
                                        </div>

                                    </div>
                                    {!note.read && (
                                        <span
                                            className="badge bg-primary align-self-center"
                                            style={{ minWidth: 60 }}
                                        >
                                            Mới
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>

            {/* Notification Modal */}
            {showModal && selectedNotification && (
                <ReuseableModal
                    show={showModal}
                    onClose={closeModal}
                    title="Chi tiết thông báo"
                    body={
                        <>
                            <div className="mb-3">
                                <strong>Nội dung:</strong>
                                <p className="mt-2">
                                    {maskNotificationMessage(selectedNotification?.message)}
                                </p>
                            </div>

                            <div className="mb-3">
                                <strong>Thời gian:</strong>
                                <p className="mt-2 text-muted">
                                    {formatSmartDate(
                                        selectedNotification?.createdAt
                                    )}
                                </p>
                            </div>

                            <div className="d-flex gap-2 flex-wrap">
                                {getNotificationLink(selectedNotification) && (
                                    <a
                                        href={getNotificationLink(selectedNotification)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                    >
                                        Đi đến chi tiết
                                    </a>
                                )}
                            </div>
                        </>
                    }
                />
            )}

            <Footer />
        </>
    );
};

export default NotificationPage;
