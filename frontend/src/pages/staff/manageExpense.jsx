import React, { useEffect, useState } from "react";
import axios from "axios";
import StaffNavbar from "./staffNavbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TYPE_LABELS = {
    1: "Chi phí bảo trì",
    2: "Giá gửi xe",
    3: "Phí dịch vụ khác",
    4: "Phí tiện ích"
};

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [editing, setEditing] = useState(null);
    const [newPrice, setNewPrice] = useState("");
    const [loading, setLoading] = useState(true);
    const [addType, setAddType] = useState("");
    const [addLabel, setAddLabel] = useState("");
    const [addPrice, setAddPrice] = useState("");

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/expenses`);
            setExpenses(res.data);
        } catch (err) {
            setExpenses([]);
            toast.error("Lỗi tải dữ liệu chi phí!");
        }
        setLoading(false);
    };

    const handleEdit = (type, price) => {
        setEditing(type);
        setNewPrice(price);
    };

    const handleSave = async (type) => {
        try {
            await axios.put(`${API_URL}/api/expenses/${type}`, { price: Number(newPrice) });
            toast.success("Cập nhật giá thành công!");
            setEditing(null);
            setNewPrice("");
            fetchExpenses();
        } catch (err) {
            toast.error("Cập nhật thất bại!");
        }
    };

    const handleDelete = async (type) => {
        if (window.confirm("Bạn có chắc muốn xóa loại chi phí này?")) {
            try {
                await axios.delete(`${API_URL}/api/expenses/${type}`);
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

    // Group expenses by label (building)
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

                {loading ? (
                    <div>Đang tải dữ liệu...</div>
                ) : expenses.length === 0 ? (
                    <div>Không có dữ liệu chi phí.</div>
                ) : (
                    <div className="row g-4">
                        {Object.entries(grouped).map(([label, items]) => (
                            <div key={label} className="col-12 col-md-6 col-lg-4">
                                <div
                                    className="bg-white rounded shadow-sm p-4 h-100"
                                    style={{ minWidth: 260 }}
                                >
                                    <div className="fw-bold fs-5 mb-3 text-primary">{label}</div>
                                    <table className="table table-sm mb-0">
                                        <thead>
                                            <tr className="table-light">
                                                <th>Loại phí</th>
                                                <th className="text-end">Giá</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(exp => (
                                                <tr key={exp._id}>
                                                    <td>{TYPE_LABELS[exp.type] || `Loại ${exp.type}`}</td>
                                                    <td className="text-end text-primary fw-bold">
                                                        {exp.price?.toLocaleString()} {exp.type === 1 ? "VND/m²" : "VND/tháng"}
                                                    </td>
                                                    <td>
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
                            </div>
                        ))}
                    </div>
                )}
                <p className="mt-4">
                    <b>Ghi chú:</b> Giá quản lý căn hộ sẽ được tính tự động theo diện tích và loại tòa nhà.
                </p>
            </main>
        </div>
    );
};

export default Expenses;