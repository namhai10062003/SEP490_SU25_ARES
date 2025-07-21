import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import StaffNavbar from "../staffNavbar";

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
  const [loading, setLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
// list ra all users
useEffect(() => {
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users?limit=1000`);

      // Kiểm tra kỹ dữ liệu trả về
      if (res.data && Array.isArray(res.data)) {
        setAllUsers(res.data);
        setFilteredUsers(res.data); // ✅ thêm dòng này để khởi tạo
      } else if (res.data && res.data.users && Array.isArray(res.data.users)) {
        setAllUsers(res.data.users);
        setFilteredUsers(res.data.users); // ✅ Sửa chỗ này
      } else {
        console.error("❌ API không trả về danh sách người dùng hợp lệ:", res.data);
      }
    } catch (err) {
      console.error("❌ Lỗi khi gọi API lấy tất cả người dùng:", err.message);
    }
  };

  fetchAllUsers();
}, []);


  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/apartments`);
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

  // const handleSearch = async () => {
  //   if (!query) return;
  //   setLoading(true);
  //   try {
  //     const res = await axios.get(
  //       `${import.meta.env.VITE_API_URL}/api/resident-verifications/search-user?keyword=${query}`
  //     );
  //     setUser(res.data);
  //   } catch (err) {
  //     setUser(null);
  //     alert("Không tìm thấy người dùng");
  //   }
  //   setLoading(false);
  // };
  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      setFilteredUsers(allUsers);
      return;
    }
  
    const filtered = allUsers.filter((u) =>
      u.name?.toLowerCase().includes(keyword) ||
      u.email?.toLowerCase().includes(keyword) ||
      u.phone?.includes(keyword)
    );
  
    setFilteredUsers(filtered);
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
        `${import.meta.env.VITE_API_URL}/api/resident-verifications/verification`,
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
      <StaffNavbar />
      <main className="flex-grow-1 p-4">
        <div className="container" style={{ maxWidth: 900 }}>
          {/* {!user && (
            <div className="bg-white rounded-4 shadow p-4 mx-auto mb-4">
              <h2 className="fw-bold text-center mb-4">Tìm kiếm người dùng</h2>
              <form
                className="row g-2 justify-content-center"
                onSubmit={e => {
                  e.preventDefault();
                  handleSearch();
                }}
              >
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
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : null}
                    Tìm kiếm
                  </button>
                </div>
              </form>
            </div>
          )} */}
<div className="table-responsive mt-4">
  <h4 className="fw-bold mb-3">Danh sách tất cả người dùng</h4>
  <form onSubmit={handleSearch} className="mb-3 row g-2">
    <div className="col-md-10">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="form-control"
        placeholder="Tìm theo tên, email hoặc số điện thoại"
      />
    </div>
    <div className="col-md-2 d-grid">
      <button className="btn btn-primary" type="submit">Tìm kiếm</button>
    </div>
  </form>
  <table className="table table-bordered table-striped">
    <thead className="table-light">
      <tr>
        <th>#</th>
        <th>Họ và tên</th>
        <th>Email</th>
        <th>Số điện thoại</th>
        <th>Hành động</th>
      </tr>
    </thead>
    <tbody>
      {filteredUsers.length === 0 ? (
        <tr>
          <td colSpan="5" className="text-center">Không có người dùng phù hợp.</td>
        </tr>
      ) : (
        filteredUsers.map((u, index) => (
          <tr key={u._id}>
            <td>{index + 1}</td>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.phone}</td>
            <td>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setUser(u)}
              >
                Xác thực
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

          {user && (
            <div className="bg-white rounded-4 shadow p-4 mx-auto">
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
                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setUser(null);
                      setFormData({
                        documentType: "",
                        apartmentCode: "",
                        contractStart: "",
                        contractEnd: "",
                        documentImage: null,
                      });
                      setPreviewImage(null);
                      setQuery("");
                    }}
                  >
                    Quay lại
                  </button>
                  <button type="submit" className="btn btn-success btn-lg px-5">
                    Gửi xác thực
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}