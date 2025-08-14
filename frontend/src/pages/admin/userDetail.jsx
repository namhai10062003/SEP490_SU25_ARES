// src/pages/admin/manage/ManageUserDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    formatDate, formatAddress, formatEmail, formatCMND,
    formatPhoneNumber, formatName, getStatusLabel
} from "../../../utils/format";
import { toast } from "react-toastify";
import AdminDashboard from "./adminDashboard";
import LoadingModal from "../../../components/loadingModal";
import ReusableModal from "../../../components/ReusableModal";
import {
    getUserById,
    deleteUserById,
    getUserDependencies,
    blockUserFromPosting,
    unblockUserFromPosting,
    blockUserAccount,
    unblockUserAccount
} from "../../service/userService";

export default function ManageUserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loadingPage, setLoadingPage] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // "blockPost" | "blockAccount"
    const [dependencies, setDependencies] = useState(null);
    const [blockReason, setBlockReason] = useState("");

    const fetchUser = async () => {
        try {
            setLoadingPage(true);
            const res = await getUserById(id);
            setUser(res.data);
        } catch (err) {
            console.error("fetchUser err:", err);
            toast.error("Không thể tải thông tin người dùng");
        } finally {
            setLoadingPage(false);
        }
    };

    // Gọi API để kiểm tra dependencies — luôn hiển thị modal sau khi có kết quả
    const checkDependenciesBeforeDelete = async () => {
        try {
            setLoadingAction(true);
            // gọi service đúng shape
            const res = await getUserDependencies(id);
            setDependencies(res.data.dependencies || null);
            setShowDeleteModal(true);
        } catch (err) {
            console.error("checkDependenciesBeforeDelete err:", err);
            toast.error("Không thể kiểm tra dữ liệu liên quan");
            // Mở modal nhưng không có dependencies (tùy bạn có muốn hay không)
            setDependencies(null);
            setShowDeleteModal(true);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDeleteUser = async () => {
        try {
            setLoadingAction(true);
            await deleteUserById(id);
            toast.success("Đã xoá người dùng");
            navigate(-1); // quay lại trang trước
        } catch (err) {
            console.error("handleDeleteUser err:", err);
            toast.error(err.response?.data?.message || "Không thể xoá người dùng");
        } finally {
            setLoadingAction(false);
            setShowDeleteModal(false);
            setDependencies(null);
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmAction || !user) return;
        setLoadingAction(true);

        try {
            if (confirmAction === "blockPost") {
                // nếu đang chặn (status === 0) => mở chặn (unblock); không cần reason
                if (user.status === 0) {
                    await unblockUserFromPosting(id);
                    toast.success("Đã mở chặn đăng bài");
                } else {
                    // block => gửi reason nếu có
                    await blockUserFromPosting(id, blockReason ? { reason: blockReason } : {});
                    toast.success("Đã chặn đăng bài");
                }
            } else if (confirmAction === "blockAccount") {
                if (user.status === 2) {
                    await unblockUserAccount(id);
                    toast.success("Đã mở khoá tài khoản");
                } else {
                    await blockUserAccount(id, blockReason ? { reason: blockReason } : {});
                    toast.success("Đã khoá hoàn toàn tài khoản");
                }
            }

            // reset và refresh user
            setBlockReason("");
            await fetchUser();
        } catch (err) {
            console.error("handleConfirmAction err:", err);
            toast.error(err?.response?.data?.message || "Không thể cập nhật trạng thái");
        } finally {
            setLoadingAction(false);
            setConfirmAction(null);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [id]);

    if (!user) return null;

    const { label, color } = getStatusLabel(
        user.status === 0 ? "blocked" : user.status === 2 ? "inactive" : "active"
    );

    return (
        <AdminDashboard title="Chi tiết người dùng">
            {(loadingPage || loadingAction) && <LoadingModal />}

            <div className="mb-3">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Quay lại</button>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white fw-bold">Thông tin người dùng</div>
                <div className="card-body row g-3">
                    <div className="col-md-4 text-center">
                        <img src={user.profileImage || user.picture} alt="Avatar"
                            className="rounded-circle" width={120} height={120} />
                        <p className="mt-2 fw-bold">{user.jobTitle || "—"}</p>
                    </div>

                    <div className="col-md-8 row g-3">
                        <div className="col-md-6"><strong>Họ tên:</strong> {formatName(user.name)}</div>
                        <div className="col-md-6"><strong>Email:</strong> {formatEmail(user.email)}</div>
                        <div className="col-md-6"><strong>SĐT:</strong> {formatPhoneNumber(user.phone)}</div>
                        <div className="col-md-6">
                            <strong>Giới tính:</strong>{" "}
                            <span className="badge bg-light text-dark border">
                                {user.gender === "male" ? "Nam ♂" :
                                    user.gender === "female" ? "Nữ ♀" : "Khác"}
                            </span>
                        </div>
                        <div className="col-md-6"><strong>Ngày sinh:</strong> {user.dob ? formatDate(user.dob) : "—"}</div>
                        <div className="col-md-6"><strong>Địa chỉ:</strong> {formatAddress(user.address) || "—"}</div>
                        <div className="col-md-6"><strong>CCCD:</strong> {formatCMND(user.identityNumber) || "—"}</div>
                        <div className="col-md-6">
                            <strong>Trạng thái:</strong>{" "}
                            <span className={`badge bg-${color}`}>{label}</span>
                        </div>
                        <div className="col-md-12"><strong>Tiểu sử:</strong><br />{user.bio || "—"}</div>
                    </div>

                    <div className="col-12 d-flex gap-2 mt-3 flex-wrap">
                        <button className="btn btn-warning" onClick={() => setConfirmAction("blockPost")}>
                            {user.status === 0 ? "🔓 Mở chặn đăng bài" : "🚫 Chặn đăng bài"}
                        </button>
                        <button className="btn btn-danger" onClick={() => setConfirmAction("blockAccount")}>
                            {user.status === 2 ? "🔓 Mở khoá đăng nhập" : "⛔ Khoá hoàn toàn tài khoản"}
                        </button>
                        <button className="btn btn-outline-danger" onClick={checkDependenciesBeforeDelete}>
                            🗑️ Xoá người dùng
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h5>Liên kết khác</h5>
                <ul>
                    <li>
                        <Link to={`/admin-dashboard/manage-apartment?search=${user.name}`} className="text-primary">
                            → Xem căn hộ người này sở hữu
                        </Link>
                    </li>
                    <li>
                        <Link to={`/admin-dashboard/manage-notification?email=${user.email}`} className="text-primary">
                            → Xem các hoạt động gần nhất
                        </Link>
                    </li>
                    <li>
                        <Link to={`/admin-dashboard/manage-contract?search=${user.email}`} className="text-primary">
                            → Xem các hợp đồng liên quan
                        </Link>
                    </li>
                </ul>
            </div>

            <ReusableModal
                show={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setDependencies(null); }}
                title="Xác nhận xoá người dùng"
                body={
                    dependencies && (dependencies.owns > 0 || dependencies.rents > 0 ||
                        dependencies.contractsAsTenant > 0 || dependencies.contractsAsLandlord > 0) ? (
                        <div>
                            <strong>Không thể xoá!</strong> Người dùng <strong>{user.name}</strong> đang:
                            <ul>
                                {dependencies.owns > 0 && <li>Sở hữu {dependencies.owns} căn hộ</li>}
                                {dependencies.rents > 0 && <li>Thuê {dependencies.rents} căn hộ</li>}
                                {(dependencies.contractsAsTenant + dependencies.contractsAsLandlord) > 0 &&
                                    <li>Có {dependencies.contractsAsTenant + dependencies.contractsAsLandlord} hợp đồng</li>}
                            </ul>
                            <p>Nếu bạn vẫn muốn xoá, hãy xử lý các liên kết trên trước (chuyển quyền/sửa hợp đồng...).</p>
                        </div>
                    ) : (
                        <div>
                            Bạn có chắc muốn xoá người dùng này? Hành động không thể hoàn tác.<br />
                            <strong>Họ tên:</strong> {user.name}<br />
                            <strong>Email:</strong> {user.email}
                        </div>
                    )
                }
                footerButtons={
                    dependencies && (dependencies.owns > 0 || dependencies.rents > 0 ||
                        dependencies.contractsAsTenant > 0 || dependencies.contractsAsLandlord > 0)
                        ? [{ label: "Đóng", variant: "secondary", onClick: () => { setShowDeleteModal(false); setDependencies(null); } }]
                        : [
                            { label: "Huỷ", variant: "secondary", onClick: () => { setShowDeleteModal(false); setDependencies(null); } },
                            { label: "Xoá", variant: "danger", onClick: handleDeleteUser }
                        ]
                }
            />

            <ReusableModal
                show={!!confirmAction}
                onClose={() => { setConfirmAction(null); setBlockReason(""); }}
                title={
                    confirmAction === "blockPost"
                        ? user.status === 0 ? "Mở chặn đăng bài" : "Chặn đăng bài"
                        : user.status === 2 ? "Mở khoá tài khoản" : "Khoá tài khoản"
                }
                body={
                    <div>
                        <p>
                            Bạn có chắc muốn{" "}
                            <strong>
                                {confirmAction === "blockPost"
                                    ? user.status === 0 ? "mở chặn" : "chặn"
                                    : user.status === 2 ? "mở khoá" : "khoá"}
                            </strong>{" "}
                            tài khoản <strong>{user.name}</strong> không?
                        </p>
                        <strong>Email:</strong> {user.email}
                        {!(
                            // chỉ hiển thị ô lý do khi là hành động chặn, không phải mở khoá
                            (confirmAction === "blockPost" && user.status === 0) ||
                            (confirmAction === "blockAccount" && user.status === 2)
                        ) && (
                                <div className="mt-3">
                                    <label className="form-label">Lý do (nên điền khi chặn):</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={blockReason}
                                        onChange={(e) => setBlockReason(e.target.value)}
                                        placeholder="Nhập lý do (ví dụ: vi phạm nội quy, spam, ...)"
                                    />
                                </div>
                            )}
                    </div>

                }
                footerButtons={[
                    { label: "Huỷ", variant: "secondary", onClick: () => { setConfirmAction(null); setBlockReason(""); } },
                    {
                        label:
                            confirmAction === "blockPost"
                                ? user.status === 0 ? "Mở chặn" : "Chặn"
                                : user.status === 2 ? "Mở khoá" : "Khoá",
                        variant: "danger",
                        onClick: handleConfirmAction,
                    },
                ]}
            />
        </AdminDashboard>
    );
}
