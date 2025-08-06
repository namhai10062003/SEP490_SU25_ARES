import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../../../components/header';
import { useAuth } from '../../../../context/authContext';

const ResidenceDeclarationDetail = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [declaration, setDeclaration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setName(user?.name || null);

    const fetchDeclarationDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/residence-declaration/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
        const result = await res.json();
        setDeclaration(result.data || null);
      } catch (err) {
        console.error('❌ Lỗi khi fetch chi tiết hồ sơ tạm trú/tạm vắng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeclarationDetail();
  }, [id, user]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary me-2"></div>
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  if (!declaration)
    return (
      <div className="text-center py-5 text-danger">
        Không tìm thấy hồ sơ tạm trú/tạm vắng.
      </div>
    );

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={name} logout={logout} />

      <div className="container py-5">
        <div className="bg-white rounded-4 shadow p-4 mx-auto" style={{ maxWidth: 900 }}>
          <h2 className="fw-bold mb-4 text-center border-start border-4 border-primary ps-3">
            Chi tiết hồ sơ tạm trú / tạm vắng
          </h2>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>Loại hồ sơ:</strong> {declaration.type}
                </li>
                <li className="list-group-item">
                  <strong>Họ tên:</strong> {declaration.fullName}
                </li>
                <li className="list-group-item">
                  <strong>Giới tính:</strong> {declaration.gender}
                </li>
                <li className="list-group-item">
                  <strong>Ngày sinh:</strong>{" "}
                  {declaration.dateOfBirth
                    ? new Date(declaration.dateOfBirth).toLocaleDateString('vi-VN')
                    : "---"}
                </li>
                <li className="list-group-item">
                  <strong>Quan hệ với chủ hộ:</strong> {declaration.relationWithOwner || "---"}
                </li>
                <li className="list-group-item">
                  <strong>Quốc tịch:</strong> {declaration.nationality}
                </li>
                <li className="list-group-item">
                  <strong>Số CCCD:</strong> {declaration.idNumber || "---"}
                </li>
                <li className="list-group-item">
                  <strong>Mã căn hộ:</strong> {declaration.apartmentId?.apartmentCode || "---"}
                </li>
                <li className="list-group-item">
                  <strong>Thời gian tạm trú/tạm vắng:</strong>{" "}
                  {declaration.startDate
                    ? new Date(declaration.startDate).toLocaleDateString('vi-VN')
                    : "---"}{" "}
                  →{" "}
                  {declaration.endDate
                    ? new Date(declaration.endDate).toLocaleDateString('vi-VN')
                    : "---"}
                </li>
                <li className="list-group-item">
                  <strong>Trạng thái:</strong>{" "}
                  {declaration.verifiedByStaff === "true" ? (
                    <span className="badge bg-success">✅ Đã duyệt</span>
                  ) : declaration.verifiedByStaff === "false" ? (
                    <span className="badge bg-danger">❌ Đã từ chối</span>
                  ) : (
                    <span className="badge bg-warning text-dark">🟡 Chờ duyệt</span>
                  )}
                </li>
                {declaration.rejectReason && (
                  <li className="list-group-item text-danger">
                    <strong>Lý do từ chối:</strong> {declaration.rejectReason}
                  </li>
                )}
              </ul>
            </div>

            {/* Ảnh giấy tờ */}
            <div className="col-md-6">
              <h5 className="fw-bold mb-3">Ảnh giấy tạm trú / tạm vắng</h5>
              {declaration.documentImage && (
                <img
                  src={`${declaration.documentImage}?v=${Date.now()}`}
                  alt="Giấy tạm trú / tạm vắng"
                  className="img-thumbnail"
                  style={{ maxWidth: "100%", height: 300, objectFit: "contain" }}
                />
              )}
            </div>
          </div>

          <Link to="/residence-declaration/list" className="btn btn-primary rounded-pill mt-3">
            ← Quay lại danh sách hồ sơ
          </Link>
        </div>
        <footer className="text-center mt-4 text-secondary small">
          © 2025 Hồ sơ tạm trú / tạm vắng
        </footer>
      </div>
    </div>
  );
};

export default ResidenceDeclarationDetail;
