import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../../../components/Pagination.jsx";
import ReusableModal from "../../../components/ReusableModal.jsx";
import StatusFilter from "../../../components/admin/statusFilter.jsx";
import LoadingModal from "../../../components/loadingModal.jsx";
import { formatDate, formatPhoneNumber, formatPrice } from "../../../utils/format.jsx";
import AdminDashboard from "./adminDashboard.jsx";

const ManageApplicationForm = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialPageSize = Number(searchParams.get("pageSize")) || 10;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Chờ duyệt");
  const [selectedApp, setSelectedApp] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  // const [showEditModal, setShowEditModal] = useState(false);

  // Confirmation modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const updateQuery = (newParams = {}) => {
    const updated = {
      ...Object.fromEntries(searchParams.entries()),
      ...newParams,
    };
    Object.keys(updated).forEach(
      (key) => (updated[key] === "" || updated[key] == null) && delete updated[key]
    );
    setSearchParams(updated);
  };

  useEffect(() => {
    if (selectedApp) {
      console.log("Ảnh hợp đồng:", selectedApp.documentImage);
    }
  }, [selectedApp]);

  // const handleEdit = (app) => {
  //   setSelectedApp(app);
  //   setShowEditModal(true);
  // };
  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   setSelectedApp(prev => ({
  //     ...prev,
  //     newImageFile: file // lưu file tạm thời
  //   }));
  // };
  // const updateSelectedApp = (e) => {
  //   setSelectedApp
  //     (prev => ({
  //       ...prev,
  //       [e.target.name]: e.target.value,
  //     }));
  // };

  // const handleEditSubmit = async () => {
  //   try {
  //     const formData = new FormData();

  //     // Thêm các trường văn bản (text fields)
  //     for (const key in selectedApp) {
  //       if (key !== 'documentImage' && key !== 'newImageFile') {
  //         formData.append(key, selectedApp[key]);
  //       }
  //     }

  //     // Nếu có ảnh mới được chọn
  //     if (selectedApp.newImageFile) {
  //       formData.append("documentImage", selectedApp.newImageFile);
  //     }

  //     await axios.put(
  //       `${import.meta.env.VITE_API_URL}/api/resident-verifications/${selectedApp._id}`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     toast.success("Cập nhật thành công!");
  //     fetchApplications();
  //     setShowEditModal(false);
  //   } catch (err) {
  //     const msg = err?.response?.data?.message || "Cập nhật thất bại!";
  //     toast.error(msg);
  //   }
  // };

  const handleCancel = (id) => {
    setSelectedId(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/resident-verifications/${selectedId}/cancel`);
      await fetchApplications();
      toast.success("Đã huỷ đơn và gỡ hợp đồng khỏi căn hộ!");
      setShowCancelModal(false);
    } catch (err) {
      const msg = err?.response?.data?.error || "Huỷ đơn thất bại!";
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/resident-verifications`);
      setApplications(res.data);
    } catch (err) {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (app) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/resident-verifications/${app._id}`
      );

      // Lưu toàn bộ dữ liệu vào state (bao gồm unpaidFees)
      setSelectedApp(res.data.data);

      // Mở modal hiển thị
      setShowModal(true);
    } catch (err) {
      toast.error("Không thể tải chi tiết đơn.");
      console.error(err);
    }
  };

  const handleApprove = (id) => {
    setSelectedId(id);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/resident-verifications/${selectedId}/approve`);
      fetchApplications();
      toast.success("✅ Đã duyệt đơn thành công!");
      setShowApproveModal(false);
    } catch (err) {
      const msg = err?.response?.data?.error || "❌ Duyệt đơn thất bại!";
      toast.error(msg);
    }
  };

  const handleReject = (id) => {
    setSelectedId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/resident-verifications/${selectedId}/reject`,
        { reason: rejectReason },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      await fetchApplications();
      toast.success("Đã từ chối đơn!");
      setShowRejectModal(false);
    } catch (err) {
      const msg = err?.response?.data?.error || "Từ chối đơn thất bại!";
      toast.error(msg);
    }
  };

  // Filter logic
  const filteredApps = applications
    .filter(app =>
      (searchTerm.trim() === "" ||
        (app.fullName && app.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.email && app.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.phone && app.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.apartmentCode && app.apartmentCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.documentType && app.documentType.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterStatus === "" || String(app.status) === filterStatus)
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });



  // Pagination logic
  const totalPages = Math.ceil(filteredApps.length / pageSize) || 1;
  const pagedApps = filteredApps.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1); // Reset page khi filter/search thay đổi
  }, [searchTerm, filterStatus]);

  const documentImages = Array.isArray(selectedApp?.documentImage)
    ? selectedApp.documentImage
    : typeof selectedApp?.documentImage === "string"
      ? JSON.parse(selectedApp.documentImage)
      : [];

  return (
    <AdminDashboard>
      <div className="w-100">
        {loading && <LoadingModal />}

        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <h2 className="fw-bold mb-0">Quản lý đơn xác nhận cư dân</h2>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm theo tên hoặc căn hộ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 220 }}
            />
            <select
              className="form-select w-auto"
              style={{ maxWidth: 180 }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>

            <StatusFilter
              value={filterStatus}
              onChange={setFilterStatus}
              type="form"
            />
          </div>
        </div>
        <div className="card w-100">
          <div className="card-body p-0">
            <table className="table table-hover mb-0" style={{ width: "100%" }}>
              <thead className="thead-light">
                <tr>
                  <th>STT</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Căn hộ</th>
                  <th>Loại giấy tờ</th>
                  <th>Trạng thái</th>
                  <th>Ngày gửi</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : pagedApps.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      Không có đơn đăng ký nào.
                    </td>
                  </tr>
                ) : (
                  pagedApps.map((app, idx) => (
                    <tr key={app._id}>
                      <td>{(page - 1) * pageSize + idx + 1}</td>
                      <td>
                        {app.user && app.user._id ? (
                          <Link to={`/admin-dashboard/manage-user/${app.user._id}`}>{app.fullName}</Link>
                        ) : (
                          app.fullName
                        )}
                      </td>
                      <td>{app.email}</td>
                      <td>{formatPhoneNumber(app.phone)}</td>
                      <td>{app.apartmentCode || app.apartment?.code || ""}</td>
                      <td>{app.documentType}</td>
                      <td>
                        <span className={
                          app.status === "Đã duyệt"
                            ? "badge bg-success"
                            : app.status === "Đã từ chối"
                              ? "badge bg-danger"
                              : "badge bg-warning text-dark"
                        }>
                          {app.status}
                        </span>
                      </td>
                      <td>{formatDate(app.createdAt)}</td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleView(app)}
                          >
                            Xem
                          </button>
                          {/* <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(app)}
                          >
                            Sửa
                          </button> */}
                          {app.status === "Chờ duyệt" && (
                            <>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleApprove(app._id)}
                                disabled={app.status === "Đang chỉnh sửa"}
                              >
                                Duyệt
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleReject(app._id)}
                                disabled={app.status === "Đang chỉnh sửa"}
                              >
                                Từ chối
                              </button>

                              {app.status === "Đang chỉnh sửa" && (
                                <div className="alert alert-warning py-1 px-2 mt-2 mb-0">
                                  ⚠ Nhân viên đang chỉnh sửa — bạn không thể duyệt/hủy lúc này
                                </div>
                              )}
                            </>

                          )}
                          {app.status === "Đã duyệt" && (
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => handleCancel(app._id)}
                            >
                              Huỷ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            setPage(p);
            updateQuery({ page: p });
          }}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
            updateQuery({ pageSize: s, page: 1 });
          }}
        />

        {/* Modal xem chi tiết đơn */}
        {showModal && selectedApp && (
  <ReusableModal
    show={showModal}
    onClose={() => setShowModal(false)}
    title="📑 Chi tiết đơn đăng ký"
    size="xl"  // hoặc 'lg' nếu muốn vừa
    fullscreen  // chiếm toàn màn hình, đẹp như form
    body={
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        
        {/* Thông tin hợp đồng */}
        <div className="card border-0 shadow-sm mb-4 rounded-3">
          <div className="card-header bg-primary text-white fw-bold rounded-top-3">
            📄 Thông tin hợp đồng
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <strong>Loại giấy tờ:</strong> {selectedApp.documentType}
            </li>
            <li className="list-group-item">
              <strong>Thời hạn:</strong> {formatDate(selectedApp.contractStart)} - {formatDate(selectedApp.contractEnd)}
            </li>
            <li className="list-group-item">
              <strong>Ngày gửi:</strong> {formatDate(selectedApp.createdAt)}
            </li>
            <li className="list-group-item">
              <strong>Trạng thái:</strong>{" "}
              <span
                className={`badge px-3 py-2 rounded-pill shadow-sm ${
                  selectedApp.status === "Chờ duyệt"
                    ? "bg-warning text-dark"
                    : selectedApp.status === "Đã từ chối"
                    ? "bg-danger"
                    : selectedApp.status === "Đã duyệt"
                    ? "bg-success"
                    : selectedApp.status === "Đã hủy bỏ"
                    ? "bg-secondary"
                    : "bg-light text-dark"
                }`}
              >
                {selectedApp.status}
              </span>
            </li>
          </ul>

          {documentImages.length > 0 && (
            <div className="p-3">
              <label className="fw-semibold mb-2 d-block">Ảnh hợp đồng:</label>
              <div className="d-flex flex-wrap gap-3">
                {documentImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Hợp đồng ${idx + 1}`}
                    className="rounded shadow-sm border"
                    style={{
                      maxHeight: 200,
                      maxWidth: 300,
                      objectFit: "cover",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Người thuê */}
        <div className="card border-0 shadow-sm mb-4 rounded-3">
          <div className="card-header bg-info text-white fw-bold rounded-top-3">
            👤 Người thuê
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <strong>Họ tên:</strong>{" "}
              {selectedApp.user && selectedApp.user._id ? (
                <Link
                  to={`/admin-dashboard/manage-user/${selectedApp.user._id}`}
                  className="text-decoration-none fw-semibold"
                >
                  {selectedApp.fullName}
                </Link>
              ) : (
                selectedApp.fullName
              )}
            </li>
            <li className="list-group-item">
              <strong>Email:</strong> {selectedApp.resident?.email || selectedApp.email}
            </li>
            <li className="list-group-item">
              <strong>SĐT:</strong>{" "}
              {formatPhoneNumber(selectedApp.resident?.phone || selectedApp.phone)}
            </li>
          </ul>
        </div>

        {/* Thông tin căn hộ */}
        <div className="card border-0 shadow-sm mb-4 rounded-3">
          <div className="card-header bg-secondary text-white fw-bold rounded-top-3">
            🏢 Thông tin căn hộ
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item"><strong>Mã căn hộ:</strong> {selectedApp.apartmentCode || selectedApp.apartment?.code || ""}</li>
            <li className="list-group-item"><strong>Tầng:</strong> {selectedApp.apartment?.floor}</li>
            <li className="list-group-item"><strong>Diện tích:</strong> {selectedApp.apartment?.area} m²</li>
            <li className="list-group-item"><strong>Nội thất:</strong> {selectedApp.apartment?.furniture}</li>
            <li className="list-group-item"><strong>Hướng:</strong> {selectedApp.apartment?.direction}</li>
            <li className="list-group-item"><strong>Trạng thái:</strong> {selectedApp.apartment?.status}</li>
          </ul>
        </div>

        {/* Các tháng chưa thanh toán */}
        {selectedApp.unpaidFees && selectedApp.unpaidFees.length > 0 && (
          <div className="card border-0 shadow-sm mb-3 rounded-3">
            <div className="card-header bg-danger text-white fw-bold rounded-top-3">
              📅 Các tháng chưa thanh toán
            </div>
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle mb-0">
                <thead className="table-light text-center">
                  <tr>
                    <th>Tháng</th>
                    <th>Phí quản lý</th>
                    <th>Phí nước</th>
                    <th>Phí giữ xe</th>
                    <th>Tổng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedApp.unpaidFees.map((fee, index) => (
                    <tr key={index}>
                      <td className="text-center fw-semibold">{fee.month}</td>
                      <td className="text-end">{formatPrice(fee.managementFee)}</td>
                      <td className="text-end">{formatPrice(fee.waterFee)}</td>
                      <td className="text-end">{formatPrice(fee.parkingFee)}</td>
                      <td className="text-end fw-bold text-primary">{formatPrice(fee.total)}</td>
                      <td className="text-center text-danger fw-semibold">{fee.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    }
    footerButtons={[
      {
        label: "Đóng",
        variant: "secondary",
        onClick: () => setShowModal(false),
      },
    ]}
  />
)}


        {/* {showEditModal && selectedApp && (
          <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.3)" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content position-relative">
                <button
                  type="button"
                  className="btn-close position-absolute"
                  aria-label="Close"
                  style={{ top: "1rem", right: "1rem" }}
                  onClick={() => setShowEditModal(false)}
                ></button>
                <div className="modal-header">
                  <h5 className="modal-title">Chỉnh sửa đơn xác nhận</h5>
                </div>
                <div className="modal-body row g-3">
                  {/* Các trường cơ bản */}
        {/* <div className="col-md-6">
                    <label>Họ tên</label>
                    <input className="form-control" name="fullName" value={selectedApp.fullName || ""} onChange={updateSelectedApp} />
                  </div>
                  <div className="col-md-6">
                    <label>Email</label>
                    <input className="form-control" name="email" value={selectedApp.email || ""} onChange={updateSelectedApp} />
                  </div>
                  <div className="col-md-6">
                    <label>Điện thoại</label>
                    <input className="form-control" name="phone" value={selectedApp.phone || ""} onChange={updateSelectedApp} />
                  </div>
                  <div className="col-md-6">
                    <label>Mã căn hộ</label>
                    <input className="form-control" name="apartmentCode" value={selectedApp.apartmentCode || ""} onChange={updateSelectedApp} />
                  </div> */}

        {/* Loại giấy tờ */}
        {/* <div className="col-md-6">
                    <label>Loại giấy tờ</label>
                    <select className="form-control" name="documentType" value={selectedApp.documentType || ""} onChange={updateSelectedApp}>
                      <option value="Hợp đồng mua bán">Hợp đồng mua bán</option>
                      <option value="Hợp đồng cho thuê">Hợp đồng cho thuê</option>
                      {/* <option value="Giấy chủ quyền">Giấy chủ quyền</option> */}
        {/* </select>
                  </div> */}

        {/* <div className="col-md-6">
            <label>Trạng thái</label>
            <select className="form-control" name="status" value={selectedApp.status || ""} onChange={updateSelectedApp}>
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Đã từ chối">Đã từ chối</option>
            </select>
          </div> */}

        {/* Hiện thêm ngày và ảnh nếu là HĐ thuê */}
        {/* {(selectedApp.documentType === "Hợp đồng cho thuê") && (
                    <>
                      <div className="col-md-6">
                        <label>Ngày bắt đầu</label>
                        <input type="date" className="form-control" name="contractStart" value={selectedApp.contractStart?.slice(0, 10) || ""} onChange={updateSelectedApp} />
                      </div>
                      <div className="col-md-6">
                        <label>Ngày kết thúc</label>
                        <input type="date" className="form-control" name="contractEnd" value={selectedApp.contractEnd?.slice(0, 10) || ""} onChange={updateSelectedApp} />
                      </div>
                    </>
                  )} */}

        {/* Nếu là HĐ thuê hoặc HĐ mua bán thì cho upload ảnh */}
        {/* {(selectedApp.documentType === "Hợp đồng cho thuê" || selectedApp.documentType === "Hợp đồng mua bán") && (
                    <div className="col-md-12">
                      <label>Ảnh hợp đồng hiện tại:</label><br />
                      {selectedApp.documentImage ? (
                        <img
                          src={selectedApp.documentImage}
                          alt="Ảnh hợp đồng"
                          style={{ maxWidth: "100%", maxHeight: "300px", marginBottom: "10px" }}
                        />
                      ) : (
                        <p><i>Không có ảnh</i></p>
                      )}

                      <label>Chọn ảnh mới (nếu muốn thay đổi):</label>
                      <input
                        type="file"
                        className="form-control"
                        name="documentImage"
                        onChange={handleFileChange}
                      />
                    </div>
                  )} */}

        {/* <div className="col-12">
                    <label>Ghi chú</label>
                    <textarea className="form-control" name="note" value={selectedApp.note || ""} onChange={updateSelectedApp} />
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Hủy</button>
                  <button className="btn btn-primary" onClick={handleEditSubmit}>Lưu</button>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Confirmation modals */}
        {showCancelModal && (
          <ReusableModal
            show={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            title="Xác nhận huỷ đơn"
            body={
              <p>Bạn có chắc muốn huỷ đơn đã duyệt này không?</p>
            }
            footerButtons={[
              {
                label: "Có",
                variant: "danger",
                onClick: confirmCancel,
              },
              {
                label: "Không",
                variant: "secondary",
                onClick: () => setShowCancelModal(false),
              },
            ]}
          />
        )}

        {showApproveModal && (
          <ReusableModal
            show={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            title="Xác nhận duyệt"
            body={
              <p>Bạn có chắc muốn duyệt đơn này?</p>
            }
            footerButtons={[
              {
                label: "Có",
                variant: "success",
                onClick: confirmApprove,
              },
              {
                label: "Không",
                variant: "secondary",
                onClick: () => setShowApproveModal(false),
              },
            ]}
          />
        )}

        {showRejectModal && (
          <ReusableModal
            show={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            title="Xác nhận từ chối đơn"
            body={
              <div className="mb-3">
                <label>Lý do từ chối:</label>
                <textarea
                  className="form-control"
                  rows={3}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Vui lòng nhập lý do từ chối..."
                />
              </div>
            }
            footerButtons={[
              {
                label: "Hủy",
                variant: "secondary",
                onClick: () => setShowRejectModal(false),
              },
              {
                label: "Xác nhận từ chối",
                variant: "danger",
                onClick: confirmReject,
              },
            ]}
          />
        )}

      </div>
      {/* <ToastContainer /> */}
    </AdminDashboard>
  );
};

export default ManageApplicationForm;