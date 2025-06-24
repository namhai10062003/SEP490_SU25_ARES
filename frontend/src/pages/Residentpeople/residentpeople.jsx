import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/header';
import { useAuth } from '../../../context/authContext';
import './residentList.css';

const ResidentList = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [apartmentData, setData] = useState([]);
  const [modalReason, setModalReason] = useState(null); // { name, reason }

  useEffect(() => {
    setName(user?.name || null);

    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/residents/me/residents', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Không thể lấy dữ liệu từ server');

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('❌ Lỗi khi lấy dữ liệu:', err);
      }
    })();
  }, [user]);

  const renderApartment = (apt) => {
    const userId = String(user?._id);
    const isOwner = String(apt.isOwner?._id) === userId;
    const isRenter = String(apt.isRenter?._id) === userId;

    let roleText = '';
    if (isOwner && isRenter) {
      roleText = 'Chủ hộ & Người thuê – Bạn là cả chủ và người thuê';
    } else if (isOwner) {
      roleText = 'Chủ hộ';
    } else if (isRenter) {
      roleText = 'Người thuê';
    } else {
      const ownerName = apt.isOwner?.name || 'Không rõ';
      const renterName = apt.isRenter?.name || 'Không rõ';
      roleText = `Chủ hộ: ${ownerName} – Người thuê: ${renterName}`;
    }

    return (
      <div className="resident-block" key={apt.apartmentId}>
        <div className="resident-summary">
          <span>Mã căn hộ: <strong>{apt.apartmentCode}</strong></span>
          <span>Vai trò của bạn: <strong>{roleText}</strong></span>
          <span>Chủ căn hộ: <strong>{apt.ownerName || 'Không rõ'}</strong></span>
          <span>Số nhân khẩu: <strong>{apt.residentCount}</strong></span>
        </div>

        {((isOwner && !apt.isRenter) || isRenter) && (
  <div className="resident-actions">
    <Link to="/canho/dangkynhankhau" className="resident-register-btn">
      + Đăng ký nhân khẩu
    </Link>
  </div>
)}



        <div className="resident-table-wrapper">
          <table className="resident-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Quan hệ</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apt.residents.length ? (
                apt.residents.map((r) => (
                  <tr key={r._id}>
                    <td>{r.fullName}</td>
                    <td>{r.dateOfBirth ? new Date(r.dateOfBirth).toLocaleDateString('vi-VN') : ''}</td>
                    <td>{r.gender}</td>
                    <td>{r.relationWithOwner}</td>
                    <td>
                      {r.verifiedByStaff ? (
                        <span className="status approved">✅ Đã duyệt</span>
                      ) : r.rejectReason ? (
                        <span className="status rejected">❌ Đã từ chối</span>
                      ) : (
                        <span className="status pending">🟡 Chờ duyệt</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/residents/${r._id}`} className="resident-view-btn">Xem chi tiết</Link>
                      {r.rejectReason && (
                        <button
                          className="resident-reason-btn"
                          onClick={() => setModalReason({ name: r.fullName, reason: r.rejectReason })}
                        >
                          ❓ Lý do
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>
                    Chưa có nhân khẩu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="resident-page">
      <Header user={user} name={name} logout={logout} />

      <div className="resident-container">
        <h2 className="resident-title">Danh sách nhân khẩu theo căn hộ</h2>

        {apartmentData.length ? (
          apartmentData.map(renderApartment)
        ) : (
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>
            Hiện tại bạn không thuộc căn hộ nào nên không có dữ liệu để hiển thị.
          </p>
        )}
      </div>

      <footer className="resident-footer">&copy; 2025 Quản lý nhân khẩu</footer>

      {modalReason && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Lý do từ chối</h3>
            <p><strong>{modalReason.name}</strong> đã bị từ chối với lý do:</p>
            <p style={{ color: '#c00', margin: '1rem 0' }}>{modalReason.reason}</p>
            <button onClick={() => setModalReason(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentList;
