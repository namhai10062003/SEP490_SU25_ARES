
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSearchParams, Link, useNavigate } from "react-router-dom";

import LoadingModal from "../../../components/loadingModal.jsx";
import AdminDashboard from "./adminDashboard.jsx";
import ReusableModal from "../../../components/ReusableModal.jsx";
import Pagination from "../../../components/Pagination.jsx";
import SearchInput from "../../../components/admin/searchInput.jsx";
import StatusFilter from "../../../components/admin/statusFilter.jsx";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const ManageUsers = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // UI / data state
    const [userList, setUserList] = useState([]);
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // block modal state
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [userToBlock, setUserToBlock] = useState(null);
    const [confirmBlockReason, setConfirmBlockReason] = useState("");

    // local controlled input for SearchInput
    const [searchInput, setSearchInput] = useState(searchParams.get("email") || "");

    // derive values from URL (defaults)
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("pageSize")) || 10;
    const filterStatus = searchParams.get("status") || "";

    // axios with token
    const getAxios = () => {
        const token = localStorage.getItem("token");
        return axios.create({
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    };

    // helper to update query params (merge)
    const updateQuery = (next = {}) => {
        const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
        const keys = ["email", "status", "page", "limit"];
        keys.forEach((k) => {
            if (Object.prototype.hasOwnProperty.call(next, k)) {
                const v = next[k];
                if (v === "" || v === null || v === undefined) params.delete(k);
                else params.set(k, String(v));
            }
        });
        setSearchParams(params, { replace: true });
    };

    // fetch users from backend using URL-derived params
    const fetchUsers = useCallback(async () => {
        try {
            setLoadingFetch(true);
            const params = { page, limit, role: "customer" };
            if (filterStatus !== "") params.status = filterStatus;
            const emailParam = searchParams.get("email");
            if (emailParam) params.email = emailParam;

            const res = await getAxios().get(`${API_BASE}/users`, { params });
            const data = res.data || {};
            setUserList(Array.isArray(data.users) ? data.users : []);
            setTotalPages(data.totalPages ?? Math.max(1, Math.ceil((data.total || 0) / limit)));
            setTotalItems(data.total ?? 0);
        } catch (err) {
            console.error("fetchUsers error:", err);
            toast.error("Không thể tải danh sách user!");
            setUserList([]);
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setLoadingFetch(false);
        }
    }, [searchParams, page, limit, filterStatus]);

    // sync local input when URL changes and fetch data
    useEffect(() => {
        setSearchInput(searchParams.get("email") || "");
        fetchUsers();
    }, [searchParams, fetchUsers]);

    // Block / unblock account (full lock: cannot login)
    const handleToggleBlockAccount = async (user, reason = "") => {
        if (!user) return;
        setLoadingAction(true);
        try {
            const isLocked = user.status === 2;
            const endpoint = isLocked
                ? `${API_BASE}/users/unblockAccount/${user._id}`
                : `${API_BASE}/users/blockAccount/${user._id}`;

            await getAxios().patch(endpoint, isLocked ? null : { reason });

            toast.success(isLocked ? "Đã mở khoá tài khoản" : "Đã khoá hoàn toàn tài khoản");
            setShowBlockModal(false);
            setUserToBlock(null);
            setConfirmBlockReason("");
            // reload list with current params
            fetchUsers();
        } catch (err) {
            console.error("handleToggleBlockAccount error:", err);
            const msg = err?.response?.data?.message || "Đổi trạng thái thất bại!";
            toast.error(msg);
        } finally {
            setLoadingAction(false);
        }
    };

    // search handlers passed to SearchInput
    const triggerSearch = () => updateQuery({ email: (searchInput || "").trim(), page: 1 });
    const clearSearch = () => {
        setSearchInput("");
        updateQuery({ email: "", page: 1 });
    };

    return (
        <AdminDashboard>
            <div className="w-100 position-relative">
                {(loadingFetch || loadingAction) && <LoadingModal />}

                <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
                    <h2 className="font-weight-bold mb-0">Quản lý User</h2>

                    <div className="d-flex gap-3 align-items-center">
                        <SearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            onSearch={triggerSearch}
                            onClear={clearSearch}
                        />

                        <StatusFilter
                            value={filterStatus}
                            onChange={(val) => updateQuery({ status: val, page: 1 })}
                            type="user"
                        />
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
                                {userList.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            Không có user nào.
                                        </td>
                                    </tr>
                                ) : (
                                    userList.map((user, idx) => (
                                        <tr key={user._id}>
                                            <td>{(page - 1) * limit + idx + 1}</td>

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
                    onPageChange={(p) => updateQuery({ page: p })}
                    pageSize={limit}
                    onPageSizeChange={(s) => updateQuery({ limit: s, page: 1 })}
                />

                {/* Block account modal */}
                <ReusableModal
                    show={showBlockModal}
                    onClose={() => {
                        setShowBlockModal(false);
                        setUserToBlock(null);
                        setConfirmBlockReason("");
                    }}
                    size="md"
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
