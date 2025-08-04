import React, { useEffect, useState } from "react";
import AdminDashboard from "./adminDashboard.jsx";
import axios from "axios";
import Pagination from "../../../components/Pagination";
import { formatSmartDate, formatPhoneNumber } from "../../../utils/format.jsx";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import ReusableModal from "../../../components/ReusableModal.jsx";
import LoadingModal from "../../../components/loadingModal.jsx";
import UniversalFilter from "../../../components/filter.jsx";
const ManageNotifications = () => {
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
                limit: pageSize,
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
        if (!window.confirm("Xác nhận xóa?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/notifications/${id}`);
            toast.success("Đã xóa thông báo");
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
        fetchNotifications();
    }, [page, pageSize, searchParams]);

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
                            <th style={{ width: 80 }}></th>
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
                                    <td>{n.userId?._id || "Tất cả"}</td>
                                    <td>{n.userId?.email || "—"}</td>
                                    <td>{n.userId?.phone ? formatPhoneNumber(n.userId.phone) : "—"}</td>
                                    <td style={{ whiteSpace: "normal", maxWidth: 250 }}>{n.message}</td>
                                    <td>
                                        <span className={`badge ${n.read ? "bg-success" : "bg-warning text-dark"}`}>
                                            {n.read ? "Đã đọc" : "Chưa đọc"}
                                        </span>
                                    </td>
                                    <td>{formatSmartDate(n.createdAt)}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(n._id)}>
                                            Xóa
                                        </button>
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

        </AdminDashboard>
    );
};

export default ManageNotifications;
