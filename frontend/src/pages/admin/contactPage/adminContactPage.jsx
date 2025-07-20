import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminDashboard from "../adminDashboard";

const AdminContactPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState(""); // lọc trạng thái

    const loadContacts = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contact/list?status=${filter}`);
          setContacts(res.data.data || []);
        } catch (err) {
          console.error("❌ Lỗi khi tải liên hệ:", err);
          toast.error("Không thể tải danh sách liên hệ!");
        } finally {
          setLoading(false);
        }
      };
      



    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xoá liên hệ này?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/contact/list/${id}`);
            toast.success("🗑️ Đã xoá liên hệ!");
            loadContacts();
        } catch (err) {
            console.error("❌ Xoá thất bại:", err);
            toast.error("❌ Xoá liên hệ thất bại!");
        }
    };

    const handleMarkReviewed = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/contact/list/${id}/status`, {
                status: "reviewed",
            });
            toast.success("✅ Đã đánh dấu đã xử lý!");
            loadContacts();
        } catch (err) {
            console.error("❌ Lỗi khi cập nhật trạng thái:", err);
            toast.error("❌ Cập nhật trạng thái thất bại!");
        }
    };


    useEffect(() => {
        loadContacts();
    }, [filter]);

    return (
        <AdminDashboard active="contact">
            <div className="container py-4">
                <div className="bg-primary text-white rounded-4 p-3 mb-4 text-center">
                    <h2 className="mb-0">Quản lý Liên hệ</h2>
                </div>

                {/* Lọc trạng thái (nếu có status) */}
                <div className="mb-3 d-flex align-items-center gap-2">
  <label className="fw-semibold">Lọc trạng thái:</label>
  <select
    className="form-select w-auto"
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
  >
    <option value="">Tất cả</option> {/* ✅ Tổng hợp tất cả */}
    <option value="pending">Chưa xử lý</option>
    <option value="reviewed">Đã xử lý</option>
    <option value="archived">Đã xóa</option>
  </select>
</div>


                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary mb-2"></div>
                        <div>Đang tải dữ liệu...</div>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Họ và tên</th>
                                    <th>Email</th>
                                    <th>Nội dung</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            Không có liên hệ nào
                                        </td>
                                    </tr>
                                ) : (
                                    contacts.map((c) => (
                                        <tr key={c._id}>
                                            <td>{c.name}</td>
                                            <td>{c.email}</td>
                                            <td>{c.message}</td>
                                            <td>
                                                <span
                                                    className={`badge ${c.isDeleted
                                                            ? "bg-secondary"
                                                            : c.status === "reviewed"
                                                                ? "bg-success"
                                                                : "bg-warning text-dark"
                                                        }`}
                                                >
                                                    {c.isDeleted
                                                        ? "Đã xoá"
                                                        : c.status === "reviewed"
                                                            ? "Đã xử lý"
                                                            : "Chưa xử lý"}
                                                </span>
                                            </td>

                                            <td>
                                                {c.isDeleted ? (
                                                    <span className="text-muted fst-italic">Đã xoá</span>
                                                ) : c.status === "reviewed" ? (
                                                    <span className="text-muted fst-italic">Đã xử lý</span>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-success me-2"
                                                            onClick={() => handleMarkReviewed(c._id)}
                                                        >
                                                            ✅ Đã xử lý
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDelete(c._id)}
                                                        >
                                                            🗑️ Xoá
                                                        </button>
                                                    </>
                                                )}
                                            </td>


                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminDashboard>
    );
};

export default AdminContactPage;
