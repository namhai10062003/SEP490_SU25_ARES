import { faEye, faEyeSlash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminDashboard from "./adminDashboard.jsx";


const PAGE_SIZE = 10;

const ManageUsers = () => {
    const [userList, setUserList] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);


    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState("");


    useEffect(() => {
        fetchUsers();
    }, [page, filterStatus]);

    const fetchUsers = async () => {
        try {
            let url = `${import.meta.env.VITE_API_URL}/api/users?page=${page}&limit=${PAGE_SIZE}&role=customer`;
            if (filterStatus) url += `&status=${filterStatus}`;
            const res = await fetch(url);
            const data = await res.json();
            setUserList(data.users || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            toast.error("Không thể tải danh sách user!");
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user._id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: user.status ? 0 : 1 }),
            });
            if (res.ok) {
                toast.success("Đã đổi trạng thái!");
                fetchUsers();
            } else {
                toast.error("Đổi trạng thái thất bại!");
            }
        } catch {
            toast.error("Lỗi server!");
        }
    };
    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userToDelete._id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Đã xóa user!");
                setShowDeleteModal(false);
                setUserToDelete(null);
                fetchUsers();
            } else {
                toast.error("Xóa user thất bại!");
            }
        } catch {
            toast.error("Lỗi server!");
        }
    };
    return (
        <AdminDashboard>
            <div className="w-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="font-weight-bold">Quản lý User</h2>
                </div>
                <div className="mb-3 d-flex">
                    <select className="form-control" style={{ maxWidth: 220 }} value={filterStatus} onChange={e => { setPage(1); setFilterStatus(e.target.value); }}>
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
                                    <th>Tên</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Trạng thái</th>
                                    <th>Xác thực</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userList.map((user, idx) => (
                                    <tr key={user._id}>
                                        <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || "-"}</td>
                                        <td>
                                            <span className={`badge ${user.status ? "badge-success" : "badge-secondary"}`}>
                                                {user.status ? "Active" : "Blocked"}
                                            </span>
                                        </td>
                                        <td>
                                            {user.verified ? (
                                                <span className="badge badge-success">Đã xác thực</span>
                                            ) : (
                                                <span className="badge badge-warning">Chưa xác thực</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <button
                                                    className={`btn btn-sm ${user.status ? "btn-outline-danger" : "btn-outline-success"}`}
                                                    style={{ whiteSpace: "nowrap", minWidth: 70, marginRight: 8 }}
                                                    onClick={() => handleToggleStatus(user)}
                                                >
                                                    {user.status ? "Block" : "Active"}
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    style={{ whiteSpace: "nowrap", minWidth: 70 }}
                                                    onClick={() => { setUserToDelete(user); setShowDeleteModal(true); }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {userList.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            Không có user nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Pagination */}
                <div className="d-flex justify-content-center align-items-center mt-3">
                    <button
                        className="btn btn-outline-secondary mr-2"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                    >
                        &lt; Prev
                    </button>
                    <span style={{ minWidth: 90, textAlign: "center" }}>Trang {page} / {totalPages}</span>
                    <button
                        className="btn btn-outline-secondary ml-2"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Next &gt;
                    </button>
                </div>
                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.3)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Xác nhận xóa user</h5>
                                    <button type="button" className="close" onClick={() => setShowDeleteModal(false)}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <p>Bạn có chắc chắn muốn xóa user <strong>{userToDelete?.name}</strong>?</p>
                                </div>
                                <div
                                    className="modal-footer"
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "flex-end",
                                        gap: 8,
                                        flexWrap: "nowrap", // Prevent wrapping
                                    }}
                                >
                                    <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Hủy</button>
                                    <button className="btn btn-danger" onClick={handleDeleteUser}>Xóa</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminDashboard>
    );
};


export default ManageUsers;