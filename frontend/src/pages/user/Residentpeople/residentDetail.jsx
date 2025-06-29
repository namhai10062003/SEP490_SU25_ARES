import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../../../components/header';
import { useAuth } from '../../../../context/authContext';
import './residentDetail.css';

const ResidentDetail = () => {
  const { id } = useParams(); // 📌 ID từ URL
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setName(user?.name || null);

    const fetchResidentDetail = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch(`http://localhost:4000/api/residents/${id}`, {
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

  if (loading) return <div className="resident-detail-loading">Đang tải dữ liệu...</div>;
  if (!resident) return <div className="resident-detail-error">Không tìm thấy nhân khẩu.</div>;

  return (
    <div className="resident-detail-v2-page">
    <Header user={user} name={name} logout={logout} />
  
    <div className="resident-detail-v2-container">
      <h2 className="resident-detail-v2-title">Chi tiết nhân khẩu</h2>
  
      <div className="resident-detail-v2-info">
        <p><strong>Họ tên:</strong> {resident.fullName}</p>
        <p><strong>Giới tính:</strong> {resident.gender}</p>
        <p><strong>Ngày sinh:</strong> {resident.dateOfBirth ? new Date(resident.dateOfBirth).toLocaleDateString('vi-VN') : '---'}</p>
        <p><strong>Quan hệ với chủ hộ:</strong> {resident.relationWithOwner || '---'}</p>
        <p><strong>Ngày chuyển đến:</strong> {resident.moveInDate ? new Date(resident.moveInDate).toLocaleDateString('vi-VN') : '---'}</p>
        <p><strong>Quốc tịch:</strong> {resident.nationality}</p>
        <p><strong>Số CCCD:</strong> {resident.idNumber || '---'}</p>
        <p><strong>Ngày cấp CCCD:</strong> {resident.issueDate ? new Date(resident.issueDate).toLocaleDateString('vi-VN') : '---'}</p>
        <p><strong>Mã căn hộ:</strong> {resident.apartmentId?.apartmentCode || '---'}</p>
        <p><strong>Trạng thái:</strong> 
  {resident.verifiedByStaff ? (
    <span className="status approved">✅ Đã duyệt</span>
  ) : resident.rejectReason ? (
    <span className="status rejected">❌ Đã từ chối</span>
  ) : (
    <span className="status pending">🟡 Chờ xác minh</span>
  )}
</p>

{resident.rejectReason && (
  <div style={{ marginTop: '8px' }}>
    <strong>Lý do từ chối:</strong> {resident.rejectReason}
  </div>
)}
      </div>
  
      <div className="resident-detail-v2-images">
        <h3>Ảnh CCCD</h3>
        <div className="resident-detail-v2-images-wrapper">
          {resident.documentFront && (
            <img
              src={`${resident.documentFront}?v=${Date.now()}`}
              alt="Ảnh CCCD mặt trước"
              className="resident-detail-v2-image"
            />
          )}
          {resident.documentBack && (
            <img
              src={`${resident.documentBack}?v=${Date.now()}`}
              alt="Ảnh CCCD mặt sau"
              className="resident-detail-v2-image"
            />
          )}
        </div>
      </div>
  
      <Link to="/canho/nhaukhau" className="resident-detail-v2-back-btn">
        ← Quay lại danh sách nhân khẩu
      </Link>
    </div>
  
    <footer className="resident-detail-v2-footer">&copy; 2025 Nhân khẩu</footer>
  </div>
  
  );
};

export default ResidentDetail;
