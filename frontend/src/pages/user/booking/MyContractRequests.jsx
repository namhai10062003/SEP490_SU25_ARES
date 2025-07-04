import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";

const MyContractRequests = () => {
  const { user, loading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [rejectPopup, setRejectPopup] = useState({ show: false, contractId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contracts/landlord`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data.data);
      } catch (err) {
        toast.error("❌ Lỗi khi tải yêu cầu hợp đồng");
      }
    };
    if (user) fetchRequests();
  }, [user]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/contracts/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("✅ Đã duyệt hợp đồng");
      setRequests(prev => prev.map(c => c._id === id ? { ...c, status: "approved" } : c));
    } catch {
      toast.error("❌ Lỗi khi duyệt");
    }
  };

  const handleRejectClick = (id) => {
    setRejectPopup({ show: true, contractId: id });
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      return toast.warn("⚠️ Vui lòng nhập lý do từ chối");
    }
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/contracts/${rejectPopup.contractId}/reject`, {
        reason: rejectReason,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("🚫 Đã từ chối hợp đồng");
      setRequests(prev => prev.map(c =>
        c._id === rejectPopup.contractId ? { ...c, status: "rejected", rejectReason } : c
      ));
      setRejectPopup({ show: false, contractId: null });
    } catch {
      toast.error("❌ Lỗi khi từ chối");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn muốn xóa hợp đồng này?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/contracts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("🗑️ Đã xóa");
      setRequests(prev => prev.filter(c => c._id !== id));
    } catch {
      toast.error("❌ Không thể xóa");
    }
  };

  const filteredRequests = requests.filter((c) =>
    filterStatus === "all" ? true : c.status === filterStatus
  );

  if (loading) return <p>🔄 Đang tải...</p>;

  return (
    <div className="bg-light min-vh-100">
      <Header
        user={user}
        name={user?.name}
        logout={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      />
      <div className="container py-4">
        <h2 className="fw-bold mb-4 text-primary">📥 Yêu Cầu Hợp Đồng Của Tôi</h2>

        <div className="mb-4 d-flex align-items-center gap-2">
          <label className="fw-semibold">Lọc trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select w-auto"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
            <option value="expired">Đã hết hạn</option>
          </select>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="alert alert-info">📭 Không có hợp đồng phù hợp.</div>
        ) : (
          <div className="row g-4">
            {filteredRequests.map((contract, index) => (
              <div className="col-12" key={contract._id}>
                <div className="card shadow-sm rounded-4 border-0">
                  <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div className="d-flex align-items-start gap-3 flex-grow-1">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, fontSize: 20 }}>
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">👤 Người thuê: {contract.fullNameB}</h5>
                        <div className="mb-1"><span className="fw-semibold">📍 Địa chỉ:</span> {contract.addressB}</div>
                        <div className="mb-1"><span className="fw-semibold">📞 SĐT:</span> {contract.phoneB}</div>
                        <div className="mb-1"><span className="fw-semibold">📅</span> {contract.startDate?.slice(0, 10)} - {contract.endDate?.slice(0, 10)}</div>
                        <div className="mb-1"><span className="fw-semibold">💰 Cọc:</span> {contract.depositAmount?.toLocaleString("vi-VN")} VNĐ</div>
                        <div>
                          <span className="fw-semibold">Trạng thái: </span>
                          {contract.status === "approved" ? (
                            <span className="badge bg-success">Đã duyệt</span>
                          ) : contract.status === "rejected" ? (
                            <span className="badge bg-danger">Đã từ chối</span>
                          ) : contract.status === "expired" ? (
                            <span className="badge bg-secondary">Đã hết hạn</span>
                          ) : (
                            <span className="badge bg-warning text-dark">Chờ duyệt</span>
                          )}
                        </div>
                        {contract.rejectReason && (
                          <div className="text-danger fst-italic mt-2">
                            📝 Lý do từ chối: {contract.rejectReason}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2 mt-3 mt-md-0">
                      <button
                        className="btn btn-info fw-bold"
                        onClick={() => navigate(`/contracts/${contract._id}`)}
                      >
                        XEM CHI TIẾT
                      </button>
                      {contract.status === "pending" && (
                        <>
                          <button className="btn btn-success fw-bold" onClick={() => handleApprove(contract._id)}>DUYỆT</button>
                          <button className="btn btn-danger fw-bold" onClick={() => handleRejectClick(contract._id)}>TỪ CHỐI</button>
                        </>
                      )}
                      <button className="btn btn-outline-danger fw-bold" onClick={() => handleDelete(contract._id)}>XÓA</button>
                    </div>
                  </div>
                </div>
                {/* Popup từ chối */}
                {rejectPopup.show && rejectPopup.contractId === contract._id && (
                  <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">📝 Nhập lý do từ chối</h5>
                          <button type="button" className="btn-close" onClick={() => setRejectPopup({ show: false, contractId: null })}></button>
                        </div>
                        <div className="modal-body">
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do từ chối hợp đồng..."
                            rows={4}
                            className="form-control"
                          />
                        </div>
                        <div className="modal-footer">
                          <button className="btn btn-secondary" onClick={() => setRejectPopup({ show: false, contractId: null })}>Hủy</button>
                          <button className="btn btn-danger" onClick={handleConfirmReject}>Gửi</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyContractRequests;