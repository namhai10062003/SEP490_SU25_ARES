import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../../components/header";
import LoadingModal from "../../../../components/loadingModal";
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
  const [showModal, setShowModal] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchVerifiedApplications = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user?._id) {
        navigate("/login");
        return;
      }
      setLoading(true);
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

                    {/* Hiển thị nhiều ảnh từ documentImage */}
                    {Array.isArray(app.documentImage) && app.documentImage.length > 0 && (
                      <div style={{ overflowX: "auto", whiteSpace: "nowrap" }} className="p-2">
                        {app.documentImage.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Hợp đồng ${index + 1}`}
                            style={{
                              height: 200,
                              width: "auto",
                              marginRight: 10,
                              borderRadius: 8,
                              display: "inline-block",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setCurrentImages(app.documentImage);
                              setCurrentIndex(index);
                              setShowModal(true);
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="card-body">
                      <h5 className="card-title">{app.fullName}</h5>
                      <p className="card-text">
                        <strong>Email:</strong> {app.email}<br />
                        <strong>SĐT:</strong> {app.phone}<br />
                        <strong>Căn hộ:</strong> {app.apartmentCode}<br />
                        <strong>Loại giấy tờ:</strong> {app.documentType}<br />

                        {/* ✅ Hiển thị thời gian hợp đồng nếu là Hợp đồng cho thuê */}
                        {app.documentType.toLowerCase() === "hợp đồng cho thuê" && app.contractStart && app.contractEnd && (
                          <>
                            <strong>Thời gian hợp đồng:</strong>{" "}
                            {new Date(app.contractStart).toLocaleDateString()} - {new Date(app.contractEnd).toLocaleDateString()}<br />
                          </>
                        )}

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
      {showModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 9999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()} // không đóng khi click trong modal
          >
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Xem ảnh hợp đồng</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={currentImages[currentIndex]}
                  alt="Preview"
                  style={{ maxHeight: "70vh", maxWidth: "100%", borderRadius: 10 }}
                />
              </div>
              <div className="modal-footer justify-content-between">
                <button
                  className="btn btn-light"
                  onClick={() =>
                    setCurrentIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)
                  }
                  disabled={currentImages.length <= 1}
                >
                  ← Trước
                </button>
                <span>
                  {currentIndex + 1}/{currentImages.length}
                </span>
                <button
                  className="btn btn-light"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % currentImages.length)}
                  disabled={currentImages.length <= 1}
                >
                  Sau →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {loading && <LoadingModal />}
    </div>
  );
};

export default MyVerifiedApplications;
