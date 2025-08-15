import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import StatusFilter from "../../../components/admin/statusFilter.jsx";
import Pagination from "../../../components/Pagination.jsx";
import Header from "../../../components/header.jsx";
import Footer from "../../../components/footer.jsx";
import { formatSmartDate } from "../../../utils/format.jsx";
const NotificationPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Get values from URL search params
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 10;
    const filterRead = searchParams.get('read') || "";

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

    const extractPostId = (msg) => {
        const match = msg.match(/bài đăng ([a-f0-9]{24})/i);
        return match ? match[1] : null;
    };

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
                        <div className="text-center py-5 text-secondary">Đang tải...</div>
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
                                        background: note.read ? "#f8f9fa" : "#fff",
                                        transition: "opacity 0.2s",
                                        cursor: note.read ? "default" : "pointer",
                                    }}
                                    onClick={() => {
                                        if (!note.read) markAsRead(note._id);
                                    }}
                                >
                                    <div className="flex-grow-1">
                                        <div
                                            className="fw-medium"
                                            style={{ whiteSpace: "normal" }}
                                        >
                                            {note.message}
                                        </div>
                                        <div className="small text-muted mt-1">
                                            {formatSmartDate(note.createdAt)}
                                        </div>
                                        <div className="mt-2 d-flex gap-2 flex-wrap">
                                            {extractPostId(note.message) && (
                                                <a
                                                    href={`/postdetail/${extractPostId(note.message)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    Xem bài đăng
                                                </a>
                                            )}
                                            {note?.data?.declarationId && (
                                                <a
                                                    href={`/residence-declaration/detail/${note.data.declarationId}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    Xem hồ sơ
                                                </a>
                                            )}
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

            <Footer />
        </>
    );
};

export default NotificationPage;
