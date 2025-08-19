import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../../../components/header';
import { useAuth } from '../../../../context/authContext';

const ResidentDetail = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setName(user?.name || null);

    const fetchResidentDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/residents/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
        const result = await res.json();
        setResident(result.data || null);
      } catch (err) {
        console.error('❌ Lỗi khi fetch chi tiết nhân khẩu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResidentDetail();
  }, [id, user]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary me-2"></div>
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  if (!resident)
    return (
      <div className="text-center py-5 text-danger">
        Không tìm thấy nhân khẩu.
      </div>
    );

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={name} logout={logout} />

      <div className="container py-5">
        <div className="bg-white rounded-4 shadow p-4 mx-auto" style={{ maxWidth: 900 }}>
          <h2 className="fw-bold mb-4 text-center border-start border-4 border-primary ps-3">
            Chi tiết nhân khẩu
          </h2>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>Họ tên:</strong> {resident.fullName}
                </li>
                <li className="list-group-item">
                  <strong>Giới tính:</strong> {resident.gender}
                </li>
                <li className="list-group-item">
                  <strong>Ngày sinh:</strong>{" "}
                  {resident.dateOfBirth
                    ? new Date(resident.dateOfBirth).toLocaleDateString('vi-VN')
                    : "---"}
                </li>
                <li className="list-group-item">
                  <strong>Quan hệ với chủ hộ:</strong> {resident.relationWithOwner || "---"}
                </li>
                <li className="list-group-item">
                  <strong>Ngày chuyển đến:</strong>{" "}
                  {resident.moveInDate
                    ? new Date(resident.moveInDate).toLocaleDateString('vi-VN')
                    : "---"}
                </li>
                <li className="list-group-item">
                  <strong>Quốc tịch:</strong> {resident.nationality}
                </li>
                <li className="list-group-item">
                  <strong>Số CCCD/ Giấy khai sinh:</strong> {resident.idNumber || "---"}
                </li>
                <li className="list-group-item">
                  <strong>Ngày cấp:</strong>{" "}
                  {resident.issueDate
                    ? new Date(resident.issueDate).toLocaleDateString('vi-VN')
                    : "---"}
                </li>
                <li className="list-group-item">
                  <strong>Mã căn hộ:</strong> {resident.apartmentId?.apartmentCode || "---"}
                </li>
                <li className="list-group-item">
                  <strong>Trạng thái:</strong>{" "}
                  {resident.verifiedByStaff ? (
                    <span className="badge bg-success">✅ Đã duyệt</span>
                  ) : resident.rejectReason ? (
                    <span className="badge bg-danger">❌ Đã từ chối</span>
                  ) : (
                    <span className="badge bg-warning text-dark">🟡 Chờ xác minh</span>
                  )}
                </li>
                {resident.rejectReason && (
                  <li className="list-group-item text-danger">
                    <strong>Lý do từ chối:</strong> {resident.rejectReason}
                  </li>
                )}
              </ul>
            </div>
            <div className="col-md-6">
              <h5 className="fw-bold mb-3">Ảnh CCCD/ Giấy khai sinh</h5>
              <div className="d-flex gap-3 flex-wrap">
                {resident.documentFront && (
                  <img
                    src={`${resident.documentFront}?v=${Date.now()}`}
                    alt="Ảnh CCCD mặt trước"
                    className="img-thumbnail"
                    style={{ maxWidth: "48%", height: 160, objectFit: "contain" }}
                  />
                )}
                {resident.documentBack && (
                  <img
                    src={`${resident.documentBack}?v=${Date.now()}`}
                    alt="Ảnh CCCD mặt sau"
                    className="img-thumbnail"
                    style={{ maxWidth: "48%", height: 160, objectFit: "contain" }}
                  />
                )}
              </div>
            </div>
          </div>

          <Link to="/canho/nhaukhau" className="btn btn-primary rounded-pill mt-3">
            ← Quay lại danh sách nhân khẩu
          </Link>
        </div>
        <footer className="text-center mt-4 text-secondary small">
          © 2025 Nhân khẩu
        </footer>
      </div>
    </div>
  );
};

export default ResidentDetail;