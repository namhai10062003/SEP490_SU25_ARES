import axios from "axios";
import React, { useEffect, useState } from "react";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Đảm bảo đã import CSS
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ApartmentFormModal from "../../../components/ApartmentFormModal.jsx"; // Assuming similar structure
import Pagination from "../../../components/Pagination.jsx"; // Assuming similar structure
import AdminDashboard from "./adminDashboard.jsx"; // Assuming similar structure

const ManageApartment = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [apartmentHistory, setApartmentHistory] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("active"); // all | active | deleted
  const [pageSize, setPageSize] = useState(10);
  const [form, setForm] = useState({
    _id: "",
    apartmentCode: "",
    floor: "",
    area: "",
    status: "",
    ownerName: "",
    ownerPhone: "",
    bedrooms: "",
    furniture: "",
    direction: "",
    building: "",
    legalDocuments: "",
  });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchApartments();
  }, [page, pageSize, statusFilter]);

  const fetchApartments = async () => {
    try {
      setLoading(true);

      const includeDeleted = statusFilter === "deleted" || statusFilter === "all";
      const statusParam = statusFilter === "active" ? "active" : ""; // Không truyền khi là all/deleted

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/apartments?page=${page}&pageSize=${pageSize}&includeDeleted=${includeDeleted}&status=${statusParam}`
      );

      let fetched = res?.data?.data || [];

      // Lọc thêm nếu là "deleted"
      if (statusFilter === "deleted") {
        fetched = fetched.filter((apt) => !!apt.deletedAt);
      } else if (statusFilter === "active") {
        fetched = fetched.filter((apt) => !apt.deletedAt);
      }

      setApartments(fetched);
      setTotalPages(res.data.totalPages); // nếu cần, bạn có thể tính lại totalPages theo length mới
    } catch (err) {
      console.error("Lỗi khi lấy danh sách căn hộ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = (id) => {
    console.log("Block apartment with ID:", id);
  };

  const handleDelete = async (id) => {
    confirmAlert({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa căn hộ này?',
      buttons: [
        {
          label: 'Có',
          onClick: () => {
            toast.promise(
              axios.delete(`${import.meta.env.VITE_API_URL}/api/apartments/${id}`),
              {
                pending: "Đang xóa căn hộ...",
                success: "✅ Xóa căn hộ thành công!",
                error: "❌ Xóa căn hộ thất bại!",
              }
            ).then(() => {
              setApartments(apartments.filter(apt => apt._id !== id));
            }).catch(err => {
              console.error("Lỗi khi xóa căn hộ:", err);
            });
          }
        },
        {
          label: 'Không',
          onClick: () => { /* Không làm gì cả */ }
        }
      ]
    });
  };

  const handleEdit = (apt) => {
    setIsEdit(true);
    setForm({
      _id: apt._id,
      apartmentCode: apt.apartmentCode,
      floor: apt.floor.toString(),
      area: apt.area.toString(),
      status: apt.status,
      ownerName: apt.ownerName,
      ownerPhone: apt.ownerPhone,
      bedrooms: apt.bedrooms.toString(),
      furniture: apt.furniture,
      direction: apt.direction,
      building: apt.building,
      legalDocuments: apt.legalDocuments,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "apartmentCode",
      "floor",
      "area",
      "status",
      "bedrooms",
      "furniture",
      "direction",
      "building",
      "legalDocuments"
    ];

    const isMissing = requiredFields.some((field) => !form[field]);

    if (isMissing) {
      toast.error("❌ Vui lòng điền đầy đủ thông tin (trừ Chủ sở hữu và SĐT có thể bỏ trống)!");
      return;
    }

    const floor = parseInt(form.floor);
    const area = parseInt(form.area);
    const bedrooms = parseInt(form.bedrooms);
    if (isNaN(floor) || isNaN(area) || isNaN(bedrooms)) {
      toast.error("❌ Tầng, Diện tích, và Số phòng ngủ phải là số!");
      return;
    }

    const slug = form.apartmentCode.toLowerCase().replace(/ /g, "-");

    const payload = {
      apartmentCode: form.apartmentCode,
      slug,
      floor,
      area,
      status: form.status,
      ownerName: form.ownerName,
      ownerPhone: form.ownerPhone,
      bedrooms,
      furniture: form.furniture,
      direction: form.direction,
      building: form.building,
      legalDocuments: form.legalDocuments,
      // userId: isEdit ? form.userId : null,
    };

    try {
      const url = isEdit
        ? `${import.meta.env.VITE_API_URL}/api/apartments/${form._id}`
        : `${import.meta.env.VITE_API_URL}/api/apartments`;
      const method = isEdit ? "PUT" : "POST";

      const res = await axios({ method, url, data: payload });

      if (res.status === 200 || res.status === 201) {
        fetchApartments();
        setShowModal(false);
        setForm({
          _id: "",
          apartmentCode: "",
          floor: "",
          area: "",
          status: "",
          ownerName: "",
          ownerPhone: "",
          bedrooms: "",
          furniture: "",
          direction: "",
          building: "",
          legalDocuments: "",
          userId: null,
        });
        setIsEdit(false);
        toast.success(isEdit ? "✅ Cập nhật căn hộ thành công!" : "✅ Tạo căn hộ thành công!");
      }
    } catch (err) {
      console.error("Lỗi khi xử lý căn hộ:", err.response?.data || err.message);
      console.log("Chi tiết lỗi:", err.response?.data);
      toast.error(isEdit
        ? "❌ Cập nhật căn hộ thất bại!"
        : "❌ Tạo căn hộ thất bại! Vui lòng kiểm tra dữ liệu hoặc liên hệ admin.");
    }
  };

  const handleShowDetails = async (id) => {
    try {
      // 1. Lấy chi tiết căn hộ
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/apartments/${id}`);
      const apartment = res.data;

      setSelectedApartment(apartment);

      // 2. Lấy lịch sử sử dụng căn hộ theo apartmentCode
      if (apartment.apartmentCode) {
        const historyRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/apartments/history/${apartment.apartmentCode}`
        );
        setApartmentHistory(historyRes.data);
      } else {
        setApartmentHistory([]); // fallback nếu không có mã căn hộ
      }

      // 3. Mở modal
      setShowDetailModal(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết căn hộ hoặc lịch sử:", err);
      toast.error("❌ Không thể lấy chi tiết căn hộ hoặc lịch sử");
    }
  };


  const filteredApartments = (apartments || []).filter((apt) => {
    const term = searchTerm.toLowerCase();

    return (
      apt.apartmentCode?.toLowerCase().includes(term) ||
      apt.ownerName?.toLowerCase().includes(term) ||
      apt.ownerPhone?.toLowerCase().includes(term) ||
      apt.building?.toLowerCase().includes(term) ||
      apt.furniture?.toLowerCase().includes(term) ||
      apt.direction?.toLowerCase().includes(term) ||
      apt.area?.toString().includes(term)
    );
  });

  return (
    <AdminDashboard >
      <div className="w-100">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Quản lý Căn hộ</h2>
          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Tìm kiếm..."
              style={{ maxWidth: "200px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-select me-2"
              style={{ maxWidth: "100px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="deleted">Đã xóa</option>
            </select>

            <button
              className="btn btn-primary fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
              onClick={() => {
                setIsEdit(false);
                setForm({
                  _id: "",
                  apartmentCode: "",
                  floor: "",
                  area: "",
                  status: "",
                  ownerName: "",
                  ownerPhone: "",
                  bedrooms: "",
                  furniture: "",
                  direction: "",
                  building: "",
                  legalDocuments: "",
                });
                setShowModal(true);
              }}
            >
              <span className="fs-5">+</span>
              <span>Tạo Căn hộ</span>
            </button>
          </div>
        </div>
        <div className="card w-100">
          <div className="card-body p-0">
            <table className="table table-hover mb-0" style={{ width: "100%" }}>
              <thead className="thead-light">
                <tr>
                  <th>STT</th>
                  <th>Tên Căn hộ</th>
                  <th>Tầng</th>
                  <th>Diện tích (m²)</th>
                  <th>Trạng thái</th>
                  <th>Chủ sở hữu</th>
                  <th>SĐT chủ sở hữu</th>
                  <th>Người thuê</th>
                  <th>SĐT người thuê</th>
                  <th>Thao tác</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredApartments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      Không có căn hộ nào.
                    </td>
                  </tr>
                ) : (
                  filteredApartments.map((apt, index) => (
                    <tr key={apt._id}>
                      <td>{(page - 1) * pageSize + index + 1}</td>
                      <td>
                        <span
                          style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                          onClick={() => handleShowDetails(apt._id)}
                        >
                          {apt.apartmentCode || "Không rõ"}
                        </span>
                      </td>

                      <td>{apt.floor}</td>
                      <td>{apt.area || "-"}</td>
                      <td>{apt.status || "Chưa xác định"}</td>
                      <td>{apt.ownerName || "Chưa có"}</td>
                      <td>{apt.ownerPhone || "-"}</td>
                      <td>{apt.isOwner?.name || apt.isRenter?.name || "Chưa có"}</td>
                      <td>{apt.isOwner?.phone || apt.isRenter?.phone || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", whiteSpace: "nowrap" }}>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(apt)}
                            style={{ padding: "0.25rem 0.5rem" }}
                            disabled={!!apt.deletedAt}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(apt._id)}
                            style={{ padding: "0.25rem 0.5rem" }}
                            disabled={!!apt.deletedAt || apt.status === "đang ở" || apt.status === "đang cho thuê"}
                          >
                            Delete
                          </button>
                        </div>
                      </td>

                      <td>{apt.deletedAt ? "Đã xóa" : "Hoạt động"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/*  Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </div>
      {
        showModal && (
          <ApartmentFormModal
            show={showModal}
            onClose={() => setShowModal(false)}
            form={form}
            setForm={setForm}
            handleChange={handleChange}
            isEdit={isEdit}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )
      }

      {showDetailModal && selectedApartment && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content position-relative">
              {/* Floating close button: nằm ngoài header, góc phải trên */}
              <button
                type="button"
                className="btn btn-sm btn-light position-absolute"
                aria-label="Đóng"
                onClick={() => setShowDetailModal(false)}
                style={{
                  top: "0.6rem",
                  right: "0.6rem",
                  zIndex: 1051, // trên header
                  borderRadius: "0.35rem",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)"
                }}
              >
                <i className="bi bi-x-lg" />
              </button>

              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-building me-2" aria-hidden="true"></i>
                  Chi tiết Căn hộ:
                  <small className="ms-2 text-light opacity-75">{selectedApartment.apartmentCode}</small>
                </h5>
                {/* giữ header sạch, không chứa nút đóng */}
              </div>

              <div className="modal-body">
                <div className="row">
                  {/* Cột 1 */}
                  <div className="col-md-6 mb-3">
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item">
                        <i className="bi bi-bar-chart me-2"></i>
                        <strong>Tầng:</strong> {selectedApartment.floor ?? "—"}
                      </li>
                      <li className="list-group-item">
                        <i className="bi bi-aspect-ratio me-2"></i>
                        <strong>Diện tích:</strong> {selectedApartment.area ? `${selectedApartment.area} m²` : "—"}
                      </li>
                      <li className="list-group-item">
                        <i className="bi bi-door-closed me-2"></i>
                        <strong>Phòng ngủ:</strong> {selectedApartment.bedrooms ?? "—"}
                      </li>
                      <li className="list-group-item">
                        <i className="bi bi-lamp me-2"></i>
                        <strong>Nội thất:</strong> {selectedApartment.furniture || "—"}
                      </li>
                      <li className="list-group-item">
                        <i className="bi bi-compass me-2"></i>
                        <strong>Hướng:</strong> {selectedApartment.direction || "—"}
                      </li>
                      <li className="list-group-item">
                        <i className="bi bi-buildings me-2"></i>
                        <strong>Toà:</strong> {selectedApartment.building || "—"}
                      </li>
                    </ul>
                  </div>

                  {/* Cột 2 */}
                  <div className="col-md-6 mb-3">
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Trạng thái:</strong> {selectedApartment.status || "Chưa xác định"}
                      </li>
                      <li className="list-group-item">
                        <i className="bi bi-file-earmark-text me-2"></i>
                        <strong>Giấy tờ pháp lý:</strong> {selectedApartment.legalDocuments || "—"}
                      </li>
                      <li className="list-group-item">
                        <i className="bi bi-person-vcard me-2"></i>
                        <strong>Chủ sở hữu:</strong> {selectedApartment.ownerName || "Chưa có"}
                      </li>
                      <li className="list-group-item">
                        <i className="bi bi-telephone me-2"></i>
                        <strong>SĐT chủ:</strong> {selectedApartment.ownerPhone || "—"}
                      </li>
                      <li className="list-group-item">
                        <i className="bi bi-person-fill-check me-2"></i>
                        <strong>Người thuê:</strong>{" "}
                        {selectedApartment.isOwner?.name || selectedApartment.isRenter?.name || "Chưa có"}
                      </li>
                      <li className="list-group-item">
                        <i className="bi bi-telephone-inbound me-2"></i>
                        <strong>SĐT người thuê:</strong>{" "}
                        {selectedApartment.isOwner?.phone || selectedApartment.isRenter?.phone || "—"}
                      </li>
                    </ul>
                  </div>
                </div>

                <hr className="my-4" />

                <h5>
                  <i className="bi bi-clock-history me-2"></i>
                  Lịch sử sử dụng căn hộ
                </h5>

                {Array.isArray(apartmentHistory) && apartmentHistory.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover mt-2">
                      <thead className="table-light">
                        <tr>
                          <th>STT</th>
                          <th>Người sử dụng</th>
                          <th>SĐT</th>
                          <th>Loại giấy tờ</th>
                          <th>Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apartmentHistory.map((record, index) => (
                          <tr key={record._id || index}>
                            <td>{index + 1}</td>
                            <td>{record.fullName || "—"}</td>
                            <td>{record.phone || "—"}</td>
                            <td>{record.documentType || "—"}</td>
                            <td>
                              {record.contractStart
                                ? `${new Date(record.contractStart).toLocaleDateString()}${record.contractEnd ? ` - ${new Date(record.contractEnd).toLocaleDateString()}` : ""}`
                                : "Không rõ"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">Không có lịch sử sử dụng căn hộ.</p>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  <i className="bi bi-x-circle me-1"></i> Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </AdminDashboard>
  );
};

export default ManageApartment;