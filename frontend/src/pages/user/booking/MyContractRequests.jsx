import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReusableModal from "../../../../components/ReusableModal";
import SignaturePopup from "../../../../components/SignaturePopup";
import ContractForm from "../../../../components/contractForm";
import Header from "../../../../components/header";
import LoadingModal from "../../../../components/loadingModal";
import { useAuth } from "../../../../context/authContext";
const MyContractRequests = () => {
  const { user, loading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [rejectPopup, setRejectPopup] = useState({ show: false, contractId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [contractToApprove, setContractToApprove] = useState(null);
const [showConfirmForm, setShowConfirmForm] = useState(false);
const [showSignatureA, setShowSignatureA] = useState(false);
const [signaturePartyAUrl, setSignaturePartyAUrl] = useState(contractToApprove?.signaturePartyAUrl || "");
const [loadingApprove, setLoadingApprove] = useState(false);
const [isloading, setLoading] = useState(false);
const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contracts/landlord`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const sortedData = res.data.data
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
        setRequests(sortedData);
        setContractToApprove(sortedData[0]); // ✅ lấy hợp đồng đầu tiên (mới nhất)
  
        // console.log("✅ Hợp đồng để duyệt:", sortedData[0]);
      } catch (err) {
        toast.error("❌ Lỗi khi tải yêu cầu hợp đồng");
      }finally{
        setLoading(false);
      }
    };
  
    if (user) fetchRequests();
  }, [user]);
  
  const formatVNDate = (date) =>
  new Date(date).toLocaleDateString("vi-VN");

  
  const handleApprove = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/contracts/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // toast.success("✅ Đã duyệt hợp đồng");
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
    setLoading(true);
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
    }finally{
      setLoading(false);
    }
  };

  // Hàm xoá
const handleDelete = async () => {
  if (!deleteId) return;
  setLoading(true);
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/contracts/${deleteId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    toast.success("🗑️ Đã xóa");
    setRequests(prev => prev.filter(c => c._id !== deleteId));
  } catch {
    toast.error("❌ Không thể xóa");
  } finally {
    setLoading(false);
    setDeleteId(null);
  }
};
  

  const filteredRequests = requests.filter((c) => {
    const now = new Date();
    const isExpired = new Date(c.endDate) < now;
  
    // Loại bỏ yêu cầu "pending" đã hết hạn khỏi danh sách thông thường
    const isExpiredPending = c.status === "pending" && isExpired;
    if (filterStatus !== "expired" && isExpiredPending) return false;
  
    // ✅ Lọc theo filterStatus
    const matchStatus =
      filterStatus === "all"
        ? c.status !== "cancelled"
        : filterStatus === "expired"
        ? isExpired && c.status === "pending"
        : c.status === filterStatus;
  
    // ✅ Lọc theo searchTerm (nếu có)
    const keyword = searchTerm.toLowerCase();
    const matchSearch =
      c.fullNameB?.toLowerCase().includes(keyword) ||
      c.addressB?.toLowerCase().includes(keyword) ||
      c.phoneB?.toLowerCase().includes(keyword) ||
      c.depositAmount?.toString().includes(keyword);
  
    // ✅ Lọc theo ngày tạo
    const contractDate = new Date(c.createdAt);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);
  
    const matchDate =
      (!from || contractDate >= from) &&
      (!to || contractDate <= to);
  
    return matchStatus && (!searchTerm || matchSearch) && matchDate;
  });
  
  // Ở đầu component, sau các useState
  useEffect(() => {
    // console.log("✅ signaturePartyAUrl trong ContractForm:", signaturePartyAUrl);
  }, [signaturePartyAUrl]);
  
  useEffect(() => {
    if (contractToApprove) {
      // console.log("✅ Đã cập nhật contractToApprove:", contractToApprove);
    }
  }, [contractToApprove]);
  

  if (loading) return <LoadingModal />;

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
            <option value="cancelled">Đã huỷ</option>
          </select>
  
          <input
            type="text"
            className="form-control w-auto"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ maxWidth: 200 }}
          />
          <input
            type="date"
            className="form-control"
            value={dateTo}
            onChange={(e) => {
              if (dateFrom && new Date(e.target.value) < new Date(dateFrom)) {
                alert("Ngày đến phải sau hoặc bằng ngày bắt đầu");
                return;
              }
              setDateTo(e.target.value);
            }}
            min={dateFrom}
            style={{ maxWidth: 200 }}
          />
        </div>
  
        {filteredRequests.length === 0 ? (
          <div className="alert alert-info">📭 Không có hợp đồng phù hợp.</div>
        ) : (
          <div className="row g-4">
            {filteredRequests.map((contract, index) => {
              const isExpired = new Date(contract.endDate) < new Date();
  
              return (
                <div className="col-12" key={contract._id}>
                  <div className="card shadow-sm rounded-4 border-0">
                    <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                      <div className="d-flex align-items-start gap-3 flex-grow-1">
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 44, height: 44, fontSize: 20 }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">
                            👤 Người đặt cọc: {contract.fullNameB}
                          </h5>
                          <div className="mb-1">
                            <span className="fw-semibold">📍 Địa chỉ:</span>{" "}
                            {contract.addressB}
                          </div>
                          <div className="mb-1">
                            <span className="fw-semibold">📞 SĐT:</span>{" "}
                            {contract.phoneB}
                          </div>
                          
<div className="mb-1">
  <span className="fw-semibold">📅 Ngày Tạo:</span>{" "}
  {contract.startDate
    ? formatVNDate(contract.startDate)
    : contract.createdAt
    ? formatVNDate(contract.createdAt)
    : "-"}{" "}
  {/* -{" "}
  {contract.endDate
    ? formatVNDate(contract.endDate)
    : contract.createdAt
    ? formatVNDate(
        new Date(
          new Date(contract.createdAt).setDate(
            new Date(contract.createdAt).getDate() + 7
          )
        )
      )
    : "-"} */}
</div>

                          <div className="mb-1">
                            <span className="fw-semibold">💰 Cọc:</span>{" "}
                            {contract.depositAmount?.toLocaleString("vi-VN")} VND
                          </div>
                          <div>
                            <span className="fw-semibold">Trạng thái: </span>
                            {isExpired && contract.status === "pending" ? (
                              <span className="badge bg-secondary">
                                Đã hết hạn
                              </span>
                            ) : contract.status === "approved" ? (
                              <span className="badge bg-success">Đã duyệt</span>
                            ) : contract.status === "rejected" ? (
                              <span className="badge bg-danger">Đã từ chối</span>
                            ) : contract.status === "expired" ? (
                              <span className="badge bg-secondary">
                                Đã hết hạn
                              </span>
                            ) : contract.status === "cancelled" ? (
                              <span className="badge bg-dark">Đã huỷ</span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                Chờ duyệt
                              </span>
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
                          onClick={() =>
                            navigate(`/contracts/${contract._id}`)
                          }
                        >
                          XEM CHI TIẾT
                        </button>
  
                        {contract.status === "pending" && (
                          <>
                            {isExpired ? (
                              <span className="text-danger fst-italic">
                                ⛔ Hết hạn - Không thể duyệt
                              </span>
                            ) : (
                              <>
                              <button
  className="btn btn-success fw-bold"
  onClick={() => {
    setContractToApprove(contract); // lưu lại hợp đồng
    setShowConfirmForm(true);      // mở form xem trước
  }}
>
  DUYỆT
</button>


                                <button
                                  className="btn btn-danger fw-bold"
                                  onClick={() =>
                                    handleRejectClick(contract._id)
                                  }
                                >
                                  TỪ CHỐI
                                </button>
                              </>
                            )}
                          </>
                        )}
  
    <button
    className="btn btn-outline-danger fw-bold"
    onClick={() => setDeleteId(contract._id)}
  >
    XÓA
  </button>

  <ReusableModal
  show={!!deleteId}
  title="Xác nhận xoá hợp đồng"
  body={<p>Bạn có chắc muốn xóa hợp đồng này?</p>}
  onClose={() => setDeleteId(null)}
  footerButtons={[
    {
      label: "Huỷ",
      variant: "secondary",
      onClick: () => setDeleteId(null),
      disabled: isloading,
    },
    {
      label: isloading ? "Đang xoá..." : "🗑️ Xoá",
      variant: "danger",
      onClick: () => handleDelete(deleteId),
      disabled: isloading,
    },
  ]}
/>

                      </div>
                    </div>
                  </div>
  
                  {/* Popup từ chối */}
                  {rejectPopup.show &&
                    rejectPopup.contractId === contract._id && (
                      <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        style={{ background: "rgba(0,0,0,0.4)" }}
                      >
                        <div className="modal-dialog modal-dialog-centered">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title">
                                📝 Nhập lý do từ chối
                              </h5>
                              <button
                                type="button"
                                className="btn-close"
                                onClick={() =>
                                  setRejectPopup({
                                    show: false,
                                    contractId: null,
                                  })
                                }
                              ></button>
                            </div>
                            <div className="modal-body">
                              <textarea
                                value={rejectReason}
                                onChange={(e) =>
                                  setRejectReason(e.target.value)
                                }
                                placeholder="Nhập lý do từ chối hợp đồng..."
                                rows={4}
                                className="form-control"
                              />
                            </div>
                            <div className="modal-footer">
                              <button
                                className="btn btn-secondary"
                                onClick={() =>
                                  setRejectPopup({
                                    show: false,
                                    contractId: null,
                                  })
                                }
                              >
                                Hủy
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={handleConfirmReject}
                              >
                                Gửi
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showConfirmForm && contractToApprove && (
  <div className="modal show d-block" tabIndex="-1">
    <Modal
  show={showConfirmForm}
  onHide={() => setShowConfirmForm(false)}
  size="lg"
  centered
  backdrop="static"
>
  <Modal.Header closeButton>
    <Modal.Title>Xác nhận duyệt hợp đồng</Modal.Title>
  </Modal.Header>
  <Modal.Body>
  {contractToApprove && (
  <ContractForm
    contractData={contractToApprove}
    post={contractToApprove?.postId}         // ✅ fix ở đây
    user={contractToApprove?.userId}         // ✅ nếu bạn populate("userId")
    landlord={contractToApprove?.landlordId} // ✅ nếu bạn có dùng landlordId (optional)
    readOnly={true}
    headerDate={new Date()}
    signaturePartyBUrl={contractToApprove?.signaturePartyBUrl}
    signaturePartyAUrl={signaturePartyAUrl} 
  />
)}

  </Modal.Body>

  <Modal.Footer>
  <Button variant="outline-primary" onClick={() => setShowSignatureA(true)}>
  Ký hợp đồng (Bên A)
</Button>

    <Button variant="secondary" onClick={() => setShowConfirmForm(false)}>
      Huỷ
    </Button>
    <Button
  variant="success"
  onClick={async () => {
    if (
      !signaturePartyAUrl ||
      typeof signaturePartyAUrl !== "string" ||
      !signaturePartyAUrl.startsWith("data:image")
    ) {
      toast.warning("⚠️ Vui lòng ký tên trước khi duyệt!");
      return;
    }

    if (!contractToApprove || !contractToApprove._id) {
      toast.error("❌ Không tìm thấy hợp đồng cần duyệt.");
      return;
    }

    try {
      setLoadingApprove(true);
      console.log("⛳ Props signaturePartyAUrl:", contractToApprove?.signaturePartyAUrl);

      console.log("⛳ CHỮ KÝ A:", signaturePartyAUrl?.slice(0, 50)); // ✅ Log ngay trước khi dùng
      // console.log("📤 Truyền vào ContractForm:", contractToApprove?.signaturePartyAUrl);

      const blob = await (await fetch(signaturePartyAUrl)).blob();
      const file = new File([blob], "signaturePartyAUrl.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("signaturePartyAUrl", file);
      formData.append("contractId", contractToApprove._id);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/contracts/upload-signature`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      await handleApprove(contractToApprove._id);

      toast.success("✅ Đã duyệt hợp đồng và ký tên!");
      setShowConfirmForm(false);
      setContractToApprove(null);
    } catch (error) {
      toast.error("❌ Lỗi khi duyệt hợp đồng hoặc upload chữ ký");
      console.error(error);
    }finally {
      setLoadingApprove(false); // tắt loading
    }
  }}
>
{loadingApprove ? (
    <>
      <Spinner animation="border" size="sm" /> Đang duyệt...
    </>
  ) : (
    "Xác nhận duyệt"
  )}
</Button>

{loadingApprove && <LoadingModal />}
  </Modal.Footer>
</Modal>

<SignaturePopup
  show={showSignatureA}
  onClose={() => setShowSignatureA(false)}
  onSave={(base64Signature) => {
    console.log("⛳ CHỮ KÝ A:", base64Signature?.slice(0, 50));
    setSignaturePartyAUrl(base64Signature); // 👈 Gán đúng state
    setShowSignatureA(false);
  }}
  party="A"
/>



  </div>
)}
{isloading && <LoadingModal />}
    </div>
  );
  
};

export default MyContractRequests;