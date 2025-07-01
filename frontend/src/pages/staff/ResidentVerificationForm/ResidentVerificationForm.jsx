import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ResidentVerificationForm() {
  const [formData, setFormData] = useState({
    documentType: "",
    apartmentCode: "",
    contractStart: "",
    contractEnd: "",
    documentImage: null,
  });
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [apartments, setApartments] = useState([]);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/apartments");
        if (Array.isArray(res.data)) {
          setApartments(res.data);
        } else {
          console.error("API không trả về danh sách hợp lệ");
        }
      } catch (err) {
        console.error("Lỗi khi gọi API căn hộ:", err.message);
      }
    };
    fetchApartments();
  }, []);

  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await axios.get(
        `http://localhost:4000/api/resident-verifications/search-user?keyword=${query}`
      );
      setUser(res.data);
    } catch (err) {
      setUser(null);
      alert("Không tìm thấy người dùng");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0] && name === "documentImage") {
      setPreviewImage(URL.createObjectURL(files[0]));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !user ||
      !formData.documentType ||
      !formData.apartmentCode ||
      !formData.contractStart ||
      !formData.contractEnd
    ) {
      alert("Vui lòng điền đủ thông tin bắt buộc.");
      return;
    }

    const data = new FormData();

    data.append("user", user._id);
    data.append("fullName", user.name || "");
    data.append("email", user.email || "");
    data.append("phone", user.phone || "");
    data.append("documentType", formData.documentType);
    data.append("apartmentCode", formData.apartmentCode);
    data.append("contractStart", new Date(formData.contractStart).toISOString());
    data.append("contractEnd", new Date(formData.contractEnd).toISOString());

    if (formData.documentImage && formData.documentImage instanceof File) {
      data.append("documentImage", formData.documentImage);
    } else {
      alert("Ảnh hợp đồng không hợp lệ hoặc chưa được chọn.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/api/resident-verifications/verification",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Gửi yêu cầu xác thực thành công!");

      setFormData({
        documentType: "",
        apartmentCode: "",
        contractStart: "",
        contractEnd: "",
        documentImage: null,
      });
      setPreviewImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

      setUser(null);
      setQuery("");
    } catch (err) {
      console.error("Gửi thất bại:", err?.response || err);
      alert("Gửi thất bại! Vui lòng kiểm tra lại.");
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <aside className="bg-primary text-white p-4" style={{ minWidth: 240 }}>
        <h2 className="fw-bold mb-4 text-warning text-center">BẢN QUẢN LÝ</h2>
        <nav>
          <ul className="nav flex-column gap-2">
            <li className="nav-item"><Link to="/staff-dashboard" className="nav-link text-white">Dashboard</Link></li>
            <li className="nav-item"><Link to="/posts" className="nav-link text-white">Quản lý bài post</Link></li>
            <li className="nav-item"><Link to="/real-estate" className="nav-link text-white">Quản lý bất động sản</Link></li>
            <li className="nav-item"><Link to="/manage-parkinglot" className="nav-link text-white">Quản lý bãi đỗ xe</Link></li>
            <li className="nav-item"><Link to="/expenses" className="nav-link text-white">Quản lý chi phí</Link></li>
            <li className="nav-item">
              <span className="nav-link text-white fw-bold">Quản lý người dùng ▼</span>
              <ul className="nav flex-column ms-3">
                <li className="nav-item">
                  <Link to="/residentVerification" className="nav-link text-white">Xác Thực</Link>
                </li>
                <li className="nav-item">
                  <Link to="/listresidentVerification" className="nav-link text-white">Danh Sách Xác Thực</Link>
                </li>
              </ul>
            </li>
            <li className="nav-item"><Link to="/revenue" className="nav-link text-white">Quản lý doanh thu</Link></li>
            <li className="nav-item"><Link to="/login" className="nav-link text-white">Đăng Xuất</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-grow-1 p-4">
        {!user && (
          <div className="bg-white rounded-4 shadow p-4 mx-auto mb-4" style={{ maxWidth: 700 }}>
            <h2 className="fw-bold text-center mb-4">Tìm kiếm người dùng</h2>
            <div className="row g-2 justify-content-center">
              <div className="col-12 col-md-8">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tên người dùng hoặc Email"
                  className="form-control form-control-lg"
                />
              </div>
              <div className="col-12 col-md-4 d-grid">
                <button onClick={handleSearch} className="btn btn-primary btn-lg">
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="bg-white rounded-4 shadow p-4 mx-auto" style={{ maxWidth: 900 }}>
            <form onSubmit={handleSubmit}>
              <h3 className="fw-bold text-center mb-4">Nhập thông tin xác thực cư dân</h3>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    value={user.name || ""}
                    disabled
                    className="form-control"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="form-control"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="text"
                    value={user.phone || ""}
                    disabled
                    className="form-control"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Căn hộ</label>
                  <select
                    name="apartmentCode"
                    value={formData.apartmentCode}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Chọn căn hộ --</option>
                    {apartments.map((ap) => (
                      <option key={ap._id} value={ap.apartmentCode}>
                        {ap.apartmentCode}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Loại hợp đồng</label>
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Loại hợp đồng --</option>
                    <option value="Hợp đồng cho thuê">Hợp đồng cho thuê</option>
                    <option value="Hợp đồng mua bán">Hợp đồng mua bán</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ngày bắt đầu hợp đồng</label>
                  <input
                    type="date"
                    name="contractStart"
                    value={formData.contractStart}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ngày kết thúc hợp đồng</label>
                  <input
                    type="date"
                    name="contractEnd"
                    value={formData.contractEnd}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label">Ảnh hợp đồng</label>
                  <input
                    type="file"
                    name="documentImage"
                    accept="image/*"
                    onChange={handleChange}
                    className="form-control"
                    ref={fileInputRef}
                    required
                  />
                  {previewImage && (
                    <div className="mt-3 text-center">
                      <span className="d-block mb-2 text-secondary">Ảnh hợp đồng đã chọn:</span>
                      <img
                        src={previewImage}
                        alt="Ảnh hợp đồng"
                        className="img-thumbnail"
                        style={{ maxHeight: 220 }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <button type="submit" className="btn btn-success btn-lg w-100 mt-4">
                Gửi xác thực
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}