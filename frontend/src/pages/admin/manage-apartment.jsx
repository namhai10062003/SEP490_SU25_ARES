// src/pages/admin/manage/ManageApartment.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import AdminDashboard from "./adminDashboard.jsx";
import ApartmentFormModal from "../../../components/ApartmentFormModal.jsx";
import Pagination from "../../../components/Pagination.jsx";
import LoadingModal from "../../../components/loadingModal.jsx";
import SearchInput from "../../../components/admin/searchInput.jsx";
import StatusFilter from "../../../components/admin/statusFilter.jsx";

const API_BASE = import.meta.env.VITE_API_URL;

const ManageApartment = () => {
  // URL state management
  const [searchParams, setSearchParams] = useSearchParams();

  // data + ui
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);

  // URL-based state
  const page = parseInt(searchParams.get("page")) || 1;
  const pageSize = parseInt(searchParams.get("pageSize")) || 10;
  const searchTerm = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "active";
  const [totalPages, setTotalPages] = useState(1);

  // local state for search input
  const [searchInput, setSearchInput] = useState(searchTerm);

  // modal/form
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
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

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [apartmentHistory, setApartmentHistory] = useState([]);
  const [apartmentFees, setApartmentFees] = useState([]);
  const [fees, setFees] = useState(null);

  // fetch apartments from backend (uses search + status + pagination)
  const fetchApartments = async () => {
    try {
      setLoadingFetch(true);
      const params = {
        page,
        pageSize,
      };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      if (searchTerm && searchTerm.trim() !== "") params.search = searchTerm.trim();

      const res = await axios.get(`${API_BASE}/api/apartments`, { params });
      const data = res.data || {};
      setApartments(Array.isArray(data.data) ? data.data : []);
      setTotalPages(data.totalPages ?? Math.max(1, Math.ceil((data.total ?? 0) / pageSize)));
    } catch (err) {
      console.error("fetchApartments error:", err);
      toast.error("Không thể tải danh sách căn hộ");
      setApartments([]);
      setTotalPages(1);
    } finally {
      setLoadingFetch(false);
    }
  };


  useEffect(() => {
    fetchApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, statusFilter, searchTerm]); // Added searchTerm to dependencies

  // sync searchInput with searchTerm from URL
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  //fetch fee of apartment  
  useEffect(() => {
    if (showDetailModal && selectedApartment?.apartmentCode) {
      fetchFees(selectedApartment.apartmentCode);
    }
  }, [showDetailModal, selectedApartment?.apartmentCode]);
  
  const fetchFees = async (code) => {
    try {
      const res = await axios.get(`${API_BASE}/api/apartments/${code}/fees`);
      setFees(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi khi load phí:", error);
      toast.error("Không thể tải phí căn hộ");
      setFees([]);
    }
  };
  
  const formatPrice = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("vi-VN");
  };
  

  // search trigger (button or Enter)
  const handleSearchTrigger = async () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("search", searchInput);
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("search");
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  };

  // filter handler
  const handleStatusChange = (status) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("status", status);
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  };


  // create / edit
  const openCreate = () => {
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
  };

  const handleEdit = (apt) => {
    setIsEdit(true);
    setForm({
      _id: apt._id || "",
      apartmentCode: apt.apartmentCode || "",
      floor: apt.floor ?? "",
      area: apt.area ?? "",
      status: apt.status || "",
      ownerName: apt.ownerName || "",
      ownerPhone: apt.ownerPhone || "",
      bedrooms: apt.bedrooms ?? "",
      furniture: apt.furniture || "",
      direction: apt.direction || "",
      building: apt.building || "",
      legalDocuments: apt.legalDocuments || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Validate chung cho cả tạo mới và chỉnh sửa
      if (!isEdit) {
        if (!form.apartmentCode?.trim()) {
          toast.error("Vui lòng nhập mã căn hộ");
          setLoading(false);
          return;
        }
      }
  
      if (!form.floor || Number(form.floor) <= 0) {
        toast.error("Tầng phải lớn hơn 0");
        setLoading(false);
        return;
      }
  
      if (!form.area || Number(form.area) <= 0) {
        toast.error("Diện tích phải lớn hơn 0");
        setLoading(false);
        return;
      }
  
      if (!form.bedrooms|| Number(form.bedrooms) <= 0) {
        toast.error("Số phòng ngủ phải > 0");
        setLoading(false);
        return;
      }
  
      if (!form.furniture) {
        toast.error("Vui lòng chọn tình trạng nội thất");
        setLoading(false);
        return;
      }
  
      if (!form.direction) {
        toast.error("Vui lòng chọn hướng căn hộ");
        setLoading(false);
        return;
      }
  
      if (!form.building) {
        toast.error("Vui lòng chọn tòa nhà");
        setLoading(false);
        return;
      }
  
      if (!form.legalDocuments?.trim()) {
        toast.error("Vui lòng nhập thông tin giấy tờ pháp lý");
        setLoading(false);
        return;
      }
  
      // Validate riêng khi edit: nếu có chủ sở hữu thì check
      if (isEdit && form.status !== "chưa có chủ sở hữu") {
        if (!form.ownerName?.trim()) {
          toast.error("Vui lòng nhập tên chủ hộ");
          setLoading(false);
          return;
        }
  
        if (!form.ownerPhone?.trim() || !/^0\d{9}$/.test(form.ownerPhone)) {
          toast.error("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)");
          setLoading(false);
          return;
        }
      }
  
      // Tạo payload
      const payload = {
        apartmentCode:  form.apartmentCode,
        floor: Number(form.floor) || 0,
        area: Number(form.area) || 0,
        status: isEdit ? form.status : "chưa có chủ sở hữu",
        ownerName: isEdit ? form.ownerName : "",
        ownerPhone: isEdit ? form.ownerPhone : "",
        bedrooms: Number(form.bedrooms) || 0,
        furniture: form.furniture,
        direction: form.direction,
        building: form.building,
        legalDocuments: form.legalDocuments,
      };
  
      if (isEdit && form._id) {
        await axios.put(`${API_BASE}/api/apartments/${form._id}`, payload);
        toast.success("Cập nhật căn hộ thành công");
      } else {
        await axios.post(`${API_BASE}/api/apartments`, payload);
        toast.success("Tạo căn hộ thành công");
        // Reset về page 1
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("page", "1");
        setSearchParams(newSearchParams);
      }
  
      setShowModal(false);
      fetchApartments();
    } catch (err) {
      console.error("handleSubmit error:", err);
    
      if (err.response) {
        const message = err.response.data?.message || "";
    
        // MongoDB duplicate key error
        if (message.includes("E11000") || message.toLowerCase().includes("duplicate key")) {
          toast.error("Căn hộ đã tồn tại (trùng mã hoặc slug)");
        }
        // Backend trả 409
        else if (err.response.status === 409) {
          toast.error("Mã căn hộ đã tồn tại, vui lòng nhập mã khác");
        }
        // Backend có message chứa 'tồn tại' hoặc 'exists'
        else if (message.toLowerCase().includes("tồn tại") || message.toLowerCase().includes("exists")) {
          toast.error("Căn hộ này đã tồn tại");
        }
        else {
          toast.error("Thao tác thất bại");
        }
      } else {
        toast.error("Thao tác thất bại");
      }
    } finally {
      setLoading(false);
    }
  };  

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa căn hộ?")) return;
    try {
      await axios.delete(`${API_BASE}/api/apartments/${id}`);
      toast.success("Đã xóa (soft delete)");
      fetchApartments();
    } catch (err) {
      console.error("handleDelete error:", err);
      toast.error("Xóa thất bại");
    }
  };

  // show detail modal: fetch apartment + history
  const handleShowDetails = async (id) => {
    try {
      setLoading(true);
  
      // Lấy thông tin căn hộ
      const res = await axios.get(`${API_BASE}/api/apartments/${id}`);
      setSelectedApartment(res.data || null);
  
      // Lấy lịch sử căn hộ
      if (res.data?.apartmentCode) {
        try {
          const hist = await axios.get(`${API_BASE}/api/apartments/history/${res.data.apartmentCode}`);
          setApartmentHistory(Array.isArray(hist.data) ? hist.data : []);
        } catch (err) {
          console.error("Lỗi load lịch sử:", err);
          setApartmentHistory([]);
        }
  
        // Lấy phí căn hộ
        try {
          const feesRes = await axios.get(`${API_BASE}/api/apartments/${res.data.apartmentCode}/fees`);
          setApartmentFees(Array.isArray(feesRes.data) ? feesRes.data : []);
        } catch (err) {
          if (err.response && err.response.status === 404) {
            console.warn("Không có phí cho căn hộ này");
          } else {
            console.error("Lỗi khi load phí:", err);
          }
          setApartmentFees([]);
        }
      } else {
        setApartmentHistory([]);
        setApartmentFees([]);
      }
  
      setShowDetailModal(true);
    } catch (err) {
      console.error("handleShowDetails error:", err);
      toast.error("Không thể lấy chi tiết căn hộ");
    } finally {
      setLoading(false);
    }
  };
  

  // helper render user cell with link if _id exists
  const renderUserCell = (userObj, fallbackName = "Chưa có") => {
    if (!userObj) return fallbackName;
    if (typeof userObj === "object" && userObj._id) {
      return <Link to={`/admin-dashboard/manage-user/${userObj._id}`}>{userObj.name || fallbackName}</Link>;
    }
    if (typeof userObj === "string" && userObj.trim() !== "") return userObj;
    if (userObj.name) return userObj.name;
    return fallbackName;
  };

  return (
    <AdminDashboard>
      <div className="w-100">
        {(loadingFetch || loading) && <LoadingModal />}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Quản lý Căn hộ</h2>

          <div className="d-flex align-items-center gap-2">
            <SearchInput
              placeholder="Tìm theo tên chủ căn hộ"
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearchTrigger}
              onClear={handleClearSearch}
            />

            <StatusFilter
              value={statusFilter}
              onChange={handleStatusChange}
              type="apartment"
            />

            <button
              className="btn btn-primary fw-bold d-flex align-items-center gap-2 px-3 shadow-sm"
              style={{ height: "38px", whiteSpace: "nowrap", borderRadius: "8px" }}
              onClick={openCreate}
            >
              + Tạo Căn hộ
            </button>
          </div>
        </div>

        <div className="card w-100">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="thead-light">
                  <tr>
                    <th>STT</th>
                    <th>Tên Căn hộ</th>
                    <th>Tầng</th>
                    <th>Diện tích (m²)</th>
                    <th>Trạng thái</th>
                    <th>Chủ sở hữu</th>
                    <th>SĐT chủ</th>
                    <th>Người thuê</th>
                    <th>SĐT thuê</th>
                    <th>Hành động</th>
                    <th>Hiện trạng</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingFetch ? (
                    <tr>
                      <td colSpan="11" className="text-center text-muted py-4">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : apartments.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="text-center text-muted py-4">
                        Không có căn hộ nào.
                      </td>
                    </tr>
                  ) : (
                    apartments.map((apt, idx) => (
                      <tr key={apt._id}>
                        <td>{(page - 1) * pageSize + idx + 1}</td>

                        <td>
                          <span
                            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                            onClick={() => handleShowDetails(apt._id)}
                          >
                            {apt.apartmentCode || "Không rõ"}
                          </span>
                        </td>

                        <td>{apt.floor ?? "-"}</td>
                        <td>{apt.area ?? "-"}</td>
                        <td>{apt.status ?? "Chưa xác định"}</td>

                        <td>{renderUserCell(apt.isOwner ?? apt.ownerName)}</td>
                        <td>{(apt.isOwner && apt.isOwner.phone) || apt.ownerPhone || "-"}</td>

                        <td>{renderUserCell(apt.isRenter ?? null)}</td>
                        <td>{(apt.isRenter && apt.isRenter.phone) || "-"}</td>

                        <td>
                          <div style={{ display: "flex", gap: 8, whiteSpace: "nowrap" }}>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(apt)}
                              disabled={!!apt.deletedAt}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(apt._id)}
                              disabled={!!apt.deletedAt || apt.status === "đang ở" || apt.status === "đang cho thuê"}
                            >
                              Delete
                            </button>
                          </div>
                        </td>

                        <td>
                          <span className={`badge rounded-pill ${apt.deletedAt ? "bg-danger" : "bg-success"}`}>
                            {apt.deletedAt ? "Đã xóa" : "Hoạt động"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>


        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("page", p.toString());
            setSearchParams(newSearchParams);
          }}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("pageSize", s.toString());
            newSearchParams.set("page", "1");
            setSearchParams(newSearchParams);
          }}
        />


        {/* Create/Edit modal */}
        {showModal && (
          <ApartmentFormModal
            show={showModal}
            onClose={() => setShowModal(false)}
            form={form}
            setForm={setForm}
            handleChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
            isEdit={isEdit}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}

        {/* Detail modal */}
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
        <button
          type="button"
          className="btn btn-sm btn-light position-absolute"
          aria-label="Đóng"
          onClick={() => setShowDetailModal(false)}
          style={{ top: 8, right: 8, zIndex: 1051 }}
        >
          ✕
        </button>

        <div className="modal-header bg-primary text-white">
          <h5 className="modal-title">
            <i className="bi bi-building me-2" aria-hidden="true"></i>
            Chi tiết Căn hộ:{" "}
            <small className="ms-2 text-light opacity-75">
              {selectedApartment.apartmentCode}
            </small>
          </h5>
        </div>

        <div className="modal-body">
          <div className="row">
            {/* Cột trái */}
            <div className="col-md-6">
              <ul className="list-group list-group-flush">
                <li className="list-group-item"><strong>Tầng:</strong> {selectedApartment.floor ?? "—"}</li>
                <li className="list-group-item"><strong>Diện tích:</strong> {selectedApartment.area ? `${selectedApartment.area} m²` : "—"}</li>
                <li className="list-group-item"><strong>Phòng ngủ:</strong> {selectedApartment.bedrooms ?? "—"}</li>
                <li className="list-group-item"><strong>Nội thất:</strong> {selectedApartment.furniture || "—"}</li>
                <li className="list-group-item"><strong>Hướng:</strong> {selectedApartment.direction || "—"}</li>
                <li className="list-group-item"><strong>Toà:</strong> {selectedApartment.building || "—"}</li>
              </ul>
            </div>

            {/* Cột phải */}
            <div className="col-md-6">
              <ul className="list-group list-group-flush">
                <li className="list-group-item"><strong>Trạng thái:</strong> {selectedApartment.status || "—"}</li>
                <li className="list-group-item"><strong>Giấy tờ pháp lý:</strong> {selectedApartment.legalDocuments || "—"}</li>

                <li className="list-group-item">
                  <strong>Chủ sở hữu:</strong>{" "}
                  {selectedApartment.isOwner?._id ? (
                    <Link to={`/admin-dashboard/manage-user/${selectedApartment.isOwner._id}`} className="ms-1">
                      {selectedApartment.isOwner.name}
                    </Link>
                  ) : (
                    <span className="ms-1 text-muted">Chưa có</span>
                  )}
                </li>

                <li className="list-group-item">
                  <strong>SĐT chủ:</strong>{" "}
                  {(selectedApartment.isOwner && selectedApartment.isOwner.phone) || selectedApartment.ownerPhone || "—"}
                </li>

                <li className="list-group-item">
                  <strong>Người thuê:</strong>{" "}
                  {selectedApartment.isRenter?._id ? (
                    <Link to={`/admin-dashboard/manage-user/${selectedApartment.isRenter._id}`} className="ms-1">
                      {selectedApartment.isRenter.name}
                    </Link>
                  ) : (
                    <span className="ms-1 text-muted">Chưa có</span>
                  )}
                </li>

                <li className="list-group-item"><strong>SĐT người thuê:</strong> {(selectedApartment.isRenter && selectedApartment.isRenter.phone) || "—"}</li>
              </ul>
            </div>
          </div>

          {/* Hiển thị phí tháng mới nhất */}
          <hr className="my-4" />
          <h5 className="me-2">💰 Lịch sử phí căn hộ</h5>
          {apartmentFees.length > 0 ? (
  <div className="mb-3 mt-4">
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
          {apartmentFees.map((fee) => (
            <tr key={fee._id}>
              <td className="text-center">{fee.month}</td>
              <td className="text-end">{formatPrice(fee.managementFee)}</td>
              <td className="text-end">{formatPrice(fee.waterFee)}</td>
              <td className="text-end">{formatPrice(fee.parkingFee)}</td>
              <td className="text-end fw-bold">{formatPrice(fee.total)}</td>
              <td
                className={`text-center fw-semibold ${
                  fee.paymentStatus === "unpaid" ? "text-danger" : "text-success"
                }`}
              >
                {fee.paymentStatus === "unpaid" ? "Chưa thanh toán" : "Đã thanh toán"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
) : (
  <p className="text-muted mt-3">💸 Không có phí cho căn hộ này</p>
)}

          <hr className="my-4" />
          <h5><i className="bi bi-clock-history me-2"></i> Lịch sử sử dụng căn hộ</h5>

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
                  {apartmentHistory.map((rec, i) => (
                    <tr key={rec._id || i}>
                      <td>{i + 1}</td>
                      <td>{rec.fullName || (rec.user && rec.user.name) || "—"}</td>
                      <td>{rec.phone || (rec.user && rec.user.phone) || "—"}</td>
                      <td>{rec.documentType || "—"}</td>
                      <td>
                        {rec.contractStart
                          ? `${new Date(rec.contractStart).toLocaleDateString()}${rec.contractEnd ? ` - ${new Date(rec.contractEnd).toLocaleDateString()}` : ""}`
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
          <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
        </div>
      </div>
    </div>
  </div>
)}


      </div>
    </AdminDashboard>
  );
};

export default ManageApartment;
