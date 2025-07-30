
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingModal from "../../../components/LoadingModal.jsx";
import AdminDashboard from "./adminDashboard.jsx";
import ReusableModal from "../../../components/ReusableModal.jsx";
import Pagination from "../../../components/Pagination.jsx";

const ManageUsers = () => {
    const [userList, setUserList] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [userToBlock, setUserToBlock] = useState(null);
    const [blockReason, setBlockReason] = useState("");
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchUsers();
    }, [page, filterStatus, pageSize]);

    const fetchUsers = async () => {
        try {
            let url = `${import.meta.env.VITE_API_URL}/api/users?page=${page}&limit=${pageSize}&role=customer`;
            if (filterStatus) url += `&status=${filterStatus}`;
            const res = await fetch(url);
            const data = await res.json();
            setUserList(data.users || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            toast.error("Không thể tải danh sách user!");
        }
    };

    const handleToggleStatus = async (user, reason = "") => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            const endpoint =
                user.status === 1
                    ? `${import.meta.env.VITE_API_URL}/api/users/block/${user._id}`
                    : `${import.meta.env.VITE_API_URL}/api/users/unblock/${user._id}`;

            const res = await fetch(endpoint, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: user.status === 1 ? JSON.stringify({ reason }) : null,
            });

            if (res.ok) {
                toast.success("Đã đổi trạng thái!");
                fetchUsers();
                setShowBlockModal(false);
                setBlockReason("");
            } else {
                toast.error("Đổi trạng thái thất bại!");
            }
        } catch {
            toast.error("Lỗi server!");
        }
        setLoading(false);
    };


    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        setLoading(true);
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
        setLoading(false);
    };

    const filteredUsers = userList.filter((user) => {
        const lower = searchText.toLowerCase();

        const matchesSearch =
            user.name?.toLowerCase().includes(lower) ||
            user.email?.toLowerCase().includes(lower) ||
            user.phone?.toLowerCase().includes(lower);

        return searchText === "" || matchesSearch;
    });

    return (
        <AdminDashboard>
            <div className="w-100 postion-relative">
                {/* Loading Modal */}
                {loading && <LoadingModal />}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h2 className="font-weight-bold mb-0">Quản lý User</h2>
                    <div className="d-flex gap-3 flex-nowrap align-items-center">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm..."
                            style={{ maxWidth: 200 }}
                            value={searchText}
                            onChange={(e) => {
                                setPage(1);
                                setSearchText(e.target.value);
                            }}
                        />
                        <select
                            className="form-select w-auto"
                            style={{ maxWidth: 220 }}
                            value={filterStatus}
                            onChange={(e) => {
                                setPage(1);
                                setFilterStatus(e.target.value);
                            }}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="1">Active</option>
                            <option value="0">Blocked</option>
                        </select>
                    </div>
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
                                {filteredUsers.map((user, idx) => (
                                    <tr key={user._id}>
                                        <td>{(page - 1) * pageSize + idx + 1}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || "-"}</td>
                                        <td>
                                            <span className={`badge ${user.status ? "bg-success" : "bg-secondary"}`}>
                                                {user.status ? "Active" : "Blocked"}
                                            </span>
                                        </td>
                                        <td>
                                            {user.verified ? (
                                                <span className="badge bg-success">Đã xác thực</span>
                                            ) : (
                                                <span className="badge bg-warning text-dark">Chưa xác thực</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <button
                                                    className={`btn btn-sm ${user.status ? "btn-outline-danger" : "btn-outline-success"}`}
                                                    style={{ whiteSpace: "nowrap", minWidth: 70, marginRight: 8 }}
                                                    onClick={() => {
                                                        if (user.status === 1) {
                                                            setUserToBlock(user);
                                                            setShowBlockModal(true);
                                                        } else {
                                                            handleToggleStatus(user); // unblocking
                                                        }
                                                    }}
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
                                {filteredUsers.length === 0 && (
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
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                />
                {/* Block Modal */}
                <ReusableModal
                    show={showBlockModal}
                    onClose={() => setShowBlockModal(false)}
                    title="Chặn người dùng"
                    body={
                        <>
                            <p>Nhập lý do chặn <strong>{userToBlock?.name}</strong>:</p>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                placeholder="Nhập lý do..."
                            ></textarea>
                        </>
                    }
                    footerButtons={[
                        { label: "Hủy", variant: "secondary", onClick: () => setShowBlockModal(false) },
                        {
                            label: "Chặn",
                            variant: "danger",
                            onClick: () => handleToggleStatus(userToBlock, blockReason),
                            disabled: !blockReason.trim()
                        }
                    ]}
                />

                {/* Delete Modal */}
                <ReusableModal
                    show={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Xác nhận xóa user"
                    body={
                        <p>
                            Bạn có chắc chắn muốn xóa user <strong>{userToDelete?.name}</strong>?
                        </p>
                    }
                    footerButtons={[
                        { label: "Hủy", variant: "secondary", onClick: () => setShowDeleteModal(false) },
                        { label: "Xóa", variant: "danger", onClick: handleDeleteUser }
                    ]}
                />

            </div>
        </AdminDashboard>
    );
};


export default ManageUsers;