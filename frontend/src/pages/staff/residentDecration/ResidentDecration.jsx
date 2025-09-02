import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import { FiBell } from "react-icons/fi";
import { toast } from "react-toastify";
import ReusableModal from "../../../../components/ReusableModal";
import LoadingModal from "../../../../components/loadingModal";
import StaffNavbar from "../../staff/staffNavbar";
const ResidenceDeclarationVerifyList = () => {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [dobFilter, setDobFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpenImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const itemsPerPage = 10;

   // Hàm fetch data
   const fetchDeclarations = async () => {
    try {
      const token = localStorage.getItem("token");
      let url;

      if (statusFilter === "pending") {
        url = `${import.meta.env.VITE_API_URL}/api/residence-declaration/unverified`;
      } else if (statusFilter === "all") {
        url = `${import.meta.env.VITE_API_URL}/api/residence-declaration`;
      } else {
        url = `${import.meta.env.VITE_API_URL}/api/residence-declaration?status=${statusFilter}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      console.log("👉 Raw API data:", data);  
      const sorted = (data.declarations || data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // // ✅ Tính số ngày còn lại và thêm flag showNotifyButton
      // const withFlags = sorted.map((item) => {
      //   let showNotifyButton = false;
      //   if (item.endDate) {
      //     const daysLeft = Math.ceil(
      //       (new Date(item.endDate) - new Date()) / (1000 * 60 * 60 * 24)
      //     );
      //     if (daysLeft <= 3 && daysLeft >= 0) {
      //       showNotifyButton = true;
      //     }
      //   }
      //   return { ...item, showNotifyButton };
      // });

      setDeclarations(sorted);
    } catch (err) {
      toast.error("❌ Lỗi tải danh sách hồ sơ tạm trú/tạm vắng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDeclarations();
    setCurrentPage(1);
  }, [filterText, dobFilter, statusFilter]);
 // ✅ Gửi thông báo cho user
 const handleNotifyUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/residence-declaration/notify-user/${id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success(`📢 ${data.message}`);
      } else {
        toast.error(`❌ ${data.message || "Gửi thông báo thất bại"}`);
      }
    } catch (err) {
      toast.error("❌ Có lỗi xảy ra khi gửi thông báo");
    }
  };
  const handleVerify = async () => {
    if (!confirmId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/residence-declaration/verify-by-staff/${confirmId}`,
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
        await fetchDeclarations();
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
        `${import.meta.env.VITE_API_URL}/api/residence-declaration/reject-by-staff/${rejectId}`,
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
        toast.success("🚫 Đã từ chối hồ sơ");

        await fetchDeclarations();

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

  const filteredDeclarations = useMemo(() => {
    return declarations.filter((r) => {
      const fullText = `${r.fullName} ${r.apartmentId?.apartmentCode || ""} ${r.type} ${r.gender} ${r.nationality} ${r.idNumber}`.toLowerCase();
      const matchText = fullText.includes(filterText.toLowerCase());

      const dobMatch = dobFilter
        ? new Date(r.dateOfBirth).toISOString().split("T")[0] === dobFilter
        : true;

      const statusMatch =
        statusFilter === "all" ? true : String(r.verifiedByStaff) === statusFilter;

      return matchText && dobMatch && statusMatch;
    });
  }, [declarations, filterText, dobFilter, statusFilter]);

  const totalPages = Math.ceil(filteredDeclarations.length / itemsPerPage);

  const paginatedDeclarations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDeclarations.slice(start, start + itemsPerPage);
  }, [filteredDeclarations, currentPage]);

  return (
    <div className="bg-light min-vh-100 d-flex">
      <StaffNavbar />

      <main className="flex-grow-1 p-4">
        <h2 className="fw-bold mb-4 text-center text-primary">
          Danh sách hồ sơ tạm trú / tạm vắng chờ xác minh
        </h2>

        {/* Bộ lọc */}
        <div className="row g-2 align-items-end mb-4">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm..."
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
        ) : declarations.length === 0 ? (
          <p className="text-center">Không có hồ sơ cần xác minh.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle bg-white rounded-4 shadow">
              <thead className="table-primary">
                <tr>
                  <th>Loại</th>
                  <th>Họ tên</th>
                  <th>Căn hộ</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>CCCD</th>
                  <th>Thời gian</th>
                  <th>Ảnh giấy tờ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDeclarations.map((r) => (
                  <tr key={r._id}>
                    <td>{r.type}</td>
                    <td>{r.fullName}</td>
                    <td>{r.apartmentId?.apartmentCode || "---"}</td>
                    <td>{r.gender}</td>
                    <td>
                      {r.dateOfBirth
                        ? new Date(r.dateOfBirth).toLocaleDateString("vi-VN")
                        : ""}
                    </td>
                    <td>{r.idNumber}</td>
                    <td>
                      {r.startDate
                        ? new Date(r.startDate).toLocaleDateString("vi-VN")
                        : "---"}{" "}
                      →{" "}
                      {r.endDate
                        ? new Date(r.endDate).toLocaleDateString("vi-VN")
                        : "---"}
                    </td>
                    <td>
      {r.documentImage ? (
        <>
          <img
            src={r.documentImage}
            alt="Giấy tạm trú / tạm vắng"
            style={{
              width: 60,
              height: 40,
              objectFit: "cover",
              cursor: "pointer",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
            onClick={() => handleOpenImage(r.documentImage)}
          />

          {/* Modal xem ảnh */}
          <Modal show={showModal} onHide={handleClose} centered size="lg">
            <Modal.Body className="text-center">
              <img
                src={selectedImage}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            </Modal.Body>
          </Modal>
        </>
      ) : (
        "---"
      )}
    </td>
                   {/* Cột hành động */}
                   <td>
  {r.verifiedByStaff === "pending" && (
    <>
      <button
        className="btn btn-success mb-2"
        onClick={() => setConfirmId(r._id)}
      >
        Xác minh
      </button>
      <button
        className="btn btn-danger mb-2"
        onClick={() => setRejectId(r._id)}
      >
        Từ chối
      </button>
    </>
  )}

  {r.verifiedByStaff === "true" && !r.isExpired && (
    <span className="text-success fw-bold">Đã xác minh</span>
  )}

  {r.isExpired && (
    <span className="text-secondary fw-bold">Đã hết hạn</span>
  )}

  {(r.verifiedByStaff === "true" || r.verifiedByStaff === "expired") &&
    r.showNotifyButton && (
      <button
        className="btn btn-warning d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm mt-2"
        onClick={() => handleNotifyUser(r._id)}
        style={{
          fontWeight: 500,
          fontSize: "0.9rem",
          transition: "all 0.2s ease",
          backgroundColor: "#ffc107",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#ffca2c";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#ffc107";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <FiBell size={16} />
        Báo cho người dùng
      </button>
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
<ReusableModal
  show={!!confirmId}
  title="Xác minh hồ sơ"
  onClose={() => setConfirmId(null)}
  body={<p>Bạn có chắc chắn muốn xác minh hồ sơ này?</p>}
  footerButtons={[
    {
      label: "Xác minh",
      variant: "success",
      onClick: async () => {
        setLoading(true);
        await handleVerify(confirmId); // resident hoặc residentDeclaration
        setLoading(false);
        setConfirmId(null);
      },
    },
    {
      label: "Huỷ",
      variant: "secondary",
      onClick: () => setConfirmId(null),
    },
  ]}
/>

{/* Modal từ chối */}
<ReusableModal
  show={!!rejectId}
  title="Lý do từ chối"
  onClose={() => {
    setRejectId(null);
    setRejectReason("");
  }}
  body={
    <textarea
      rows={4}
      className="form-control"
      placeholder="Nhập lý do từ chối..."
      value={rejectReason}
      onChange={(e) => setRejectReason(e.target.value)}
    />
  }
  footerButtons={[
    {
      label: "Gửi từ chối",
      variant: "danger",
      onClick: async () => {
        if (!rejectReason.trim()) {
          toast.error("❌ Vui lòng nhập lý do từ chối");
          return;
        }
        setLoading(true);
        await handleReject(rejectId, rejectReason); // resident hoặc residentDeclaration
        setLoading(false);
        setRejectId(null);
        setRejectReason("");
      },
    },
    {
      label: "Huỷ",
      variant: "secondary",
      onClick: () => {
        setRejectId(null);
        setRejectReason("");
      },
    },
  ]}
/>

{/* Loading */}
{loading && <LoadingModal />}

        {/* Pagination */}
        <div className="d-flex justify-content-center mt-4 gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`btn ${
                currentPage === index + 1 ? "btn-primary" : "btn-outline-primary"
              }`}
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

export default ResidenceDeclarationVerifyList;
