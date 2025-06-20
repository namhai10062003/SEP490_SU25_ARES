import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboard from "./adminDashboard.jsx"; // Assuming similar structure

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

  const filteredApartments = apartments.filter(apt =>
    apt.apartmentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminDashboard>
      <div className="w-100">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="font-weight-bold">Quản lý Căn hộ</h2>
          <div>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "0.5rem", width: "200px", marginRight: "1rem" }}
            />
            <button
              className="btn btn-sm btn-primary"
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
              Tạo Căn hộ
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
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="btn btn-sm btn-outline-secondary">Prev</button>
          <span>Trang 1/1</span>
          <button className="btn btn-sm btn-outline-secondary">Next</button>
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
                <div className="modal-header">
                  <h5 className="modal-title">{isEdit ? "Chỉnh sửa Căn hộ" : "Tạo Căn hộ"}</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setShowModal(false)}
                  >
                    <span>×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Tên Căn hộ</label>
                    <input
                      type="text"
                      className="form-control"
                      name="apartmentCode"
                      value={form.apartmentCode}
                      onChange={handleChange}
                      placeholder="Nhập mã căn hộ (ví dụ: P2-18.01)"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tầng</label>
                    <input
                      type="number"
                      className="form-control"
                      name="floor"
                      value={form.floor}
                      onChange={handleChange}
                      placeholder="Nhập số tầng"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Diện tích (m²)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="area"
                      value={form.area}
                      onChange={handleChange}
                      placeholder="Nhập diện tích (m²)"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <div className="form-group">
                      <select name="status" value={form.status} onChange={handleChange} className="form-control" required>
                        <option value="">-- Chọn trạng thái --</option>
                        <option value="đang ở">Đang ở</option>
                        <option value="đang cho thuê">Đang cho thuê</option>
                        <option value="chưa có chủ sở hữu">Chưa có chủ sở hữu</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Chủ sở hữu</label>
                    <input
                      type="text"
                      className="form-control"
                      name="ownerName"
                      value={form.ownerName}
                      onChange={handleChange}
                      placeholder="Nhập tên chủ sở hữu"
                    />
                  </div>
                  <div className="form-group">
                    <label>SĐT</label>
                    <input
                      type="text"
                      className="form-control"
                      name="ownerPhone"
                      value={form.ownerPhone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className="form-group">
                    <label>Số phòng ngủ</label>
                    <input
                      type="number"
                      className="form-control"
                      name="bedrooms"
                      value={form.bedrooms}
                      onChange={handleChange}
                      placeholder="Nhập số phòng ngủ"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nội thất</label>
                    <select name="furniture" value={form.furniture} onChange={handleChange} className="form-control" required>
                      <option value="">-- Chọn nội thất --</option>
                      <option value="Đầy đủ">Đầy đủ</option>
                      <option value="Cơ bản">Cơ bản</option>
                      <option value="Không có">Không có</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Hướng</label>
                    <select name="direction" value={form.direction} onChange={handleChange} className="form-control" required>
                      <option value="">-- Chọn hướng --</option>
                      <option value="Đông">Đông</option>
                      <option value="Tây">Tây</option>
                      <option value="Nam">Nam</option>
                      <option value="Bắc">Bắc</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tòa nhà</label>
                    <select name="building" value={form.building} onChange={handleChange} className="form-control" required>
                      <option value="">-- Chọn tòa nhà --</option>
                      <option value="Plaza 1">Plaza 1</option>
                      <option value="Plaza 2">Plaza 2</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tài liệu pháp lý</label>
                    <select name="legalDocuments" value={form.legalDocuments} onChange={handleChange} className="form-control" required>
                      <option value="">-- Chọn tài liệu --</option>
                      <option value="sổ hồng">Sổ hồng</option>
                      <option value="chưa có sổ">Chưa có sổ</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    {isEdit ? "Xác nhận" : "Xác nhận"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Hủy
                  </button>
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