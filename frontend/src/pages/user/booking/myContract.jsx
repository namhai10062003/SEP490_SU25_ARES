import axios from "axios";
import React, { useEffect, useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";

const MyContracts = () => {
  const { user, loading } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editingContract, setEditingContract] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editForm, setEditForm] = useState({
    startDate: "",
    endDate: "",
    contractTerms: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const getToday = () => {
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };
  // xử lý ngày h 
  // ✅ Nếu startDate > endDate → tự set endDate = startDate + 1
  useEffect(() => {
    if (!editingContract) return;
    if (editForm.endDate <= editForm.startDate) {
      const nextDay = new Date(editForm.startDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split("T")[0];
      setEditForm((prev) => ({ ...prev, endDate: nextDayStr }));
    }
  }, [editForm.startDate, editingContract]);
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
  // xử lý hợp đồng
  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contracts/me`, {
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
        `${import.meta.env.VITE_API_URL}/api/contracts/${editingContract._id}/resubmit`,
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
  // hàm xử lý hủy hợp đồng
  const handleCancelContract = async (id) => {
    confirmAlert({
      title: "Xác nhận huỷ hợp đồng",
      message: "Bạn có chắc chắn muốn huỷ hợp đồng này?",
      buttons: [
        {
          label: "Huỷ hợp đồng",
          onClick: async () => {
            try {
              const token = localStorage.getItem("token");
              await axios.patch(`${import.meta.env.VITE_API_URL}/api/contracts/cancel/${id}`, null, {
                headers: { Authorization: `Bearer ${token}` },
              });

              toast.success("🗑️ Đã huỷ hợp đồng");
              setContracts((prev) =>
                prev.map((c) => (c._id === id ? { ...c, status: "cancelled" } : c))
              );
            } catch (err) {
              console.error(err);
              toast.error("❌ Lỗi khi huỷ hợp đồng");
            }
          },
        },
        {
          label: "Không huỷ",
          onClick: () => toast.info("⛔ Bạn đã huỷ thao tác"),
        },
      ],
    });
  };
  // hàm xử lí thanh toán
  const handlePayment = async (id) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/contracts/${id}/pay`,
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

  const filteredContracts = contracts.filter((c) => {
    // 1. Kiểm tra người dùng
    const isMyContract =
      c.userId === user._id || c.userId === user._id?.toString();
    if (!isMyContract || c.status === "cancelled") return false;

    // 2. Lọc theo trạng thái thanh toán
    const matchesStatus = filter === "all" || c.paymentStatus === filter;

    // 3. Lọc theo từ khóa (1 ô input duy nhất: tên, địa chỉ, SĐT, tiền đặt cọc)
    const keyword = searchText.toLowerCase().trim();
    const combined = `${c.fullNameA} ${c.addressA} ${c.phoneA}`.toLowerCase();
    const matchesText = combined.includes(keyword);

    const inputAsNumber = parseFloat(searchText.replace(/[^\d]/g, ""));
    const matchesDeposit =
      isNaN(inputAsNumber) || c.depositAmount >= inputAsNumber;

    const matchesKeyword = matchesText || matchesDeposit;

    // 4. Lọc theo ngày
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);
    const contractDate = new Date(c.startDate);
    const matchesDate =
      (!from || contractDate >= from) && (!to || contractDate <= to);

    return matchesStatus && matchesKeyword && matchesDate;
  });



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
        <h2 className="fw-bold mb-4 text-primary">📄 Hợp đồng của tôi</h2>

        <div className="mb-4 d-flex align-items-center gap-2">
          <label className="fw-semibold">Lọc trạng thái:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select w-auto"
          >
            <option value="all">Tất cả</option>
            <option value="paid">Đã thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
            <option value="failed">Chờ duyệt</option>
          </select>


          <input
            type="text"
            className="form-control w-auto"
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <input
            type="date"
            className="form-control w-auto"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="form-control w-auto"
            value={dateTo}
            min={dateFrom}
            onChange={(e) => setDateTo(e.target.value)}
          />

        </div>


        {filteredContracts.length === 0 ? (
          <div className="alert alert-info">📭 Không có hợp đồng phù hợp.</div>
        ) : (
          <div className="row g-4">
            {filteredContracts.map((contract, index) => (
              <div className="col-12" key={contract._id}>
                <div className="card shadow-sm rounded-4 border-0">
                  <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div className="d-flex align-items-start gap-3 flex-grow-1">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, fontSize: 20 }}>
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">🏠 {contract.fullNameA}</h5>
                        <div className="mb-1"><span className="fw-semibold">📍 Địa chỉ:</span> {contract.addressA}</div>
                        <div className="mb-1"><span className="fw-semibold">📅 Từ:</span> {contract.startDate?.slice(0, 10)} - {contract.endDate?.slice(0, 10)}</div>
                        <div className="mb-1"><span className="fw-semibold">💰 Đặt cọc:</span> {contract.depositAmount?.toLocaleString("vi-VN")} VNĐ</div>
                        <div className="mb-1"><span className="fw-semibold">📞 Liên hệ:</span> {contract.phoneA}</div>
                        <div>
                          <span className="fw-semibold">Trạng thái: </span>
                          {contract.status === "pending" ? (
                            <span className="badge bg-warning text-dark">⏳ Chờ duyệt</span>
                          ) : contract.status === "rejected" ? (
                            <span className="badge bg-danger">❌ Đã từ chối</span>
                          ) : contract.status === "expired" ? (
                            <span className="badge bg-secondary">📅 Đã hết hạn</span>
                          ) : contract.paymentStatus === "paid" ? (
                            <span className="badge bg-success">✅ Đã thanh toán</span>
                          ) : contract.paymentStatus === "failed" ? (
                            <span className="badge bg-danger">❌ Thanh toán thất bại</span>
                          ) : (
                            <span className="badge bg-info text-dark">💵 Chưa thanh toán</span>
                          )}
                        </div>
                        {contract.status === "rejected" && (
                          <>
                            <div className="text-danger fst-italic mt-2">
                              📝 Lý do: {contract.rejectionReason || "Không có lý do cụ thể"}
                            </div>
                            <button className="btn btn-outline-primary btn-sm mt-2" onClick={() => openEditPopup(contract)}>
                              CHỈNH SỬA & GỬI LẠI
                            </button>
                          </>
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
                        <button
                          className="btn btn-outline-danger fw-bold"
                          onClick={() => handleCancelContract(contract._id)}
                        >
                          HUỶ HỢP ĐỒNG
                        </button>
                      )}
                      {contract.status === "approved" && contract.paymentStatus === "unpaid" && (
                        <button className="btn btn-primary fw-bold" onClick={() => handlePayment(contract._id)}>
                          THANH TOÁN
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Popup chỉnh sửa */}
                {editingContract && editingContract._id === contract._id && (
                  <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">✏️ Chỉnh sửa hợp đồng</h5>
                          <button type="button" className="btn-close" onClick={() => setEditingContract(null)}></button>
                        </div>
                        <div className="modal-body">
                          <div className="mb-2"><strong>👤 Người thuê:</strong> {editingContract.fullNameB} - {editingContract.phoneB}</div>
                          <div className="mb-2"><strong>👤 Chủ nhà:</strong> {editingContract.fullNameA} - {editingContract.phoneA}</div>
                          <div className="mb-3">
                            <label className="form-label">📅 Ngày bắt đầu</label>
                            <input
                              type="date"
                              className="form-control"
                              value={editForm.startDate}
                              min={getToday()}
                              onChange={(e) =>
                                setEditForm({ ...editForm, startDate: e.target.value })
                              }
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">📅 Ngày kết thúc</label>
                            <input
                              type="date"
                              className="form-control"
                              value={editForm.endDate}
                              min={(() => {
                                const nextDay = new Date(editForm.startDate);
                                nextDay.setDate(nextDay.getDate() + 1);
                                return nextDay.toISOString().split("T")[0];
                              })()}
                              onChange={(e) =>
                                setEditForm({ ...editForm, endDate: e.target.value })
                              }
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label">📜 Ghi chú thêm vào hợp đồng</label>
                            <textarea
                              rows={4}
                              className="form-control"
                              value={editForm.contractTerms}
                              onChange={(e) => setEditForm({ ...editForm, contractTerms: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button className="btn btn-secondary" onClick={() => setEditingContract(null)}>Hủy</button>
                          <button className="btn btn-success" onClick={handleResubmit}>Gửi lại</button>
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

export default MyContracts;
