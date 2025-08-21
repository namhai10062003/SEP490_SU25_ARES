import React, { useEffect, useState } from "react";
import AdminDashboard from "./adminDashboard.jsx";
import axios from "axios";
import Pagination from "../../../components/Pagination";
import { formatDateWithTime, formatPhoneNumber } from "../../../utils/format.jsx";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import ReusableModal from "../../../components/ReusableModal.jsx";
import LoadingModal from "../../../components/loadingModal.jsx";
import UniversalFilter from "../../../components/filter.jsx";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const ManageNotifications = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPage = Number(searchParams.get("page")) || 1;
    const initialPageSize = Number(searchParams.get("pageSize")) || 10;

    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const [filters, setFilters] = useState({
        email: searchParams.get("email") || "",
        from: searchParams.get("from") || "",
        to: searchParams.get("to") || "",
    });

    const [formData, setFormData] = useState({
        message: "",
        userId: "",
    });

    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const updateQuery = (newParams = {}) => {
        const updated = {
            ...Object.fromEntries(searchParams.entries()),
            ...newParams,
        };
        Object.keys(updated).forEach(
            (key) => (updated[key] === "" || updated[key] == null) && delete updated[key]
        );
        setSearchParams(updated);
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams({
                page,
                pageSize,
                ...filters,
            }).toString();

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications?${query}`);
            setNotifications(res.data.notifications);
            setTotalPages(Math.ceil(res.data.total / pageSize));
        } catch (err) {
            toast.error("Lỗi khi tải thông báo");
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/notifications/${deleteId}`);
            toast.success("Đã xóa thông báo");
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchNotifications();
        } catch (err) {
            toast.error("Xóa thất bại!");
        }
    };

    const handleSendNotification = async () => {
        if (!formData.message.trim()) {
            toast.warn("Vui lòng nhập nội dung");
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${import.meta.env.VITE_API_URL}/api/notifications/sendAll`, formData);
            toast.success("Đã gửi thông báo");
            setFormData({ message: "", userId: "" });
            setShowModal(false);
            fetchNotifications();
        } catch (err) {
            toast.error("Gửi thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        if (filters.from && filters.to && filters.from > filters.to) {
            toast.warn("Ngày bắt đầu không được sau ngày kết thúc");
            return;
        }
        setPage(1);
        updateQuery({ ...filters, page: 1 });
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const email = params.get("email") || "";
        const from = params.get("from") || "";
        const to = params.get("to") || "";

        // Nếu không có filter nào nhưng vẫn còn state filter → reset
        if (!email && !from && !to && (filters.email || filters.from || filters.to)) {
            setFilters({ email: "", from: "", to: "" });
            setPage(1);
            setPageSize(10);
            updateQuery({ page: 1, pageSize: 10 });
            return;
        }

        fetchNotifications();
    }, [location.key, page, pageSize]);

    return (

        <AdminDashboard title="Quản lý Thông báo">
            {loading && <LoadingModal />}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">📢 Danh sách thông báo</h4>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    Gửi thông báo mới
                </button>
            </div>

            {/* Bộ lọc */}
            <UniversalFilter
                filters={filters}
                setFilters={setFilters}
                onFilter={handleFilter}
                onReset={() => {
                    setFilters({ email: "", from: "", to: "" });
                    setPage(1);
                    updateQuery({ page: 1, email: "", from: "", to: "" });
                }}
                fields={[
                    { name: "email", placeholder: "Tìm theo email", type: "text" },
                    { name: "from", type: "date" },
                    { name: "to", type: "date" },
                ]}
            />


            {/* Table */}
            <div className="table-responsive shadow-sm border rounded">
                <table className="table table-hover table-bordered align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Người nhận</th>
                            <th>Email</th>
                            <th>Điện thoại</th>
                            <th>Nội dung</th>
                            <th>Trạng thái</th>
                            <th>Thời gian</th>
                            <th>Hành động</th>

                        </tr>
                    </thead>
                    <tbody>
                        {notifications.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    Không có thông báo nào.
                                </td>
                            </tr>
                        ) : (
                            notifications.map((n) => (
                                <tr key={n._id}>
                                    <td>
                                        {n.userId?._id ? (
                                            <Link to={`/admin-dashboard/manage-user/${n.userId._id}`}>
                                                {n.userId.name}
                                            </Link>
                                        ) : (
                                            "Tất cả"
                                        )}
                                    </td>
                                    <td>{n.userId?.email || "—"}</td>
                                    <td>{n.userId?.phone ? formatPhoneNumber(n.userId.phone) : "—"}</td>
                                    <td style={{ whiteSpace: "normal", maxWidth: 150 }}>{n.message}</td>
                                    <td>
                                        <span className={`badge ${n.read ? "bg-success" : "bg-warning text-dark"}`}>
                                            {n.read ? "Đã đọc" : "Chưa đọc"}
                                        </span>
                                    </td>
                                    <td>{formatDateWithTime(n.createdAt)}</td>
                                    <td>
                                        <div className="d-flex justify-content-center">
                                            <button className="btn btn-outline-danger" onClick={() => handleDelete(n._id)}>
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                    setPage(p);
                    updateQuery({ page: p });
                }}
                pageSize={pageSize}
                onPageSizeChange={(s) => {
                    setPageSize(s);
                    setPage(1);
                    updateQuery({ pageSize: s, page: 1 });
                }}
            />

            {/* Modal */}
            {showModal && (
                <ReusableModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    title="Gửi thông báo mới"
                    body={
                        <>
                            <div className="mb-3">
                                <label className="form-label">Nội dung</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={formData.message}
                                    onChange={(e) =>
                                        setFormData({ ...formData, message: e.target.value })
                                    }
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">— Gửi tất cả người dùng —</label>
                            </div>
                        </>
                    }
                    footerButtons={[
                        {
                            label: "Đóng",
                            variant: "secondary",
                            onClick: () => setShowModal(false),
                        },
                        {
                            label: "Gửi",
                            variant: "primary",
                            onClick: handleSendNotification,
                        },
                    ]}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <ReusableModal
                    show={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setDeleteId(null);
                    }}
                    title="Xác nhận xóa"
                    body="Bạn có chắc chắn muốn xóa thông báo này không?"
                    size="md"
                    footerButtons={[
                        {
                            label: "Hủy",
                            variant: "secondary",
                            onClick: () => {
                                setShowDeleteModal(false);
                                setDeleteId(null);
                            },
                        },
                        {
                            label: "Xóa",
                            variant: "danger",
                            onClick: confirmDelete,
                        },
                    ]}
                />
            )}

        </AdminDashboard>
    );
};

export default ManageNotifications;
