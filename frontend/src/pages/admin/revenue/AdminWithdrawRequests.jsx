import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    approveWithdrawal,
    fetchAllWithdrawals,
    rejectWithdrawal,
} from "../../../service/withdrawService";
import AdminDashboard from "../adminDashboard";

const AdminWithdrawPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetchAllWithdrawals();
      const allData = res.data || [];
      setWithdrawals(
        filter ? allData.filter((r) => r.status === filter) : allData
      );
    } catch (err) {
      toast.error("Không thể nạp danh sách yêu cầu rút tiền!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, [filter]);

  const openRejectModal = (id) => {
    setSelectedId(id);
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectReason("");
    setSelectedId(null);
  };

  const handleApprove = async (id) => {
    try {
      await approveWithdrawal(id);
      toast.success("✅ Đã duyệt yêu cầu!");
      loadWithdrawals();
    } catch (err) {
      toast.error("❌ Duyệt thất bại: " + err.response?.data?.message);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối!");
      return;
    }
    try {
      await rejectWithdrawal(selectedId, rejectReason); // CHỈ TRUYỀN CHUỖI
      toast.success("❌ Đã từ chối yêu cầu!");
      closeRejectModal();
      loadWithdrawals();
    } catch (err) {
      toast.error("❌ Từ chối thất bại: " + err.response?.data?.message);
    }
  };

  return (
    <AdminDashboard active="withdrawals">
      <div className="container py-4">
        <div className="bg-primary text-white rounded-4 p-3 mb-4 text-center">
          <h2 className="mb-0">Yêu cầu rút tiền</h2>
        </div>

        <div className="mb-3 d-flex align-items-center gap-2">
          <label className="fw-semibold">Lọc trạng thái:</label>
          <select
            className="form-select w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="">Tất cả</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center">Đang tải dữ liệu...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle">
              <thead className="table-light">
                <tr>
                  <th>Người yêu cầu</th>
                  <th>Chủ tài khoản</th>
                  <th>Số tài khoản</th>
                  <th>Ngân hàng</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      Không có yêu cầu phù hợp
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w._id}>
                      <td>
                        {w.user?.name || "Ẩn danh"}
                        <br />
                        <small>{w.user?.email}</small>
                      </td>
                      <td>{w.accountHolder}</td>
                      <td>{w.bankNumber}</td>
                      <td>{w.bankName}</td>
                      <td>{Number(w.amount).toLocaleString()} đ</td>
                      <td>
                        <span
                          className={`badge ${
                            w.status === "approved"
                              ? "bg-success"
                              : w.status === "rejected"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td>
                        {w.status === "rejected" ? (
                          <span className="text-danger">{w.rejectedReason || "--"}</span>
                        ) : w.status === "approved" ? (
                          <span className="text-success">
                            Duyệt lúc {new Date(w.approvedAt).toLocaleString()}
                          </span>
                        ) : (
                          "--"
                        )}
                      </td>
                      <td>
                        {w.status === "pending" ? (
                          <>
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() => handleApprove(w._id)}
                            >
                              ✅ Duyệt
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => openRejectModal(w._id)}
                            >
                              ❌ Từ chối
                            </button>
                          </>
                        ) : (
                          <span className="text-muted">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal từ chối */}
        {rejectModalOpen && (
          <div
            className="modal fade show"
            style={{
              display: "block",
              background: "rgba(0,0,0,0.5)",
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1050,
            }}
            onClick={closeRejectModal}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Lý do từ chối</h5>
                  <button className="btn-close" onClick={closeRejectModal}></button>
                </div>
                <div className="modal-body">
                  <textarea
                    className="form-control mb-3"
                    placeholder="Nhập lý do từ chối..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  ></textarea>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeRejectModal}>
                    Hủy
                  </button>
                  <button className="btn btn-danger" onClick={handleRejectConfirm}>
                    Gửi từ chối
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboard>
  );
};

export default AdminWithdrawPage;
