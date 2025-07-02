import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchAllReports,
  updateReportStatus,
} from "../../../service/reportService";
import AdminDashboard from "../adminDashboard";

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
    if (status === "rejected") {
      openRejectModal(id);
      return;
    }
    try {
      await updateReportStatus(id, { status });
      toast.success("✅ Đã cập nhật trạng thái!", { position: "top-right" });
      loadReports();
    } catch (err) {
      toast.error(
        "❌ Lỗi cập nhật: " + (err.response?.data?.message || err.message),
        { position: "top-right" }
      );
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối!");
      return;
    }
    try {
      await updateReportStatus(selectedReportId, {
        status: "rejected",
        reason: rejectReason,
      });
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
    // eslint-disable-next-line
  }, [filter]);

  return (
    <AdminDashboard active="reports">
      <div className="container py-4">
        <div className="bg-primary text-white rounded-4 p-3 mb-4 text-center">
          <h2 className="mb-0">Quản lý Báo cáo</h2>
        </div>

        <div className="mb-3 d-flex align-items-center gap-2">
          <label className="fw-semibold">Lọc trạng thái:</label>
          <select
            className="form-select w-auto"
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
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2"></div>
            <div>Đang tải dữ liệu...</div>
          </div>
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
                  <th>Pháp lý</th>
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
                      <td>{p?.legalDocument || "--"}</td>
                      <td>
                        {rep.user?.name || "Ẩn danh"}
                        <br />
                        <small className="text-muted">{rep.user?.email}</small>
                      </td>
                      <td>{rep.reason}</td>
                      <td style={{ maxWidth: 200 }}>{rep.description || "--"}</td>
                      <td className="text-capitalize">
                        {rep.status === "pending" ? (
                          <span className="badge bg-warning text-dark">Chờ xử lý</span>
                        ) : rep.status === "reviewed" ? (
                          <span className="badge bg-success">Đã xử lý</span>
                        ) : rep.status === "rejected" ? (
                          <span className="badge bg-danger">Từ chối</span>
                        ) : (
                          <span className="badge bg-secondary">{rep.status}</span>
                        )}
                      </td>
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
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeRejectModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <textarea
                    className="form-control mb-3"
                    placeholder="Nhập lý do..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  ></textarea>
                </div>
                <div className="modal-footer">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboard>
  );
};

export default AdminReportPage;