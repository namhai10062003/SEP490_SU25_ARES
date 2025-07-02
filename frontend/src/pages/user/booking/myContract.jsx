import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import "./myContracts.css";

const MyContracts = () => {
  const { user, loading } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editingContract, setEditingContract] = useState(null);
  const [editForm, setEditForm] = useState({
    startDate: "",
    endDate: "",
    contractTerms: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Xử lý khi thanh toán thành công
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");

    const handlePaymentReturn = async () => {
      if (status === "PAID") {
        toast.success("✅ Thanh toán thành công");

        // Đợi webhook xử lý xong
        setTimeout(async () => {
          try {
            await fetchContracts();
          } catch {
            toast.error("❌ Lỗi khi làm mới hợp đồng");
          }
          navigate("/my-contracts", { replace: true });
        }, 2000);
      }
    };

    handlePaymentReturn();
  }, [location.search, navigate]);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4000/api/contracts/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContracts(res.data.data);
    } catch {
      toast.error("❌ Lỗi khi tải hợp đồng");
    }
  };

  useEffect(() => {
    if (user) fetchContracts();
  }, [user]);

  const openEditPopup = (contract) => {
    setEditingContract(contract);
    setEditForm({
      startDate: contract.startDate?.slice(0, 10),
      endDate: contract.endDate?.slice(0, 10),
      contractTerms: contract.contractTerms || "",
    });
  };

  const handleResubmit = async () => {
    try {
      await axios.put(
        `http://localhost:4000/api/contracts/${editingContract._id}/resubmit`,
        editForm,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("📤 Đã gửi lại hợp đồng");
      setContracts((prev) =>
        prev.map((c) =>
          c._id === editingContract._id
            ? { ...c, ...editForm, status: "pending", rejectReason: "" }
            : c
        )
      );
      setEditingContract(null);
    } catch {
      toast.error("❌ Lỗi khi gửi lại hợp đồng");
    }
  };

  const handlePayment = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:4000/api/contracts/${id}/pay`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const paymentUrl = res.data.data.paymentUrl;
      if (paymentUrl) {
        toast.success("💳 Đang chuyển đến cổng thanh toán...");
        window.location.href = paymentUrl;
      } else {
        toast.error("❌ Không nhận được link thanh toán");
      }
    } catch (err) {
      toast.error("❌ Lỗi khi tạo thanh toán hợp đồng");
    }
  };

  if (loading) return <p>🔄 Đang tải...</p>;

  const myTenantContracts = contracts.filter(
    (c) => c.userId === user._id || c.userId === user._id?.toString()
  );

  const filteredContracts = myTenantContracts.filter((c) => {
    if (filter === "all") return true;
    if (filter === "paid") return c.paymentStatus === "paid";
    if (filter === "unpaid") return c.paymentStatus === "unpaid";
    if (filter === "failed") return c.paymentStatus === "failed";
    return true;
  });

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

      <h2 className="contracts-title">📄 Hợp đồng của tôi</h2>

      <div className="filter-container">
        <label>Lọc theo thanh toán:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả</option>
          <option value="paid">Đã thanh toán</option>
          <option value="unpaid">Chưa thanh toán</option>
          <option value="failed">Thanh toán thất bại</option>
        </select>
      </div>

      {filteredContracts.length === 0 ? (
        <p>📭 Không có hợp đồng phù hợp.</p>
      ) : (
        <div className="contract-list">
          {filteredContracts.map((contract, index) => (
            <div className="contract-card" key={contract._id}>
              <div className="contract-left">
                <div className="contract-index">{index + 1}</div>
                <div className="contract-info">
                  <h3>🏠 {contract.fullNameA}</h3>
                  <p>📍 Địa chỉ: {contract.addressA}</p>
                  <p>📅 Từ: {contract.startDate?.slice(0, 10)} - {contract.endDate?.slice(0, 10)}</p>
                  <p>💰 Đặt cọc: {contract.depositAmount?.toLocaleString("vi-VN")} VNĐ</p>
                  <p>📞 Liên hệ: {contract.phoneA}</p>
                  <p>
                    Trạng thái:{" "}
                    {contract.status === "pending" ? (
                      <span className="status-pending">⏳ Chờ duyệt</span>
                    ) : contract.status === "rejected" ? (
                      <span className="status-rejected">❌ Đã từ chối</span>
                    ) : contract.status === "expired" ? (
                      <span className="status-expired">📅 Đã hết hạn</span>
                    ) : contract.paymentStatus === "paid" ? (
                      <span className="status-paid">✅ Đã thanh toán</span>
                    ) : contract.paymentStatus === "failed" ? (
                      <span className="status-failed">❌ Thanh toán thất bại</span>
                    ) : (
                      <span className="status-unpaid">💵 Chưa thanh toán</span>
                    )}
                  </p>

                  {contract.status === "rejected" && (
                    <>
                      <p className="reject-reason">📝 Lý do: {contract.rejectionReason || "Không có lý do cụ thể"}</p>
                      <button className="edit-btn" onClick={() => openEditPopup(contract)}>
                        CHỈNH SỬA & GỬI LẠI
                      </button>
                    </>
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

                {contract.status === "approved" && contract.paymentStatus === "unpaid" && (
                  <button className="pay-btn" onClick={() => handlePayment(contract._id)}>
                    THANH TOÁN
                  </button>
                )}

                {editingContract && (
                  <div className="popup-overlay">
                    <div className="popup">
                      <h3>✏️ Chỉnh sửa hợp đồng</h3>
                      <p><strong>👤 Người thuê:</strong> {editingContract.fullNameB} - {editingContract.phoneB}</p>
                      <p><strong>👤 Chủ nhà:</strong> {editingContract.fullNameA} - {editingContract.phoneA}</p>

                      <label>📅 Ngày bắt đầu</label>
                      <input
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      />

                      <label>📅 Ngày kết thúc</label>
                      <input
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                      />

                      <label>📜 Điều khoản hợp đồng</label>
                      <textarea
                        rows={4}
                        value={editForm.contractTerms}
                        onChange={(e) => setEditForm({ ...editForm, contractTerms: e.target.value })}
                      />

                      <div className="popup-actions">
                        <button className="cancel-btn" onClick={() => setEditingContract(null)}>Hủy</button>
                        <button className="submit-btn" onClick={handleResubmit}>Gửi lại</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyContracts;
