import axios from "axios";
import React, { useEffect, useState } from "react";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./adminDashboard.jsx";

const PAGE_SIZE = 10;

const ManageApplicationForm = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("Chờ duyệt");
    const [selectedApp, setSelectedApp] = useState(null);
    const [sortOrder, setSortOrder] = useState("newest");
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    
    useEffect(() => {
        if (selectedApp) {
            console.log("Ảnh hợp đồng:", selectedApp.documentImage);
        }
      }, [selectedApp]);
      
    const handleEdit = (app) => {
      setSelectedApp(app);
      setShowEditModal(true);
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedApp(prev => ({
          ...prev,
          newImageFile: file // lưu file tạm thời
        }));
      };
    const updateSelectedApp = (e) => {
        setSelectedApp
        (prev => ({
          ...prev,
          [e.target.name]: e.target.value,
        }));
      };
      
      const handleEditSubmit = async () => {
        try {
          const formData = new FormData();
      
          // Thêm các trường văn bản (text fields)
          for (const key in selectedApp) {
            if (key !== 'documentImage' && key !== 'newImageFile') {
              formData.append(key, selectedApp[key]);
            }
          }
      
          // Nếu có ảnh mới được chọn
          if (selectedApp.newImageFile) {
            formData.append("documentImage", selectedApp.newImageFile);
          }
      
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/resident-verifications/${selectedApp._id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
      
          toast.success("Cập nhật thành công!");
          fetchApplications();
          setShowEditModal(false);
        } catch (err) {
          const msg = err?.response?.data?.message || "Cập nhật thất bại!";
          toast.error(msg);
        }
      };
      

      const handleCancel = async (id) => {
        confirmAlert({
          title: "Xác nhận huỷ đơn",
          message: "Bạn có chắc muốn huỷ đơn đã duyệt này không?",
          buttons: [
            {
              label: "Có",
              onClick: async () => {
                try {
                  await axios.patch(`${import.meta.env.VITE_API_URL}/api/resident-verifications/${id}/cancel`);
                  await fetchApplications(); // không nên toast trong đây
                  toast.success("Đã huỷ đơn và gỡ hợp đồng khỏi căn hộ!");
                } catch (err) {
                  const msg = err?.response?.data?.error || "Huỷ đơn thất bại!";
                  toast.error(msg);
                }
              },
            },
            {
              label: "Không",
            },
          ],
        });
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
    const handleApprove = async (id) => {
        if (window.confirm("Xác nhận duyệt đơn này?")) {
            try {
                await axios.patch(`${import.meta.env.VITE_API_URL}/api/resident-verifications/${id}/approve`);
                fetchApplications();
                toast.success("Đã duyệt đơn thành công!");
            } catch (err) {
                const msg = err?.response?.data?.error || "Duyệt đơn thất bại!";
                toast.error(msg);
            }
        }
    };

    const handleReject = async (id) => {
      let reasonInput = "";
    
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className="custom-ui p-3 border rounded" style={{ backgroundColor: "#fff", maxWidth: 450 }}>
              <h5 className="mb-3">Xác nhận từ chối đơn</h5>
              <div className="mb-3">
                <label>Lý do từ chối:</label>
                <textarea
                  className="form-control"
                  rows={3}
                  onChange={(e) => {
                    reasonInput = e.target.value;
                  }}
                  placeholder="Vui lòng nhập lý do từ chối..."
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    try {
                      await axios.patch(
                        `${import.meta.env.VITE_API_URL}/api/resident-verifications/${id}/reject`,
                        { reason: reasonInput },
                        {
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      );
                      await fetchApplications();
                      toast.success("Đã từ chối đơn!");
                    } catch (err) {
                      const msg = err?.response?.data?.error || "Từ chối đơn thất bại!";
                      toast.error(msg);
                    }
                    onClose();
                  }}
                >
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          );
        },
      });
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
    const totalPages = Math.ceil(filteredApps.length / PAGE_SIZE) || 1;
    const pagedApps = filteredApps.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

                        <select
                            className="form-select w-auto"
                            style={{ maxWidth: 180 }}
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="Chờ duyệt">Chờ duyệt</option>
                            <option value="Đã duyệt">Đã duyệt</option>
                            <option value="Đã từ chối">Đã từ chối</option>
                        </select>
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
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted py-4">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : pagedApps.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted py-4">
                                            Không có đơn đăng ký nào.
                                        </td>
                                    </tr>
                                ) : (
                                    pagedApps.map((app, idx) => (
                                        <tr key={app._id}>
                                            <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                            <td>{app.fullName}</td>
                                            <td>{app.email}</td>
                                            <td>{app.phone}</td>
                                            <td>{app.apartmentCode}</td>
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
                                            <td>
                                            <div className="d-flex gap-2 flex-wrap">
  <button
    className="btn btn-sm btn-outline-info"
    onClick={() => handleView(app)}
  >
    Xem
  </button>
  <button
    className="btn btn-sm btn-success"
    onClick={() => handleApprove(app._id)}
    disabled={app.status === "Đã duyệt"}
  >
    Duyệt
  </button>
  {app.status === "Đã duyệt" ? (
    <button
      className="btn btn-sm btn-warning"
      onClick={() => handleCancel(app._id)}
    >
      Huỷ
    </button>
  ) : (
    <button
      className="btn btn-sm btn-danger"
      onClick={() => handleReject(app._id)}
      disabled={app.status === "Đã từ chối"}
    >
      Từ chối
    </button>
  )}
  <button
    className="btn btn-sm btn-secondary"
    onClick={() => handleEdit(app)}
  >
    Sửa
  </button>
</div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-center align-items-center mt-4">
                    <button
                        className="btn btn-outline-secondary me-2"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                    >
                        &lt; Prev
                    </button>
                    <span style={{ minWidth: 90, textAlign: "center" }}>
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        className="btn btn-outline-secondary ms-2"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Next &gt;
                    </button>
                </div>

                {/* Modal xem chi tiết đơn */}
                {showModal && selectedApp && (
                    <div
                        className="modal fade show"
                        style={{ display: "block", background: "rgba(0,0,0,0.3)" }}
                        tabIndex="-1"
                    >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Chi tiết đơn đăng ký</h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <span>×</span>
                                    </button>
                                </div>
                                <div className="modal-body">
  {/* Thông tin hợp đồng */}
  <div className="mb-4">
    <h5 className="fw-bold mb-3 text-primary">📄 Thông tin hợp đồng</h5>
    <ul className="list-group list-group-flush">
      <li className="list-group-item"><strong>Loại giấy tờ:</strong> {selectedApp.documentType}</li>
      <li className="list-group-item"><strong>Thời hạn:</strong> {selectedApp.contractStart ? new Date(selectedApp.contractStart).toLocaleDateString() : "-"} - {selectedApp.contractEnd ? new Date(selectedApp.contractEnd).toLocaleDateString() : "-"}</li>
      <li className="list-group-item">
  <strong>Trạng thái:</strong>{" "}
  <span
    className={`badge px-2 py-1 rounded-pill ${
      selectedApp.status === "Chờ duyệt"
        ? "bg-warning text-dark"
        : selectedApp.status === "Đã từ chối"
        ? "bg-danger"
        : selectedApp.status === "Đã duyệt"
        ? "bg-success"
        : "bg-secondary"
    }`}
  >
    {selectedApp.status}
  </span>
</li>
      <li className="list-group-item"><strong>Ngày tạo đơn:</strong> {new Date(selectedApp.createdAt).toLocaleString()}</li>
    </ul>

    {documentImages.length > 0 && (
  <div className="mt-3">
    <label className="fw-semibold mb-2 d-block">Ảnh hợp đồng:</label>
    <div className="d-flex flex-wrap gap-3">
      {documentImages.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Hợp đồng ${idx + 1}`}
          className="rounded shadow-sm"
          style={{ maxHeight: 200, maxWidth: 300, objectFit: "cover" }}
        />
      ))}
    </div>
  </div>
)}
  </div>

  <hr />

  {/* Người thuê */}
  <div className="mb-4">
    <h5 className="fw-bold mb-3 text-primary">👤 Người thuê</h5>
    <ul className="list-group list-group-flush">
      <li className="list-group-item"><strong>Họ tên:</strong> {selectedApp.resident?.name || selectedApp.fullName}</li>
      <li className="list-group-item"><strong>Email:</strong> {selectedApp.resident?.email || selectedApp.email}</li>
      <li className="list-group-item"><strong>SĐT:</strong> {selectedApp.resident?.phone || selectedApp.phone}</li>
    </ul>
  </div>

  <hr />

  {/* Thông tin căn hộ */}
  <div className="mb-4">
    <h5 className="fw-bold mb-3 text-primary">🏢 Thông tin căn hộ</h5>
    <ul className="list-group list-group-flush">
      <li className="list-group-item"><strong>Mã căn hộ:</strong> {selectedApp.apartment?.code || selectedApp.apartmentCode}</li>
      <li className="list-group-item"><strong>Tầng:</strong> {selectedApp.apartment?.floor}</li>
      <li className="list-group-item"><strong>Diện tích:</strong> {selectedApp.apartment?.area} m²</li>
      <li className="list-group-item"><strong>Nội thất:</strong> {selectedApp.apartment?.furniture}</li>
      <li className="list-group-item"><strong>Hướng:</strong> {selectedApp.apartment?.direction}</li>
      <li className="list-group-item"><strong>Trạng thái:</strong> {selectedApp.apartment?.status}</li>
    </ul>
  </div>

  {/* Các tháng chưa thanh toán */}
  {selectedApp.unpaidFees && selectedApp.unpaidFees.length > 0 && (
    <div className="mb-3">
      <h5 className="fw-bold mb-3 text-danger">📅 Các tháng chưa thanh toán</h5>
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped align-middle">
          <thead className="table-secondary text-center">
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
                <td className="text-center">{fee.month}</td>
                <td className="text-end">{fee.managementFee.toLocaleString()}đ</td>
                <td className="text-end">{fee.waterFee.toLocaleString()}đ</td>
                <td className="text-end">{fee.parkingFee.toLocaleString()}đ</td>
                <td className="text-end fw-bold">{fee.total.toLocaleString()}đ</td>
                <td className="text-center text-danger fw-semibold">{fee.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}
</div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
{showEditModal && selectedApp && (
  <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.3)" }}>
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Chỉnh sửa đơn xác nhận</h5>
          <button type="button" className="close" onClick={() => setShowEditModal(false)}>
            <span>×</span>
          </button>
        </div>
        <div className="modal-body row g-3">
          {/* Các trường cơ bản */}
          <div className="col-md-6">
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
          </div>

          {/* Loại giấy tờ */}
          <div className="col-md-6">
            <label>Loại giấy tờ</label>
            <select className="form-control" name="documentType" value={selectedApp.documentType || ""} onChange={updateSelectedApp}>
              <option value="Hợp đồng mua bán">Hợp đồng mua bán</option>
              <option value="Hợp đồng cho thuê">Hợp đồng cho thuê</option>
              {/* <option value="Giấy chủ quyền">Giấy chủ quyền</option> */}
            </select>
          </div>

          {/* <div className="col-md-6">
            <label>Trạng thái</label>
            <select className="form-control" name="status" value={selectedApp.status || ""} onChange={updateSelectedApp}>
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Đã từ chối">Đã từ chối</option>
            </select>
          </div> */}

          {/* Hiện thêm ngày và ảnh nếu là HĐ thuê */}
          {(selectedApp.documentType === "Hợp đồng cho thuê") && (
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
          )}

          {/* Nếu là HĐ thuê hoặc HĐ mua bán thì cho upload ảnh */}
          {(selectedApp.documentType === "Hợp đồng cho thuê" || selectedApp.documentType === "Hợp đồng mua bán") && (
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
          )}

          <div className="col-12">
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
)}


            </div>
            {/* <ToastContainer /> */}
        </AdminDashboard>
    );  
};

export default ManageApplicationForm;