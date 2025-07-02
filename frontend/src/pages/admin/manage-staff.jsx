import { faEye, faEyeSlash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminDashboard from "./adminDashboard.jsx";

const ManageStaff = () => {
    const [staffList, setStaffList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [form, setForm] = useState({ username: "", password: "", email: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/staff`);
            const data = await res.json();
            setStaffList(data);
            setPage(1); // Reset page về 1 khi load lại
        } catch (err) {
            toast.error("Không thể tải danh sách staff!");
        }
    };

    const openAdd = () => {
        setIsUpdate(false);
        setForm({ username: "", password: "", email: "" });
        setSelectedStaff(null);
        setShowModal(true);
        setShowPassword(false);
    };

    const openUpdate = (staff) => {
        setIsUpdate(true);
        setForm({ username: staff.name, password: staff.password, email: staff.email });
        setSelectedStaff(staff);
        setShowModal(true);
        setShowPassword(false);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isUpdate && selectedStaff) {
                // Update staff
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/${selectedStaff._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: form.username,
                        password: form.password,
                        email: form.email,
                    }),
                });
                if (res.ok) {
                    toast.success("Cập nhật thành công!");
                    fetchStaff();
                } else {
                    const data = await res.json();
                    toast.error(data.error || "Cập nhật thất bại!");
                }
            } else {
                // Add staff
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/staff`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: form.username,
                        password: form.password,
                        email: form.email,
                        verified: true
                    }),
                });
                if (res.ok) {
                    toast.success("Tạo staff thành công!");
                    fetchStaff();
                } else {
                    const data = await res.json();
                    toast.error(data.error || "Tạo staff thất bại!");
                }
            }
            setShowModal(false);
        } catch (err) {
            toast.error("Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (staff) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/${staff._id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: staff.status ? 0 : 1 }),
            });
            if (res.ok) {
                toast.success("Đã đổi trạng thái!");
                fetchStaff();
            } else {
                toast.error("Đổi trạng thái thất bại!");
            }
        } catch {
            toast.error("Lỗi server!");
        }
    };

    // Filter and pagination logic
    const [filterStatus, setFilterStatus] = useState("");

    const filteredStaff = filterStatus === ""
        ? staffList
        : staffList.filter(staff => String(staff.status) === filterStatus);

    const pagedStaff = filteredStaff.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = Math.ceil(filteredStaff.length / PAGE_SIZE) || 1;

    return (
        <AdminDashboard>
            <div className="w-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-0">Quản lý Staff</h2>
                    <button
                        className="btn btn-primary fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                        onClick={openAdd}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Staff
                    </button>

                </div>
                <div className="mb-3 d-flex">
                    <select
                        className="form-control"
                        style={{ maxWidth: 220 }}
                        value={filterStatus}
                        onChange={e => { setPage(1); setFilterStatus(e.target.value); }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="1">Active</option>
                        <option value="0">Blocked</option>
                    </select>
                </div>
                <div className="card w-100">
                    <div className="card-body p-0">
                        <table className="table table-hover mb-0">
                            <thead className="thead-light">
                                <tr>
                                    <th>STT</th>
                                    <th>Tên Tài khoản</th>
                                    <th>Email</th>
                                    {/* <th>Mật khẩu</th> */}
                                    <th>Trạng thái</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedStaff.map((staff, idx) => (
                                    <tr key={staff._id}>
                                        <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                        <td>{staff.name}</td>
                                        <td>{staff.email}</td>
                                        {/* <td>
                                            <span style={{ userSelect: "none" }}>
                                                {showPassword && selectedStaff?._id === staff._id
                                                    ? staff.password
                                                    : "●●●●●●"}
                                            </span>
                                            <button
                                                className="btn btn-link btn-sm ml-2"
                                                onClick={() => {
                                                    setShowPassword(
                                                        showPassword && selectedStaff?._id === staff._id
                                                            ? false
                                                            : true
                                                    );
                                                    setSelectedStaff(staff);
                                                }}
                                                tabIndex={-1}
                                                type="button"
                                            >
                                                <FontAwesomeIcon icon={showPassword && selectedStaff?._id === staff._id ? faEyeSlash : faEye} />
                                            </button>
                                        </td> */}
                                        <td>
                                            <span className={`badge ${staff.status ? "bg-success" : "bg-secondary"}`}>
                                                {staff.status ? "Active" : "Blocked"}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                style={{ whiteSpace: "nowrap", minWidth: 70 }}
                                                onClick={() => openUpdate(staff)}
                                            >
                                                Cập nhật
                                            </button>
                                            <button
                                                className={`btn btn-sm ${staff.status ? "btn-outline-danger" : "btn-outline-success"}`}
                                                style={{ whiteSpace: "nowrap", minWidth: 70 }}
                                                onClick={() => handleToggleStatus(staff)}
                                            >
                                                {staff.status ? "Block" : "Active"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {staffList.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-4">
                                            Không có staff nào.
                                        </td>
                                    </tr>
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

                {/* Modal */}
                {showModal && (
                    <div
                        className="modal fade show"
                        style={{ display: "block", background: "rgba(0,0,0,0.3)" }}
                        tabIndex="-1"
                    >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            {isUpdate ? "Cập nhật tài khoản" : "Thêm tài khoản"}
                                        </h5>
                                        <button
                                            type="button"
                                            className="close"
                                            onClick={() => setShowModal(false)}
                                        >
                                            <span>&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label>Tên tài khoản</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="username"
                                                value={form.username}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Mật khẩu</label>
                                            <div className="input-group">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="form-control"
                                                    name="password"
                                                    value={form.password}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    tabIndex={-1}
                                                >
                                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading ? "Đang xử lý..." : isUpdate ? "Cập nhật" : "Tạo"}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowModal(false)}
                                            disabled={loading}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminDashboard>
    );
};

export default ManageStaff;