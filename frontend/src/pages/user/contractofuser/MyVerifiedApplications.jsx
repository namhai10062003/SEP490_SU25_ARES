import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";

const MyVerifiedApplications = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetchVerifiedApplications = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user?._id) {
        navigate("/login");
        return;
      }

      try {
        // Lấy thông tin hồ sơ user
        const profileRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/profile/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(profileRes.data);

        // Lấy danh sách đơn xác thực đã duyệt
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/resident-verifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userVerified = res.data.filter(
          (form) => form.user?._id === user._id && form.status === "Đã duyệt"
        );

        setAllApplications(userVerified);
        setApplications(userVerified);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedApplications();
  }, [user, navigate]);

  const handleDateFilter = () => {
    const search = searchText.toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
  
    // ✅ Validate ngày
    if (from && to && from > to) {
      alert("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!");
      return;
    }
  
    if (to) to.setHours(23, 59, 59, 999); // bao trùm hết ngày to
  
    const filtered = allApplications.filter((form) => {
      const combinedFields = [
        form.email,
        form.phone,
        form.apartmentCode,
        form.documentType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
  
      const matchesSearch = combinedFields.includes(search);
  
      // ✅ Dùng updatedAt để so sánh ngày
      const updatedAt = new Date(form.updatedAt);
      const matchesDate =
        (!from || updatedAt >= from) && (!to || updatedAt <= to);
  
      return matchesSearch && matchesDate;
    });
  
    setApplications(filtered);
  };
  
  

  return (
    <div className="bg-light min-vh-100">
      <Header user={userData} name={userData?.name} logout={logout} />

      <div className="container py-5">
        <div className="bg-white rounded-4 shadow p-4 mx-auto" style={{ maxWidth: 900 }}>
          <h2 className="fw-bold text-center mb-4">Đơn cư dân đã được duyệt</h2>

          <div className="mb-4 d-flex flex-column flex-md-row gap-3 justify-content-between">
  {/* Ô tìm kiếm */}
  <input
    type="text"
    className="form-control w-auto ms-1"
    placeholder="Tìm kiếm..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
  />

  {/* Ô lọc ngày + nút lọc */}
  <div className="d-flex align-items-center gap-2">
    <input
      type="date"
      className="form-control"
      style={{ width: '150px' }}
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
    />
    <input
      type="date"
      className="form-control"
      style={{ width: '150px' }}
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
    />
    <button className="btn btn-primary" onClick={handleDateFilter}>
      Lọc
    </button>
  </div>
</div>

          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : applications.length === 0 ? (
            <p className="text-center">Không có đơn xác nhận nào đã được duyệt.</p>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {applications.map((app) => (
                <div key={app._id} className="col">
                  <div className="card h-100 shadow-sm">
                    {app.documentImage && (
                      <img
                        src={app.documentImage}
                        className="card-img-top"
                        alt="Hình ảnh hợp đồng"
                        style={{ objectFit: "cover", height: 250 }}
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{app.fullName}</h5>
                      <p className="card-text">
                        <strong>Email:</strong> {app.email}<br />
                        <strong>SĐT:</strong> {app.phone}<br />
                        <strong>Căn hộ:</strong> {app.apartmentCode}<br />
                        <strong>Loại giấy tờ:</strong> {app.documentType}<br />
                        <strong>Thời gian hợp đồng:</strong><br />
                        {new Date(app.contractStart).toLocaleDateString()} -{" "}
                        {new Date(app.contractEnd).toLocaleDateString()}<br />
                        <strong>Trạng thái:</strong>{" "}
                        <span className="badge bg-success">{app.status}</span>
                      </p>
                    </div>
                    <div className="card-footer text-muted text-end small">
                      Cập nhật: {new Date(app.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="text-center mt-4 text-secondary small">
          &copy; 2025 Danh sách cư dân đã xác thực
        </footer>
      </div>
    </div>
  );
};

export default MyVerifiedApplications;
