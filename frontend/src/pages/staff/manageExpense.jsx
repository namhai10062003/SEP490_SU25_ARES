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
        <div className="d-flex min-vh-100 bg-light">
            <ToastContainer position="top-right" autoClose={2000} />
            <StaffNavbar />
            <main className="flex-grow-1 p-4">
                <h2 className="fw-bold mb-4">Quản lý chi phí căn hộ</h2>
                <form
                    onSubmit={handleAdd}
                    className="row g-2 align-items-center mb-4"
                    style={{ maxWidth: 600 }}
                >
                    <div className="col-md-3">
                        <select
                            className="form-select"
                            value={addType}
                            onChange={e => setAddType(e.target.value)}
                            required
                        >
                            <option value="">Chọn loại chi phí</option>
                            <option value="1">Chi phí bảo trì</option>
                            <option value="2">Giá gửi xe</option>
                            <option value="3">Phí dịch vụ khác</option>
                            <option value="4">Phí tiện ích</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tên Tòa nhà"
                            value={addLabel}
                            onChange={e => setAddLabel(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            type="number"
                            className="form-control"
                            step="1"
                            placeholder="Giá (VND/m²)"
                            value={addPrice}
                            min={0}
                            onChange={e => setAddPrice(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-success w-100" type="submit">
                            Thêm mới
                        </button>
                    </div>
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
