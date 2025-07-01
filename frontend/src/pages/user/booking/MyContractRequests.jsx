import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import "./myContracts.css"; // Dùng lại CSS cũ

const MyContractRequests = () => {
  const { user, loading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [rejectPopup, setRejectPopup] = useState({ show: false, contractId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // ✅ trạng thái lọc
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/contracts/landlord", {
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
      await axios.put(`http://localhost:4000/api/contracts/${id}/approve`, {}, {
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
      await axios.put(`http://localhost:4000/api/contracts/${rejectPopup.contractId}/reject`, {
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
      await axios.delete(`http://localhost:4000/api/contracts/${id}`, {
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
    <div className="contracts-container">
      <Header
        user={user}
        name={user?.name}
        logout={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      />
      <h2 className="contracts-title">📥 Yêu Cầu Hợp Đồng Của Tôi</h2>

      <div className="filter-container">
        <label>Lọc trạng thái:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Đã từ chối</option>
          <option value="expired">Đã hết hạn</option>
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <p>📭 Không có hợp đồng phù hợp.</p>
      ) : (
        <div className="contract-list">
          {filteredRequests.map((contract, index) => (
            <div className="contract-card" key={contract._id}>
              <div className="contract-left">
                <div className="contract-index">{index + 1}</div>
                <div className="contract-info">
                  <h3>👤 Người thuê: {contract.fullNameB}</h3>
                  <p>📍 Địa chỉ: {contract.addressB}</p>
                  <p>📞 SĐT: {contract.phoneB}</p>
                  <p>📅 {contract.startDate?.slice(0, 10)} - {contract.endDate?.slice(0, 10)}</p>
                  <p>💰 Cọc: {contract.depositAmount?.toLocaleString("vi-VN")} VNĐ</p>
                  <p>
                    Trạng thái:{" "}
                    {contract.status === "approved" ? (
                      <span className="status-paid">Đã duyệt</span>
                    ) : contract.status === "rejected" ? (
                      <span className="status-unpaid">Đã từ chối</span>
                    ) : contract.status === "expired" ? (
                      <span className="status-expired">Đã hết hạn</span>
                    ) : (
                      <span className="status-pending">Chờ duyệt</span>
                    )}
                  </p>

                  {contract.rejectReason && (
                    <p className="reject-reason">📝 Lý do từ chối: {contract.rejectReason}</p>
                  )}
                </div>
              </div>
              <div className="contract-actions">
                <button
                  className="detail-btn"
                  onClick={() => navigate(`/contracts/${contract._id}`)}
                >
                  XEM CHI TIẾT
                </button>
                {contract.status === "pending" && (
                  <>
                    <button className="approve-btn" onClick={() => handleApprove(contract._id)}>DUYỆT</button>
                    <button className="reject-btn" onClick={() => handleRejectClick(contract._id)}>TỪ CHỐI</button>
                  </>
                )}
                <button className="delete-btn" onClick={() => handleDelete(contract._id)}>XÓA</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectPopup.show && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>📝 Nhập lý do từ chối</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối hợp đồng..."
              rows={4}
            />
            <div className="popup-actions">
              <button className="cancel-btn" onClick={() => setRejectPopup({ show: false, contractId: null })}>Hủy</button>
              <button className="submit-btn" onClick={handleConfirmReject}>Gửi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyContractRequests;
