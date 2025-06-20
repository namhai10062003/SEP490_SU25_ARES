import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ResidentVerificationForm.css";

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
  const [stats, setStats] = useState({
    posts: 128,
    realEstate: 56,
    vehicles: 78,
    expenses: 45,
  });

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
        `http://localhost:4000/api/resident-verification/search-user?keyword=${query}`
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
    data.append("userId", user._id);
    data.append("fullName", user.name || "");
    data.append("email", user.email || "");
    data.append("phone", user.phone || "");
    data.append("documentType", formData.documentType);
    data.append("apartmentCode", formData.apartmentCode);
    data.append("contractStart", formData.contractStart);
    data.append("contractEnd", formData.contractEnd);
    if (formData.documentImage)
      data.append("documentImage", formData.documentImage);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/resident-verification/verification",
        data, // FormData chứa cả ảnh
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

      // Reset ô chọn ảnh (ẩn tên file)
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

      setUser(null); // Quay lại bước tìm người dùng
      setQuery(""); // Xoá từ khoá tìm kiếm
    } catch (err) {
      console.error("Gửi thất bại:", err);
      alert("Gửi thất bại! Vui lòng kiểm tra lại.");
    }
  };

  return (
    <div className="resident-form-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">BẢN QUẢN LÝ</h2>
        <nav className="sidebar-menu">
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/posts">Quản lý bài post</Link>
            </li>
            <li>
              <Link to="/real-estate">Quản lý bất động sản</Link>
            </li>
            <li>
              <Link to="/vehicles">Quản lý bài đồ xe</Link>
            </li>
            <li>
              <Link to="/expenses">Quản lý chi phí</Link>
            </li>
            <li>
              <span style={{ marginLeft: "10px" }}>Quản lý người dùng ▼</span>
              <ul className="submenu">
                <li>
                  <Link to="/residentVerification">Xác Thực</Link>
                </li>
                <li>
                  <Link to="/listresidentVerification">
                    Danh Sách Xác Thực
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/revenue">Quản lý doanh thu</Link>
            </li>
            <li>
              <Link to="/login">Đăng Xuất</Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        {!user && (
          <div className="search-section">
            <h2 className="section-title">Tìm kiếm người dùng</h2>
            <div className="search-row">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tên người dùng hoặc Email"
                className="search-input"
              />
              <button onClick={handleSearch} className="btn btn-search">
                Tìm kiếm
              </button>
            </div>
          </div>
        )}

        {user && (
          <div className="form-section">
            <form onSubmit={handleSubmit}>
              <h3 className="form-title">Nhập thông tin xác thực cư dân</h3>
              <div className="form-grid">
                <input
                  type="text"
                  value={user.name || ""}
                  disabled
                  placeholder="Họ và tên"
                  className="input-field input-disabled"
                />
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  placeholder="Email"
                  className="input-field input-disabled"
                />
                <input
                  type="text"
                  value={user.phone || ""}
                  disabled
                  placeholder="Số điện thoại"
                  className="input-field input-disabled"
                />
                <select
                  name="apartmentCode"
                  value={formData.apartmentCode}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">-- Chọn căn hộ --</option>
                  {apartments.map((ap) => (
                    <option key={ap._id} value={ap.apartmentCode}>
                      {ap.apartmentCode}
                    </option>
                  ))}
                </select>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">-- Loại hợp đồng --</option>
                  <option value="rental">Hợp đồng thuê</option>
                  <option value="ownership">Giấy chủ quyền</option>
                  <option value="other">Khác</option>
                </select>
                <input
                  type="file"
                  name="documentImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="input-field"
                  ref={fileInputRef}
                  required
                />

                <div className="form-group">
                  <label htmlFor="contractStart">Ngày bắt đầu hợp đồng</label>
                  <input
                    type="date"
                    name="contractStart"
                    value={formData.contractStart}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contractEnd">Ngày kết thúc hợp đồng</label>
                  <input
                    type="date"
                    id="contractEnd"
                    name="contractEnd"
                    value={formData.contractEnd}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                {previewImage && (
                  <div className="image-preview-container">
                    <div>
                      <span className="preview-label">
                        Ảnh hợp đồng đã chọn:
                      </span>
                      <img
                        src={previewImage}
                        alt="Ảnh hợp đồng"
                        className="preview-image"
                      />
                    </div>
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-submit">
                Gửi xác thực
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
