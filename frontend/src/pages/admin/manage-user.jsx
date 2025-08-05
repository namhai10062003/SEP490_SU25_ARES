import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingModal from "../../../components/loadingModal.jsx";
import AdminDashboard from "./adminDashboard.jsx";
import ReusableModal from "../../../components/ReusableModal.jsx";
import Pagination from "../../../components/Pagination.jsx";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const ManageUsers = () => {
    const navigate = useNavigate();

    const [userList, setUserList] = useState([]);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [userToBlock, setUserToBlock] = useState(null);
    const [confirmBlockReason, setConfirmBlockReason] = useState("");
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState("");
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [pageSize, setPageSize] = useState(10);

    const getAxios = () => {
        const token = localStorage.getItem("token");
        return axios.create({
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    };

    const fetchUsers = useCallback(async () => {
        try {
            setLoadingFetch(true);
            const params = { page, limit: pageSize, role: "customer" };
            if (filterStatus !== "") params.status = filterStatus;
            const res = await getAxios().get(`${API_BASE}/users`, { params });
            const data = res.data || {};
            setUserList(Array.isArray(data.users) ? data.users : []);
            setTotalPages(data.totalPages ?? Math.max(1, Math.ceil((data.total || 0) / pageSize)));
        } catch (err) {
            console.error("fetchUsers error:", err);
            toast.error("Không thể tải danh sách user!");
        } finally {
            setLoadingFetch(false);
        }
    }, [page, pageSize, filterStatus]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        setPage(1);
    }, [filterStatus, pageSize]);

    // Block / unblock account (full lock: cannot login)
    const handleToggleBlockAccount = async (user, reason = "") => {
        if (!user) return;
        setLoadingAction(true);
        try {
            const isLocked = user.status === 2;
            const endpoint = isLocked
                ? `${API_BASE}/users/unblockAccount/${user._id}`
                : `${API_BASE}/users/blockAccount/${user._id}`;

            // server expects PATCH (no body needed, but you can send reason if you want)
            await getAxios().patch(endpoint, isLocked ? null : { reason });

            toast.success(isLocked ? "Đã mở khoá tài khoản" : "Đã khoá hoàn toàn tài khoản");
            setShowBlockModal(false);
            setUserToBlock(null);
            setConfirmBlockReason("");
            fetchUsers();
        } catch (err) {
            console.error("handleToggleBlockAccount error:", err);
            const msg = err?.response?.data?.message || "Đổi trạng thái thất bại!";
            toast.error(msg);
        } finally {
            setLoadingAction(false);
        }
    };

    // Client-side search filtering
    const filteredUsers = userList.filter((u) => {
        if (!searchText) return true;
        const lower = searchText.toLowerCase();
        return (
            (u.name && u.name.toLowerCase().includes(lower)) ||
            (u.email && u.email.toLowerCase().includes(lower)) ||
            (u.phone && u.phone.toLowerCase().includes(lower))
        );
    });

    return (
        <AdminDashboard>
            <div className="w-100 position-relative">
                {(loadingFetch || loadingAction) && <LoadingModal />}

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
                                setFilterStatus(e.target.value);
                            }}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="1">Active</option>
                            <option value="0">Blocked (chặn đăng bài)</option>
                            <option value="2">Locked (khóa hoàn toàn)</option>
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
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            Không có user nào.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, idx) => (
                                        <tr key={user._id}>
                                            <td>{(page - 1) * pageSize + idx + 1}</td>

                                            {/* NAME -> link to detail */}
                                            <td>
                                                <Link to={`/admin-dashboard/manage-user/${user._id}`} className="text-primary">
                                                    {user.name}
                                                </Link>
                                            </td>

                                            <td>{user.email}</td>
                                            <td>{user.phone || "-"}</td>
                                            <td>
                                                <span
                                                    className={`badge ${user.status === 1 ? "bg-success" : user.status === 0 ? "bg-warning text-dark" : "bg-danger"
                                                        }`}
                                                >
                                                    {user.status === 1 ? "Active" : user.status === 0 ? "Blocked" : "Locked"}
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
                                                    {/* Block account (cannot login) */}
                                                    <button
                                                        className={`btn btn-sm ${user.status === 2 ? "btn-outline-success" : "btn-outline-danger"
                                                            }`}
                                                        style={{ whiteSpace: "nowrap", minWidth: 90, marginRight: 8 }}
                                                        onClick={() => {
                                                            setUserToBlock(user);
                                                            setConfirmBlockReason("");
                                                            setShowBlockModal(true);
                                                        }}
                                                    >
                                                        {user.status === 2 ? "Unblock" : "Block account"}
                                                    </button>

                                                    {/* View details */}
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        style={{ whiteSpace: "nowrap", minWidth: 80 }}
                                                        onClick={() => navigate(`/admin-dashboard/manage-user/${user._id}`)}
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(p) => setPage(p)}
                    pageSize={pageSize}
                    onPageSizeChange={(s) => setPageSize(s)}
                />

                {/* Block account modal */}
                <ReusableModal
                    show={showBlockModal}
                    onClose={() => {
                        setShowBlockModal(false);
                        setUserToBlock(null);
                        setConfirmBlockReason("");
                    }}
                    title={userToBlock?.status === 2 ? "Mở khoá tài khoản" : "Khoá hoàn toàn tài khoản"}
                    body={
                        <div>
                            {userToBlock && (
                                <>
                                    <p>
                                        Bạn có chắc muốn <strong>{userToBlock.status === 2 ? "mở khoá" : "khoá hoàn toàn"}</strong> tài khoản{" "}
                                        <strong>{userToBlock.name}</strong>?
                                    </p>
                                    {/* allow reason when locking; optional */}
                                    {userToBlock.status !== 2 && (
                                        <>
                                            <label className="form-label">Lý do (tuỳ chọn)</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                value={confirmBlockReason}
                                                onChange={(e) => setConfirmBlockReason(e.target.value)}
                                            />
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    }
                    footerButtons={[
                        { label: "Huỷ", variant: "secondary", onClick: () => setShowBlockModal(false) },
                        {
                            label: userToBlock?.status === 2 ? "Mở khoá" : "Khoá",
                            variant: "danger",
                            onClick: () => handleToggleBlockAccount(userToBlock, confirmBlockReason),
                        },
                    ]}
                />
            </div>
        </AdminDashboard>
    );
};

export default ManageUsers;
