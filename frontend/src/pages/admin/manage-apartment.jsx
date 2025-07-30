import axios from "axios";
import React, { useEffect, useState } from "react";
import AdminDashboard from "./adminDashboard.jsx"; // Assuming similar structure
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const ManageApartment = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
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
  }, []);

  const fetchApartments = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/apartments`);
      setApartments(res.data);
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
    if (window.confirm("Bạn có chắc muốn xóa căn hộ này?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/apartments/${id}`);
        setApartments(apartments.filter(apt => apt._id !== id));
        alert("Xóa căn hộ thành công!");
      } catch (err) {
        console.error("Lỗi khi xóa căn hộ:", err);
        alert("Xóa căn hộ thất bại!");
      }
    }
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

    // Chỉ kiểm tra các trường bắt buộc (bỏ qua ownerName và ownerPhone)
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
      alert("Vui lòng điền đầy đủ thông tin (trừ Chủ sở hữu và SĐT có thể bỏ trống)!");
      return;
    }

    const floor = parseInt(form.floor);
    const area = parseInt(form.area);
    const bedrooms = parseInt(form.bedrooms);
    if (isNaN(floor) || isNaN(area) || isNaN(bedrooms)) {
      alert("Tầng, Diện tích, và Số phòng ngủ phải là số!");
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
        alert(isEdit ? "Cập nhật căn hộ thành công!" : "Tạo căn hộ thành công!");
      }
    } catch (err) {
      console.error("Lỗi khi xử lý căn hộ:", err.response?.data || err.message);
      console.log("Chi tiết lỗi:", err.response?.data);
      alert(isEdit ? "Cập nhật căn hộ thất bại!" : "Tạo căn hộ thất bại! Vui lòng kiểm tra dữ liệu hoặc liên hệ admin.");
    }
  };

  const filteredApartments = apartments.filter((apt) => {
    const term = searchTerm.toLowerCase();
    console.log("📌 Trạng thái căn hộ:", apt.status);

    return (
      apt.apartmentCode?.toLowerCase().includes(term) ||
      apt.ownerName?.toLowerCase().includes(term) ||
      apt.ownerPhone?.toLowerCase().includes(term) ||
      apt.status?.toLowerCase().includes(term) ||
      apt.building?.toLowerCase().includes(term) ||
      apt.furniture?.toLowerCase().includes(term) ||
      apt.direction?.toLowerCase().includes(term) ||
      apt.area?.toString().includes(term)  // 🔍 tìm theo diện tích
    );

  });

  return (
    <AdminDashboard>
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
                  <th>SĐT</th>
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
                ) : filteredApartments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      Không có căn hộ nào.
                    </td>
                  </tr>
                ) : (
                  filteredApartments.map((apt, index) => (
                    <tr key={apt._id}>
                      <td>{index + 1}</td>
                      <td>{apt.apartmentCode || "Không rõ"}</td>
                      <td>{apt.floor}</td>
                      <td>{apt.area || "-"}</td>
                      <td>{apt.status || "Chưa xác định"}</td>
                      <td>{apt.ownerName || "Chưa có"}</td>
                      <td>{apt.ownerPhone || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", whiteSpace: "nowrap" }}>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(apt)}
                            style={{ padding: "0.25rem 0.5rem" }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(apt._id)}
                            style={{ padding: "0.25rem 0.5rem" }}
                          >
                            Delete
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
        <div className="d-flex justify-content-center align-items-center mt-4">
          <button className="btn btn-outline-secondary me-2" disabled>
            &lt; Prev
          </button>
          <span style={{ minWidth: 90, textAlign: "center" }}>Trang 1/1</span>
          <button className="btn btn-outline-secondary ms-2" disabled>
            Next &gt;
          </button>
        </div>
      </div>

      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.3)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="container py-2">
                  <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">Tạo Căn Hộ</h2>
                  </div>
                  <div className="row g-3">
                    {/* Mã căn hộ */}
                    <div className="col-md-6">
                      <label className="form-label">Mã Căn hộ</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ví dụ: P2-18.01"
                        value={form.apartmentCode}
                        onChange={(e) => setForm({ ...form, apartmentCode: e.target.value })}
                      />
                    </div>

                    {/* Số phòng ngủ */}
                    <div className="col-md-6">
                      <label className="form-label">Số phòng ngủ</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.bedrooms}
                        onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                      />
                    </div>

                    {/* Tầng */}
                    <div className="col-md-6">
                      <label className="form-label">Tầng</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.floor}
                        onChange={(e) => setForm({ ...form, floor: e.target.value })}
                      />
                    </div>

                    {/* Nội thất */}
                    <div className="col-md-6">
                      <label className="form-label">Nội thất</label>
                      <select
                        className="form-select"
                        value={form.furniture}
                        onChange={(e) => setForm({ ...form, furniture: e.target.value })}
                      >
                        <option value="">-- Chọn --</option>
                        <option value="Đầy đủ">Đầy đủ</option>
                        <option value="Cơ bản">Cơ bản</option>
                        <option value="Không có">Không có</option>
                      </select>
                    </div>

                    {/* Diện tích */}
                    <div className="col-md-6">
                      <label className="form-label">Diện tích (m²)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.area}
                        onChange={(e) => setForm({ ...form, area: e.target.value })}
                      />
                    </div>

                    {/* Hướng */}
                    <div className="col-md-6">
                      <label className="form-label">Hướng</label>
                      <select
                        className="form-select"
                        value={form.direction}
                        onChange={(e) => setForm({ ...form, direction: e.target.value })}
                      >
                        <option value="">-- Chọn --</option>
                        <option value="Đông">Đông</option>
                        <option value="Tây">Tây</option>
                        <option value="Nam">Nam</option>
                        <option value="Bắc">Bắc</option>
                      </select>
                    </div>

                    {/* Trạng thái */}
                    <div className="col-md-6">
                      <label className="form-label">Trạng thái</label>
                      <select
                        className="form-select"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        disabled={isEdit}
                      >
                        <option value="">-- Chọn --</option>
                        <option value="đang ở">Đang ở</option>
                        <option value="đang cho thuê">Đang cho thuê</option>
                        <option value="chưa có chủ sở hữu">Chưa có chủ sở hữu</option>
                      </select>

                    </div>

                    {/* Tòa nhà */}
                    <div className="col-md-6">
                      <label className="form-label">Tòa nhà</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.building}
                        onChange={(e) => setForm({ ...form, building: e.target.value })}
                      />
                    </div>

                    {/* Chủ sở hữu */}
                    <div className="col-md-6">
                      <label className="form-label">Chủ sở hữu</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Không bắt buộc"
                        value={form.ownerName}
                        disabled={isEdit}
                        onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                      />
                    </div>

                    {/* Tài liệu pháp lý */}
                    <div className="col-md-6">
                      <label className="form-label">Tài liệu pháp lý</label>
                      <select
                        className="form-select"
                        value={form.legalDocuments}
                        onChange={(e) =>
                          setForm({ ...form, legalDocuments: e.target.value })
                        }
                      >
                        <option value="">-- Chọn --</option>
                        <option value="sổ hồng">Sổ hồng</option>
                        <option value="chưa có sổ">Chưa có sổ</option>
                      </select>
                    </div>

                    {/* Số điện thoại */}
                    <div className="col-md-6">
                      <label className="form-label">Số điện thoại</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Không bắt buộc"
                        value={form.ownerPhone}
                        disabled={isEdit}
                        onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="d-flex justify-content-end mt-4 gap-2">
                    <button className="btn btn-primary" type="submit">
                      Xác nhận
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Hủy
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </AdminDashboard>
  );
};

export default ManageApartment;