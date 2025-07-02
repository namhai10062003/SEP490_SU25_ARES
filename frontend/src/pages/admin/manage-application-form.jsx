import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboard from "./adminDashboard.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PAGE_SIZE = 10;

const ManageApplicationForm = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/resident-verifications`);
            setApplications(res.data);
        } catch (err) {
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (app) => {
        setSelectedApp(app);
        setShowModal(true);
    };

    const handleApprove = async (id) => {
        if (window.confirm("Xác nhận duyệt đơn này?")) {
            try {
                await axios.patch(`${import.meta.env.VITE_API_URL}/api/resident-verifications/${id}/approve`);
                fetchApplications();
                toast.success("Đã duyệt đơn thành công!");
            } catch (err) {
                const msg = err?.response?.data?.error || "Duyệt đơn thất bại!";
                toast.error(msg);
            }
        }
    };

    const handleReject = async (id) => {
        if (window.confirm("Xác nhận từ chối đơn này?")) {
            try {
                await axios.patch(`${import.meta.env.VITE_API_URL}/api/resident-verifications/${id}/reject`);
                fetchApplications();
                toast.success("Đã từ chối đơn!");
            } catch (err) {
                const msg = err?.response?.data?.error || "Từ chối đơn thất bại!";
                toast.error(msg);
            }
        }
    };

    // Filter logic
    const filteredApps = applications.filter(app =>
        (searchTerm.trim() === "" ||
            (app.fullName && app.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (app.apartmentCode && app.apartmentCode.toLowerCase().includes(searchTerm.toLowerCase()))
        ) &&
        (filterStatus === "" || String(app.status) === filterStatus)
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredApps.length / PAGE_SIZE) || 1;
    const pagedApps = filteredApps.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1); // Reset page khi filter/search thay đổi
    }, [searchTerm, filterStatus]);

    return (
        <AdminDashboard>
            <div className="w-100">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                    <h2 className="fw-bold mb-0">Quản lý đơn xác nhận cư dân</h2>
                    <div className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm theo tên hoặc căn hộ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: 220 }}
                        />
                        <select
                            className="form-control"
                            style={{ maxWidth: 180 }}
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="Chờ duyệt">Chờ duyệt</option>
                            <option value="Đã duyệt">Đã duyệt</option>
                            <option value="Đã từ chối">Đã từ chối</option>
                        </select>
                    </div>
                </div>
                <div className="card w-100">
                    <div className="card-body p-0">
                        <table className="table table-hover mb-0" style={{ width: "100%" }}>
                            <thead className="thead-light">
                                <tr>
                                    <th>STT</th>
                                    <th>Họ tên</th>
                                    <th>Email</th>
                                    <th>Điện thoại</th>
                                    <th>Căn hộ</th>
                                    <th>Loại giấy tờ</th>
                                    <th>Trạng thái</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted py-4">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : pagedApps.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted py-4">
                                            Không có đơn đăng ký nào.
                                        </td>
                                    </tr>
                                ) : (
                                    pagedApps.map((app, idx) => (
                                        <tr key={app._id}>
                                            <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                            <td>{app.fullName}</td>
                                            <td>{app.email}</td>
                                            <td>{app.phone}</td>
                                            <td>{app.apartmentCode}</td>
                                            <td>{app.documentType}</td>
                                            <td>
                                                <span className={
                                                    app.status === "Đã duyệt"
                                                        ? "badge bg-success"
                                                        : app.status === "Đã từ chối"
                                                            ? "badge bg-danger"
                                                            : "badge bg-warning text-dark"
                                                }>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2 flex-wrap">
                                                    <button
                                                        className="btn btn-sm btn-outline-info"
                                                        onClick={() => handleView(app)}
                                                    >
                                                        Xem
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleApprove(app._id)}
                                                        disabled={app.status === "Đã duyệt"}
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleReject(app._id)}
                                                        disabled={app.status === "Đã từ chối"}
                                                    >
                                                        Từ chối
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-center align-items-center mt-4">
                    <button
                        className="btn btn-outline-secondary me-2"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                    >
                        &lt; Prev
                    </button>
                    <span style={{ minWidth: 90, textAlign: "center" }}>
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        className="btn btn-outline-secondary ms-2"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Next &gt;
                    </button>
                </div>

                {/* Modal xem chi tiết đơn */}
                {showModal && selectedApp && (
                    <div
                        className="modal fade show"
                        style={{ display: "block", background: "rgba(0,0,0,0.3)" }}
                        tabIndex="-1"
                    >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Chi tiết đơn đăng ký</h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <span>×</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <p><b>Họ tên:</b> {selectedApp.fullName}</p>
                                    <p><b>Email:</b> {selectedApp.email}</p>
                                    <p><b>Điện thoại:</b> {selectedApp.phone}</p>
                                    <p><b>Căn hộ:</b> {selectedApp.apartmentCode}</p>
                                    <p><b>Loại giấy tờ:</b> {selectedApp.documentType}</p>
                                    <p><b>Thời hạn hợp đồng:</b> {selectedApp.contractStart ? new Date(selectedApp.contractStart).toLocaleDateString() : ""} - {selectedApp.contractEnd ? new Date(selectedApp.contractEnd).toLocaleDateString() : ""}</p>
                                    <p><b>Trạng thái:</b> {selectedApp.status}</p>
                                    {selectedApp.documentImage && (
                                        <div className="mb-2">
                                            <b>Ảnh tài liệu:</b><br />
                                            <img
                                                src={selectedApp.documentImage}
                                                alt="Ảnh minh chứng"
                                                style={{ maxWidth: "100%", maxHeight: 250, marginTop: 8, borderRadius: 8 }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </AdminDashboard>
    );
};

export default ManageApplicationForm;