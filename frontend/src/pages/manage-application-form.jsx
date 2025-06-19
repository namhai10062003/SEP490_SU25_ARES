import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboard from "./adminDashboard.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const ManageApplicationForm = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
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

    const filteredApps = applications.filter(app =>
        searchTerm.trim() === "" ||
        (app.fullName && app.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.apartmentCode && app.apartmentCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AdminDashboard>
            <div className="w-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="font-weight-bold">Quản lý đơn xác nhận cư dân</h2>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc căn hộ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: "0.5rem", width: "250px" }}
                    />
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
                                ) : filteredApps.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted py-4">
                                            Không có đơn đăng ký nào.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredApps.map((app, idx) => (
                                        <tr key={app._id}>
                                            <td>{idx + 1}</td>
                                            <td>{app.fullName}</td>
                                            <td>{app.email}</td>
                                            <td>{app.phone}</td>
                                            <td>{app.apartmentCode}</td>
                                            <td>{app.documentType}</td>
                                            <td>{app.status}</td>
                                            <td>
                                                <div style={{ display: "flex", gap: "0.5rem", whiteSpace: "nowrap" }}>
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
        </AdminDashboard>
    );
};

export default ManageApplicationForm;