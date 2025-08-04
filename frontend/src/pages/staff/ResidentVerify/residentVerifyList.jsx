import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import StaffNavbar from "../../staff/staffNavbar"; // ✅ Thêm dòng này

const ResidentVerifyList = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [dobFilter, setDobFilter] = useState(""); // ngày sinh
  const [issueDateFilter, setIssueDateFilter] = useState(""); // ngày cấp
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  const fetchResidents = async () => {
    try {
      const token = localStorage.getItem("token");
      let url;

      if (statusFilter === "pending") {
        url = `${import.meta.env.VITE_API_URL}/api/residents/residents/unverified`;
      } else if (statusFilter === "all") {
        url = `${import.meta.env.VITE_API_URL}/api/residents`;
      } else {
        url = `${import.meta.env.VITE_API_URL}/api/residents?status=${statusFilter}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const sorted = (data.residents || data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setResidents(sorted);
    } catch (err) {
      toast.error("❌ Lỗi tải danh sách cư dân");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    setLoading(true);
    fetchResidents();
    setCurrentPage(1);
  }, [filterText, dobFilter, issueDateFilter, statusFilter]);

  const handleVerify = async () => {
    if (!confirmId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/residents/verify-by-staff/${confirmId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        toast.success("✅ Xác minh thành công");
        setResidents((prev) => prev.filter((r) => r._id !== confirmId));
      } else {
        toast.error("❌ Thao tác thất bại");
      }
    } catch (err) {
      toast.error("❌ Có lỗi xảy ra khi xác minh");
    } finally {
      setConfirmId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning("❗ Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/residents/reject-by-staff/${rejectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );
      if (res.ok) {
        toast.success("🚫 Đã từ chối nhân khẩu");

        // ❌ Xoá khỏi danh sách
        setResidents((prev) => prev.filter((r) => r._id !== rejectId));

        setRejectId(null);
        setRejectReason("");
      } else {
        toast.error("❌ Từ chối thất bại");
      }
    } catch (err) {
      toast.error("❌ Có lỗi xảy ra khi từ chối");
    }
  };



  const openImage = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };


  const filteredResidents = useMemo(() => {
    const result = residents.filter((r) => {
      const fullText = `${r.fullName} ${r.apartmentId?.apartmentCode || ""} ${r.gender} ${r.nationality} ${r.idNumber}`.toLowerCase();
      const matchText = fullText.includes(filterText.toLowerCase());

      const dobMatch = dobFilter
        ? new Date(r.dateOfBirth).toISOString().split("T")[0] === dobFilter
        : true;

      const issueDateMatch = issueDateFilter
        ? new Date(r.issueDate).toISOString().split("T")[0] === issueDateFilter
        : true;

      const statusMatch =
        statusFilter === "all"
          ? true
          : String(r.verifiedByStaff) === statusFilter;

      return matchText && dobMatch && issueDateMatch && statusMatch;
    });

    // ✅ Log toàn bộ danh sách resident đang là pending
    const pendingList = residents.filter(
      (r) => String(r.verifiedByStaff) === "pending"
    );
    console.log("🟡 Resident có trạng thái pending:", pendingList);

    // ✅ Log kết quả lọc final
    console.log("✅ filteredResidents sau khi lọc:", result);

    return result;
  }, [residents, filterText, dobFilter, issueDateFilter, statusFilter]);

  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);

  const paginatedResidents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResidents.slice(start, start + itemsPerPage);
  }, [filteredResidents, currentPage]);


  return (
    <div className="bg-light min-vh-100 d-flex">
      <StaffNavbar />

      <main className="flex-grow-1 p-4">
        <h2 className="fw-bold mb-4 text-center text-primary">
          Danh sách nhân khẩu chờ xác minh
        </h2>

        {/* Bộ lọc */}
        <div className="row g-2 align-items-end mb-4">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder=" Tìm kiếm..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold">Ngày sinh</label>
            <input
              type="date"
              className="form-control"
              value={dobFilter}
              onChange={(e) => setDobFilter(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold">Ngày cấp CCCD</label>
            <input
              type="date"
              className="form-control"
              value={issueDateFilter}
              onChange={(e) => setIssueDateFilter(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label fw-bold">Trạng thái</label>
            <select
              className="form-select w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chưa xác minh</option>
              <option value="true">Đã xác minh</option>
              <option value="false">Đã từ chối</option>
            </select>
          </div>
        </div>

        {/* Nội dung */}
        {loading ? (
          <div className="d-flex align-items-center justify-content-center py-5">
            <div className="spinner-border text-primary me-2" />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : residents.length === 0 ? (
          <p className="text-center">Không có nhân khẩu nào cần xác minh.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle bg-white rounded-4 shadow">
              <thead className="table-primary">
                <tr>
                  <th>Họ tên</th>
                  <th>Căn hộ</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Quan hệ</th>
                  <th>Quốc tịch</th>
                  <th>CCCD/ Giấy khai sinh</th>
                  <th>Ngày cấp</th>
                  <th>Ảnh CCCD/ Giấy khai sinh</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedResidents.map((r) => (
                  <tr key={r._id}>
                    <td>{r.fullName}</td>
                    <td>{r.apartmentId?.apartmentCode || "---"}</td>
                    <td>{r.gender}</td>
                    <td>{r.dateOfBirth ? new Date(r.dateOfBirth).toLocaleDateString("vi-VN") : ""}</td>
                    <td>{r.relationWithOwner}</td>
                    <td>{r.nationality}</td>
                    <td>{r.idNumber}</td>
                    <td>{r.issueDate ? new Date(r.issueDate).toLocaleDateString("vi-VN") : ""}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {r.documentFront && (
                          <img
                            src={r.documentFront}
                            alt="CCCD mặt trước"
                            title="Mặt trước"
                            style={{
                              width: 60,
                              height: 40,
                              objectFit: "cover",
                              cursor: "pointer",
                              borderRadius: 4,
                              border: "1px solid #ccc",
                            }}
                            onClick={() => openImage(r.documentFront)}
                          />
                        )}
                        {r.documentBack && (
                          <img
                            src={r.documentBack}
                            alt="CCCD mặt sau"
                            title="Mặt sau"
                            style={{
                              width: 60,
                              height: 40,
                              objectFit: "cover",
                              cursor: "pointer",
                              borderRadius: 4,
                              border: "1px solid #ccc",
                            }}
                            onClick={() => openImage(r.documentBack)}
                          />
                        )}
                        {!r.documentFront && !r.documentBack && "---"}
                      </div>
                    </td>

                    <td>
                      {r.verifiedByStaff === "pending" && (
                        <>
                          <button className="btn btn-success mb-2" onClick={() => setConfirmId(r._id)}>
                            Xác minh
                          </button>
                          <button className="btn btn-danger" onClick={() => setRejectId(r._id)}>
                            Từ chối
                          </button>
                        </>
                      )}

                      {r.verifiedByStaff === "true" && (
                        <span className="text-success fw-bold">Đã xác minh</span>
                      )}

                      {r.verifiedByStaff === "false" && (
                        <div>
                          <span className="text-danger fw-bold">Đã từ chối</span>
                          {r.rejectReason && (
                            <div className="text-muted small mt-1">Lý do: {r.rejectReason}</div>
                          )}
                        </div>
                      )}

                    </td>


                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal xác minh */}
        {confirmId && (
          <div
            className="modal fade show"
            style={{ display: "block", background: "rgba(30,41,59,0.5)" }}
            tabIndex={-1}
            onClick={() => setConfirmId(null)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Xác minh nhân khẩu</h5>
                  <button type="button" className="btn-close" onClick={() => setConfirmId(null)} />
                </div>
                <div className="modal-body">
                  <p>Bạn có chắc chắn muốn xác minh nhân khẩu này?</p>
                </div>
                <div className="modal-footer d-flex justify-content-end gap-2">
                  <button className="btn btn-success" onClick={handleVerify}>
                    Xác minh
                  </button>
                  <button className="btn btn-secondary" onClick={() => setConfirmId(null)}>
                    Huỷ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal từ chối */}
        {rejectId && (
          <div
            className="modal fade show"
            style={{ display: "block", background: "rgba(30,41,59,0.5)" }}
            tabIndex={-1}
            onClick={() => setRejectId(null)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Lý do từ chối</h5>
                  <button type="button" className="btn-close" onClick={() => setRejectId(null)} />
                </div>
                <div className="modal-body">
                  <textarea
                    rows="4"
                    className="form-control"
                    placeholder="Nhập lý do từ chối..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="modal-footer d-flex justify-content-end gap-2">
                  <button className="btn btn-danger" onClick={handleReject}>
                    Gửi từ chối
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setRejectId(null);
                      setRejectReason("");
                    }}
                  >
                    Huỷ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="d-flex justify-content-center mt-4 gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`btn ${currentPage === index + 1 ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );


};

export default ResidentVerifyList;
