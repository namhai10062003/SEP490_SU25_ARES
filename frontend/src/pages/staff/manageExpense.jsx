import React, { useEffect, useState } from "react";
import axios from "axios";
import StaffNavbar from "./staffNavbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const TYPE_LABELS = {
    1: "Chi phí quản lý"
};

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addType, setAddType] = useState("");
    const [addLabel, setAddLabel] = useState("");
    const [addPrice, setAddPrice] = useState("");
    const [apartmentFees, setApartmentFees] = useState([]);
    const [loadingFees, setLoadingFees] = useState(true);


    useEffect(() => {
        fetchExpenses();
        fetchApartmentFees();
    }, []);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/expenses`);
            setExpenses(res.data);
        } catch (err) {
            toast.error("Lỗi tải dữ liệu chi phí!");
        }
        setLoading(false);
    };

    const fetchApartmentFees = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/fees/apartments`);
            setApartmentFees(res.data);
        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu chi phí căn hộ:", err);
        }
        setLoadingFees(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa loại chi phí này?")) {
            try {
                await axios.delete(`${API_URL}/api/expenses/${id}`);
                toast.success("Đã xóa chi phí!");
                fetchExpenses();
            } catch (err) {
                toast.error("Xóa thất bại!");
            }
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!addType || !addLabel || !addPrice) {
            toast.warn("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        try {
            await axios.post(`${API_URL}/api/expenses`, {
                type: Number(addType),
                label: addLabel,
                price: Number(addPrice)
            });
            toast.success("Thêm chi phí thành công!");
            setAddType("");
            setAddLabel("");
            setAddPrice("");
            fetchExpenses();
        } catch (err) {
            const msg = err?.response?.data?.error || "Thêm chi phí thất bại!";
            toast.error(msg);
        }
    };

    // Gom nhóm expenses theo label (tòa nhà)
    const grouped = expenses.reduce((acc, exp) => {
        if (!acc[exp.label]) acc[exp.label] = [];
        acc[exp.label].push(exp);
        return acc;
    }, {});

    return (
        <div className="bg-light min-vh-100 d-flex">
            <ToastContainer position="top-right" autoClose={2000} />

            {/* Sidebar */}
            <aside className="bg-primary text-white p-4" style={{ minWidth: 240 }}>
                <h2 className="fw-bold mb-4 text-warning text-center">BẢNG QUẢN LÝ</h2>
                <nav>
                    <ul className="nav flex-column gap-2">
                        <li className="nav-item"><Link to="/staff-dashboard" className="nav-link text-white">Dashboard</Link></li>
                        <li className="nav-item"><Link to="/posts" className="nav-link text-white">Quản lý bài post</Link></li>
                        <li className="nav-item"><Link to="/manage-parkinglot" className="nav-link text-white">Quản lý bãi đỗ xe</Link></li>
                        <li className="nav-item"><Link to="/expenses" className="nav-link active bg-white text-primary fw-bold">Quản lý chi phí</Link></li>
                        <li className="nav-item"><Link to="/residentVerification" className="nav-link text-white">Quản lý người dùng</Link></li>
                        <li className="nav-item"><Link to="/resident-verify" className="nav-link text-white">Quản lý nhân khẩu</Link></li>
                        <li className="nav-item"><Link to="/water-expense" className="nav-link text-white">Quản lý chi phí nước</Link></li>
                        <li className="nav-item"><Link to="/login" className="nav-link text-white">Đăng Xuất</Link></li>
                    </ul>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-grow-1 p-4">
                <div className="mb-4">
                    <h1 className="fw-bold text-dark" style={{ fontSize: "2.2rem" }}>Quản lý chi phí căn hộ</h1>
                </div>

                {/* Form thêm chi phí */}
                <form onSubmit={handleAdd} className="d-flex flex-wrap gap-2 align-items-center mb-4" style={{ maxWidth: 600 }}>
                    <select
                        value={addType}
                        onChange={(e) => setAddType(e.target.value)}
                        className="form-select form-select-sm"
                        style={{ width: 160 }}
                        required
                    >
                        <option value="">Chọn loại chi phí</option>
                        <option value="1">Chi phí quản lý</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Tên Tòa nhà"
                        className="form-control form-control-sm"
                        value={addLabel}
                        onChange={(e) => setAddLabel(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        min={0}
                        placeholder="Giá (VND/m²)"
                        className="form-control form-control-sm"
                        value={addPrice}
                        onChange={(e) => setAddPrice(e.target.value)}
                        required
                    />
                    <button className="btn btn-success btn-sm" type="submit">Thêm mới</button>
                </form>

                {/* Hiển thị danh sách chi phí */}
                {loading ? (
                    <div className="text-center text-secondary">Đang tải dữ liệu...</div>
                ) : expenses.length === 0 ? (
                    <div className="text-center text-secondary">Không có dữ liệu chi phí.</div>
                ) : (
                    <div className="d-flex flex-wrap gap-4 justify-content-center">
                        {Object.entries(grouped).map(([label, items]) => (
                            <div key={label} className="bg-white shadow-sm rounded p-4" style={{ minWidth: 320, maxWidth: 420 }}>
                                <h5 className="text-primary fw-bold mb-3">{label}</h5>
                                <table className="table table-bordered table-sm mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Loại phí</th>
                                            <th className="text-end">Giá</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((exp) => (
                                            <tr key={exp._id}>
                                                <td>{TYPE_LABELS[exp.type] || `Loại ${exp.type}`}</td>
                                                <td className="text-end text-primary fw-bold">
                                                    {exp.price.toLocaleString()} {exp.type === 1 ? "VND/m²" : "VND/tháng"}
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(exp._id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}

                <p className="mt-4">
                    <strong>Ghi chú:</strong> Giá quản lý căn hộ được tính tự động theo diện tích và tòa nhà.
                </p>
                <hr className="my-4" />

                <h4 className="fw-bold text-dark mb-3">Bảng chi phí tổng hợp từng căn hộ theo tháng</h4>

                <div className="table-responsive">
                    {loadingFees ? (
                        <div className="text-secondary">Đang tải dữ liệu chi phí...</div>
                    ) : apartmentFees.length === 0 ? (
                        <div className="text-secondary">Không có dữ liệu chi phí căn hộ.</div>
                    ) : (
                        <table className="table table-bordered table-striped table-hover">
                            <thead className="table-primary">
                                <tr>
                                    <th>Mã căn hộ</th>
                                    <th>Chủ hộ</th>
                                    <th>Tháng</th>
                                    <th>Phí quản lý</th>
                                    <th>Phí nước</th>
                                    <th>Phí gửi xe</th>
                                    <th className="text-end">Tổng cộng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apartmentFees.map((row, index) => {
                                    const createdAt = row.createdAt ? new Date(row.createdAt) : null;
                                    const displayedMonth = createdAt
                                        ? `${createdAt.getMonth() + 1}`.padStart(2, "0") + "/" + createdAt.getFullYear()
                                        : row.month || "---"; // fallback nếu không có createdAt

                                    return (
                                        <tr key={index}>
                                            <td>{row.apartmentCode}</td>
                                            <td>{row.ownerName}</td>
                                            <td>{displayedMonth}</td>
                                            <td>{row.managementFee?.toLocaleString()} đ</td>
                                            <td>{row.waterFee?.toLocaleString()} đ</td>
                                            <td>{row.parkingFee?.toLocaleString()} đ</td>
                                            <td className="text-end fw-bold text-primary">
                                                {row.total?.toLocaleString()} đ
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                    )}
                </div>
            </main>
        </div>
    );

};

export default Expenses;
