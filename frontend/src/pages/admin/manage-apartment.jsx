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

      // Nếu lọc "all" hoặc "deleted" thì cần lấy cả bản ghi bị xóa
      const includeDeleted = statusFilter !== "active";

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/apartments?page=${page}&pageSize=${pageSize}&includeDeleted=${includeDeleted}&status=${statusFilter}`
      );

      setApartments(res?.data?.data || []);
      console.log("🚀 Danh sách căn hộ:", res.data.data);
      setTotalPages(res.data.totalPages);
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
                      <td>{apt.apartmentCode || "Không rõ"}</td>
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
                            disabled={!!apt.deletedAt}
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
    </AdminDashboard>
  );
};

export default ManageApartment;