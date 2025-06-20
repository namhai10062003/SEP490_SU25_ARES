import React, { useEffect, useState } from "react";
import axios from "axios";
import StaffDashboard from "./staffDashboard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
        }
        setLoading(false);
    };

    const handleEdit = (type, price) => {
        setEditing(type);
        setNewPrice(price);
    };

    const handleSave = async (type) => {
        await axios.put(`${API_URL}/api/expenses/${type}`, { price: Number(newPrice) });
        setEditing(null);
        setNewPrice("");
        fetchExpenses();
    };

    const handleDelete = async (type) => {
        if (window.confirm("Bạn có chắc muốn xóa loại chi phí này?")) {
            await axios.delete(`${API_URL}/api/expenses/${type}`);
            fetchExpenses();
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!addType || !addLabel || !addPrice) return;
        await axios.post(`${API_URL}/api/expenses`, {
            type: Number(addType),
            label: addLabel,
            price: Number(addPrice)
        });
        setAddType("");
        setAddLabel("");
        setAddPrice("");
        fetchExpenses();
    };

    return (
        <StaffDashboard>
            <h2 style={{ marginBottom: 24 }}>Quản lý chi phí căn hộ</h2>
            {/* Add new expense form */}
            <form onSubmit={handleAdd} style={{ margin: "0 auto 32px auto", maxWidth: 500, display: "flex", gap: 8, alignItems: "center" }}>
                <input
                    type="number"
                    step="1"
                    placeholder="Loại"
                    value={addType}
                    min={1}
                    onChange={e => setAddType(e.target.value)}
                    style={{ width: 80 }}
                    required
                />
                <input
                    type="text"
                    placeholder="Label"
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
                    {expenses.map((exp) => (
                        <div
                            key={exp.type}
                            style={{
                                background: "#fff",
                                borderRadius: 10,
                                boxShadow: "0 2px 8px #eee",
                                padding: 24,
                                minWidth: 260,
                                maxWidth: 320,
                                flex: "1 1 260px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                position: "relative"
                            }}
                        >
                            <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>
                                {exp.label} (Loại {exp.type})
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                Giá quản lý:{" "}
                                {editing === exp.type ? (
                                    <input
                                        type="number"
                                        step="1"
                                        value={newPrice}
                                        min={0}
                                        onChange={e => setNewPrice(e.target.value)}
                                        style={{ width: 100 }}
                                        autoFocus
                                    />
                                ) : (
                                    <span style={{ fontWeight: "bold", color: "#1976d2" }}>
                                        {exp.price?.toLocaleString()} VND/m²
                                    </span>
                                )}
                            </div>
                            <div>
                                {editing === exp.type ? (
                                    <>
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleSave(exp.type)}
                                            disabled={Number(newPrice) === exp.price}
                                        >Lưu</button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setEditing(null)}
                                            style={{ marginLeft: 8 }}
                                        >Hủy</button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleEdit(exp.type, exp.price)}
                                        >Sửa</button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(exp.type)}
                                            style={{ marginLeft: 8 }}
                                        >Xóa</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <p className="mt-3" style={{ marginTop: 32 }}>
                <b>Ghi chú:</b> Giá quản lý căn hộ sẽ được tính tự động theo diện tích và loại tòa nhà.
            </p>
        </StaffDashboard>
    );
};

export default Expenses;