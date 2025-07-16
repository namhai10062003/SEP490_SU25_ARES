import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../../../components/header';
import { useAuth } from "../../../../context/authContext";

const ParkingRegistrationDetail = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setName(user?.name || null);

    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parkinglot/detail-parkinglot/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
        const data = await res.json();
        setDetail(data.data || null);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết đăng ký bãi xe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, user]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="spinner-border text-primary me-2"></div>
      <span>Đang tải...</span>
    </div>
  );
  if (!detail) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <span className="text-danger fs-5">Không tìm thấy dữ liệu.</span>
    </div>
  );

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={name} logout={logout} />
      <div className="container py-5">
        <div className="bg-white rounded-4 shadow p-4 mx-auto" style={{ maxWidth: 700 }}>
          <h2 className="fw-bold text-center mb-4">Chi tiết đăng ký bãi đỗ xe</h2>
          <div className="row mb-4">
            <div className="col-12">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Chủ sở hữu:</strong>
                  <span>{detail.tênChủSởHữu}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>SĐT chủ sở hữu:</strong>
                  <span>{detail.sđtChủSởHữu || 'Chưa có'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Loại xe:</strong>
                  <span>{detail.loạiXe}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Biển số xe:</strong>
                  <span>{detail.biểnSốXe}</span>
                </li>
                {/* <li className="list-group-item d-flex justify-content-between">
                  <strong>Số khung:</strong>
                  <span>{detail.sốKhung}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Số máy:</strong>
                  <span>{detail.sốMáy}</span>
                </li> */}
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Giá:</strong>
                  <span>{detail.giá || '---'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Tên căn hộ:</strong>
                  <span>{detail.tênCănHộ || 'Chưa có'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Ngày đăng ký:</strong>
                  <span>{new Date(detail.ngàyĐăngKý).toLocaleDateString()}</span>
                </li>
                {/* <li className="list-group-item d-flex justify-content-between">
                  <strong>Ngày hết hạn:</strong>
                  <span>
                    {detail.ngàyHếtHạn !== '---'
                      ? new Date(detail.ngàyHếtHạn).toLocaleDateString()
                      : '---'}
                  </span>
                </li> */}
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Trạng thái:</strong>
                  <span>
                    {detail.trạngThái === 'approved' ? (
                      <span className="badge bg-success">Đã đăng ký</span>
                    ) : detail.trạngThái === 'rejected' ? (
                      <span className="badge bg-danger">Đã bị từ chối</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Đang đăng ký</span>
                    )}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="fw-bold mb-3 text-primary">Hình ảnh</h5>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <img
                  src={`${detail.ảnhTrước}?v=${Date.now()}`}
                  alt="Ảnh trước xe"
                  className="img-fluid rounded border border-2"
                  style={{ maxHeight: 180, objectFit: "contain", background: "#fafafa" }}
                />
              </div>
              {detail.ảnhSau && (
                <div className="col-12 col-md-6">
                  <img
                    src={`${detail.ảnhSau}?v=${Date.now()}`}
                    alt="Ảnh sau xe"
                    className="img-fluid rounded border border-2"
                    style={{ maxHeight: 180, objectFit: "contain", background: "#fafafa" }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <Link to="/dichvu/baidoxe" className="btn btn-primary px-4 fw-bold">
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
        <footer className="text-center mt-4 text-secondary small">
          &copy; 2025 Bãi giữ xe
        </footer>
      </div>
    </div>
  );
};

export default ParkingRegistrationDetail;