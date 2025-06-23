import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import {
    fetchAllReports,
    updateReportStatus,
} from "../../../service/reportService";
import AdminDashboard from "../../adminDashboard";

Modal.setAppElement("#root");

const AdminReportPage = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetchAllReports(filter);
      setReports(res.data.data || []);
    } catch (err) {
      console.error("Lỗi khi tải báo cáo:", err);
      toast.error("Không thể nạp danh sách báo cáo!");
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (id) => {
    setSelectedReportId(id);
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectReason("");
    setSelectedReportId(null);
  };

  const handleUpdate = async (id, status) => {
    let reason = "";

    if (status === "rejected") {
      openRejectModal(id);
      return;
    }

    const body = {
      status,
    };

    try {
      const response = await updateReportStatus(id, body);
      toast.success("✅ Đã cập nhật trạng thái!", {
        position: "top-right",
      });
      loadReports();
    } catch (err) {
      toast.error(
        "❌ Lỗi cập nhật: " + (err.response?.data?.message || err.message),
        {
          position: "top-right",
        }
      );
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối!");
      return;
    }

    const body = {
      status: "rejected",
      reason: rejectReason,
    };

    try {
      const response = await updateReportStatus(selectedReportId, body);
      toast.success("❌ Báo cáo đã bị từ chối!");
      closeRejectModal();
      loadReports();
    } catch (err) {
      toast.error(
        "❌ Lỗi cập nhật: " + (err.response?.data?.message || err.message)
      );
    }
  };

  useEffect(() => {
    loadReports();
  }, [filter]);

  return (
    <AdminDashboard active="reports">
      <h2 className="mb-4">Quản lý Báo cáo</h2>

      <div className="mb-3">
        <label>Lọc trạng thái:&nbsp;</label>
        <select
          className="form-select w-auto d-inline-block ms-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="pending">Chưa xử lý</option>
          <option value="reviewed">Đã xử lý</option>
          <option value="rejected">Từ chối</option>
          <option value="">Tất cả</option>
        </select>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu…</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Mô tả bài viết</th>
                <th>Loại GD</th>
                <th>Loại BĐS</th>
                <th>Vị trí</th>
                <th>Diện tích</th>
                <th>Giá</th>
                <th>Pháp lý</th>
                <th>Nội thất</th>
                <th>Người gửi</th>
                <th>Lý do</th>
                <th>Mô tả BC</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 && (
                <tr>
                  <td colSpan="15" className="text-center">
                    Không có báo cáo phù hợp
                  </td>
                </tr>
              )}

              {reports.map((rep) => {
                const p = rep.post;
                return (
                  <tr key={rep._id}>
                    <td>
                      {p?.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt="img"
                          style={{ width: 80, height: 60, objectFit: "cover" }}
                        />
                      ) : (
                        <small className="text-muted">--</small>
                      )}
                    </td>
                    <td>{p?.title || "--"}</td>
                    <td
                      style={{
                        maxWidth: 220,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        cursor: "pointer",
                        color: "#007bff",
                      }}
                      title="Click để xem đầy đủ"
                      onClick={() => setShowFullDesc(p?.description)}
                    >
                      {p?.description || "--"}
                    </td>
                    <td>{p?.type || "--"}</td>
                    <td>{p?.property || "--"}</td>
                    <td>{p?.location || "--"}</td>
                    <td>{p?.area ? `${p.area} m²` : "--"}</td>
                    <td>{p?.price ? p.price.toLocaleString("vi-VN") + " đ" : "--"}</td>
                    <td>{p?.legalDocument || "--"}</td>
                    <td>{p?.interiorStatus || "--"}</td>
                    <td>
                      {rep.user?.name || "Ẩn danh"}
                      <br />
                      <small className="text-muted">{rep.user?.email}</small>
                    </td>
                    <td>{rep.reason}</td>
                    <td style={{ maxWidth: 200 }}>{rep.description || "--"}</td>
                    <td className="text-capitalize">{rep.status}</td>
                    <td>
                      {rep.status === "pending" ? (
                        <>
                          <button
                            className="btn btn-sm btn-success me-1"
                            onClick={() => handleUpdate(rep._id, "reviewed")}
                          >
                            ✅ Duyệt
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => openRejectModal(rep._id)}
                          >
                            ❌ Từ chối
                          </button>
                        </>
                      ) : (
                        <span className="text-muted fst-italic">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal xem đầy đủ mô tả */}
      {showFullDesc && (
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
          onClick={() => setShowFullDesc(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Mô tả bài viết</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowFullDesc(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>{showFullDesc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nhập lý do từ chối */}
      <Modal
        isOpen={rejectModalOpen}
        onRequestClose={closeRejectModal}
        contentLabel="Lý do từ chối"
        style={{
          content: {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            padding: "24px",
            borderRadius: "12px",
          },
        }}
      >
        <h5 className="mb-3">Lý do từ chối</h5>
        <textarea
          className="form-control mb-3"
          placeholder="Nhập lý do..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        ></textarea>
       <div className="d-flex justify-content-end gap-2">
  <button
    className="btn btn-outline-secondary btn-sm px-3 py-1 rounded-pill"
    onClick={closeRejectModal}
  >
    Hủy
  </button>
  <button
    className="btn btn-outline-danger btn-sm px-3 py-1 rounded-pill"
    onClick={handleRejectConfirm}
  >
    Gửi từ chối
  </button>
</div>
      </Modal>
    </AdminDashboard>
  );
};

export default AdminReportPage;
