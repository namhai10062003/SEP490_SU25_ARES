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
        <div className="layout">
            <ToastContainer position="top-right" autoClose={2000} />
            <StaffNavbar />

            <main className="dashboard-container">
                <h2 style={{ marginBottom: 24 }}>Quản lý chi phí căn hộ</h2>
                <form onSubmit={handleAdd} style={{ margin: "0 auto 32px auto", maxWidth: 500, display: "flex", gap: 8, alignItems: "center" }}>
                    <select
                        value={addType}
                        onChange={e => setAddType(e.target.value)}
                        style={{ width: 160 }}
                        required
                    >
                        <option value="">Chọn loại chi phí</option>
                        <option value="1">Chi phí bảo trì</option>
                        <option value="2">Giá gửi xe</option>
                        <option value="3">Phí dịch vụ khác</option>
                        <option value="4">Phí tiện ích</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Tên Tòa nhà"
                        value={addLabel}
                        onChange={e => setAddLabel(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        step="1"
                        placeholder="Giá (VND/m²)"
                        value={addPrice}
                        min={0}
                        onChange={e => setAddPrice(e.target.value)}
                        required
                    />
                    <button className="btn btn-success btn-sm" type="submit">Thêm mới</button>
                </form>

                {loading ? (
                    <div>Đang tải dữ liệu...</div>
                ) : expenses.length === 0 ? (
                    <div>Không có dữ liệu chi phí.</div>
                ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
                        {Object.entries(grouped).map(([label, items]) => (
                            <div key={label} style={{
                                background: "#fff",
                                borderRadius: 10,
                                boxShadow: "0 2px 8px #eee",
                                padding: 24,
                                minWidth: 320,
                                maxWidth: 420,
                                marginBottom: 32
                            }}>
                                <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 16, color: "#1976d2" }}>{label}</div>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ background: "#f5f5f5" }}>
                                            <th style={{ textAlign: "left", padding: 8 }}>Loại phí</th>
                                            <th style={{ textAlign: "right", padding: 8 }}>Giá</th>
                                            <th style={{ padding: 8 }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(exp => (
                                            <tr key={exp._id} style={{ borderBottom: "1px solid #eee" }}>
                                                <td style={{ padding: 8, color: "#444" }}>{TYPE_LABELS[exp.type] || `Loại ${exp.type}`}</td>
                                                <td style={{ padding: 8, textAlign: "right", fontWeight: "bold", color: "#1976d2" }}>
                                                    {exp.price?.toLocaleString()} {exp.type === 1 ? "VND/m²" : "VND/tháng"}
                                                </td>
                                                <td style={{ padding: 8 }}>
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
                <p className="mt-3" style={{ marginTop: 32 }}>
                    <b>Ghi chú:</b> Giá quản lý căn hộ sẽ được tính tự động theo diện tích và loại tòa nhà.
                </p>
            </main>
        </div>
    );
};

export default Expenses;