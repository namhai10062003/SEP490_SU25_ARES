import { faEye, faEyeSlash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminDashboard from "./adminDashboard.jsx";
import Pagination from "../../../components/Pagination.jsx";
import ReusableModal from "../../../components/ReusableModal.jsx";
const ManageStaff = () => {
    const [staffList, setStaffList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [form, setForm] = useState({ username: "", password: "", email: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    useEffect(() => {
        fetchStaff();
    }, [page, pageSize]);

    const fetchStaff = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/staff?page=${page}&limit=${pageSize}`);
            const result = await res.json();
            setStaffList(Array.isArray(result.data) ? result.data : []);
            setPage(1); // Reset page về 1 khi load lại
        } catch (err) {
            toast.error("Không thể tải danh sách staff!");
            setStaffList([]); // fallback tránh lỗi .filter
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

    const filteredStaff = staffList.filter(staff => {
        const matchesStatus =
            filterStatus === "" ? true : String(staff.status) === filterStatus;

        const lowerSearch = searchText.toLowerCase();

        const matchesSearch =
            staff.name?.toLowerCase().includes(lowerSearch) ||
            staff.email?.toLowerCase().includes(lowerSearch) ||
            staff.phone?.toLowerCase().includes(lowerSearch); // nếu staff có phone

        return matchesStatus && (searchText === "" || matchesSearch);
    });

    const pagedStaff = filteredStaff.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredStaff.length / pageSize) || 1;
    const renderModalBody = () => (
        <>
            <div className="form-group mb-3">
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
            <div className="form-group mb-3">
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
            <div className="form-group mb-0">
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
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                </div>
            </div>
        </>
    );

    const modalButtons = [
        {
            label: loading ? "Đang xử lý..." : isUpdate ? "Cập nhật" : "Tạo",
            onClick: handleSubmit,
            variant: "primary",
            disabled: loading,
        },
        {
            label: "Hủy",
            onClick: () => setShowModal(false),
            variant: "secondary",
            disabled: loading,
        },
    ];
    return (
        <AdminDashboard>
            <div className="w-100">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    {/* Bên trái */}
                    <h2 className="fw-bold mb-0">Quản lý Staff</h2>

                    {/* Bên phải: input, select, button */}
                    <div className="d-flex gap-3 flex-wrap">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm..."
                            style={{ maxWidth: 150 }}
                            value={searchText}
                            onChange={(e) => {
                                setPage(1);
                                setSearchText(e.target.value);
                            }}
                        />
                        <select
                            className="form-select"
                            style={{ maxWidth: 100 }}
                            value={filterStatus}
                            onChange={(e) => {
                                setPage(1);
                                setFilterStatus(e.target.value);
                            }}
                        >
                            <option value="">Tất cả</option>
                            <option value="1">Active</option>
                            <option value="0">Blocked</option>
                        </select>
                        <button
                            className="btn btn-primary fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                            onClick={openAdd}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Thêm Staff
                        </button>
                    </div>
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
                                        <td>{(page - 1) * pageSize + idx + 1}</td>
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
                                {pagedStaff.length === 0 && (
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
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                />

                {/* Modal */}
                {showModal && (
                    <ReusableModal
                        show={showModal}
                        title={isUpdate ? "Cập nhật tài khoản" : "Thêm tài khoản"}
                        body={renderModalBody()}
                        footerButtons={modalButtons}
                        onClose={() => setShowModal(false)}
                    />
                )}
            </div>
        </AdminDashboard>
    );
};

export default ManageStaff;