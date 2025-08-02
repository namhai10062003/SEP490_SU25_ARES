import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../../context/authContext";
import {
  approveProfileUpdate,
  getAllProfileUpdateRequests,
  rejectProfileUpdate
} from "../../../service/profileService";
import AdminDashboard from "../adminDashboard";

const AdminProfileUpdatePage = () => {
  const { token: contextToken } = useAuth();
  const token = contextToken || localStorage.getItem("token");
  const [searchText, setSearchText] = useState("");
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getAllProfileUpdateRequests(token);
      const all = res?.data || [];
  
      const searchLower = searchText.toLowerCase();
  
      const filtered = all.filter((r) => {
        const matchesStatus = filter ? r.status === filter : true;
  
        const matchesSearch = !searchText || [
          r.userId?.name,
          r.userId?.email,
          r.newIdentityNumber,
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(searchLower));
  
        return matchesStatus && matchesSearch;
      });
  
      setRequests(filtered);
    } catch (error) {
      console.error("❌ Lỗi khi load requests:", error);
      toast.error("Không thể tải yêu cầu cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    loadRequests();
  }, [filter, searchText]);

  const handleApprove = async (id) => {
    try {
      await approveProfileUpdate(id);
      toast.success("✅ Đã duyệt hồ sơ!");
      loadRequests();
    } catch (error) {
      toast.error("❌ Lỗi duyệt hồ sơ!");
    }
  };

  const openRejectModal = (req) => {
    setSelectedRequest(req);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.warning("⚠️ Vui lòng nhập lý do từ chối!");
      return;
    }

    try {
      await rejectProfileUpdate(selectedRequest._id, rejectReason);
      toast.success("❌ Đã từ chối hồ sơ!");
      setRejectModalOpen(false);
      loadRequests();
    } catch (error) {
      toast.error("❌ Lỗi từ chối hồ sơ!");
    }
  };
  {requests.map((req) => {
    console.log("👉 Kiểm tra CCCD của user:", {
      newIdentityNumber: req.newIdentityNumber,
      identityNumber: req.userId?.identityNumber,
      userId: req.userId?._id,
    });
  
    return (
      <tr key={req._id}>
        <td>{req.newIdentityNumber || req.userId?.identityNumber || "-"}</td>
      </tr>
    );
  })}
  
  return (
    <AdminDashboard active="profile-requests">
      <div className="container py-4">
        <div className="bg-primary text-white rounded-4 p-3 mb-4 text-center">
          <h2 className="mb-0">Duyệt yêu cầu cập nhật hồ sơ</h2>
        </div>

        {/* Lọc trạng thái */}
        <div className="mb-3 d-flex flex-column flex-md-row justify-content-end align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-2">
          <input
            type="text"
            className="form-control w-auto"
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
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
        </div>

        {/* Danh sách yêu cầu */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2" />
            <div>Đang tải dữ liệu...</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>CCCD</th>
                  <th>Ảnh CCCD Trước</th>
                   <th>Ảnh CCCD Sau</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
  {Array.isArray(requests) && requests.length > 0 ? (
    requests.map((req) => (
      <tr key={req._id}>
        <td>
          <img
            src={req.newProfileImage || "/default-avatar.png"}
            alt="avatar"
            style={{ width: 60, height: 60, borderRadius: "50%" }}
          />
        </td>
        <td>{req.userId?.name}</td>
        <td>{req.userId?.email}</td>
        <td>{req.newIdentityNumber || req.userId?.identityNumber || "-"}</td>


        {/* ẢNH CCCD TRƯỚC */}
        <td>
          {req.newCccdFrontImage ? (
           <img
           src={req.newCccdFrontImage}
           alt="CCCD Trước"
           style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 4, cursor: "pointer" }}
           onClick={() => setPreviewImage(req.newCccdFrontImage)}
         />
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>

        {/* ẢNH CCCD SAU */}
        <td>
          {req.newCccdBackImage ? (
            <img
            src={req.newCccdBackImage}
            alt="CCCD Sau"
            style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 4, cursor: "pointer" }}
            onClick={() => setPreviewImage(req.newCccdBackImage)}
          />
          
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>
        {previewImage && (
  <div
    className="modal fade show"
    style={{
      display: "block",
      background: "rgba(0,0,0,0.8)",
      position: "fixed",
      inset: 0,
      zIndex: 1060,
    }}
    onClick={() => setPreviewImage(null)}
  >
    <div
      className="modal-dialog modal-dialog-centered"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-content bg-transparent border-0">
        <img
          src={previewImage}
          alt="Xem ảnh"
          style={{ maxWidth: "100%", maxHeight: "80vh", margin: "auto", borderRadius: 8 }}
        />
        <button
          className="btn btn-light mt-3"
          onClick={() => setPreviewImage(null)}
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
)}
        <td>{req.status}</td>
        <td>
          <button
            className="btn btn-success btn-sm me-2"
            onClick={() => handleApprove(req._id)}
            disabled={req.status !== "pending"}
          >
            Duyệt
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => openRejectModal(req)}
            disabled={req.status !== "pending"}
          >
            Từ chối
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={8} className="text-center">
        Không có yêu cầu nào.
      </td>
    </tr>
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
              inset: 0,
              zIndex: 1050,
            }}
            onClick={() => setRejectModalOpen(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Lý do từ chối</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setRejectModalOpen(false)}
                  />
                </div>
                <div className="modal-body">
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Nhập lý do từ chối..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setRejectModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleRejectConfirm}
                  >
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

export default AdminProfileUpdatePage;
