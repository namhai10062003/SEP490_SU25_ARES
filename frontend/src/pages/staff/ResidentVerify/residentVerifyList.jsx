import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './residentVerifyList.css';

const ResidentVerifyList = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectId, setRejectId] = useState(null);

  const fetchUnverifiedResidents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/residents/residents/unverified', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResidents(data.residents || []);
    } catch (err) {
      toast.error('❌ Lỗi tải danh sách nhân khẩu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnverifiedResidents();
  }, []);

  const handleVerify = async (id) => {
    if (!window.confirm('✅ Xác nhận đã kiểm tra và muốn xác minh nhân khẩu này?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/residents/verify-by-staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || '✅ Đã xác minh nhân khẩu');
        setResidents((prev) => prev.filter((r) => r._id !== id));
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('❌ Có lỗi xảy ra khi xác minh');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning('❗ Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/residents/reject-by-staff/${rejectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || '🚫 Đã từ chối nhân khẩu');
        setResidents((prev) => prev.filter((r) => r._id !== rejectId));
        setRejectId(null);
        setRejectReason('');
      } else {
        toast.error(result.message || '❌ Từ chối thất bại');
      }
    } catch (err) {
      toast.error('❌ Có lỗi xảy ra khi từ chối');
    }
  };

  const openImage = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">BẢN QUẢN LÝ</h2>
        <nav className="sidebar-menu">
          <ul>
            <li><Link to="/staff-dashboard">Dashboard</Link></li>
            <li><Link to="/posts">Quản lý bài post</Link></li>
            <li><Link to="/real-estate">Quản lý bất động sản</Link></li>
            <li><Link to="/manage-parkinglot">Quản lý bãi đỗ xe</Link></li>
            <li><Link to="/expenses">Quản lý chi phí</Link></li>
            <li><Link to="/residentVerification">Quản lý người dùng</Link></li>
            <li><Link to="/resident-verify" className="active">Quản lý nhân khẩu</Link></li>
            <li><Link to="/revenue">Quản lý doanh thu</Link></li>
            <li><Link to="/login">Đăng Xuất</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="resident-verify-container">
        <h2 className="resident-verify-title">Danh sách nhân khẩu chờ xác minh</h2>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : residents.length === 0 ? (
          <p>Không có nhân khẩu nào cần xác minh.</p>
        ) : (
          <table className="resident-verify-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Căn hộ</th>
                <th>Giới tính</th>
                <th>Ngày sinh</th>
                <th>Quan hệ</th>
                <th>Quốc tịch</th>
                <th>CCCD</th>
                <th>Ngày cấp</th>
                <th>Ảnh CCCD</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((r) => (
                <tr key={r._id}>
                  <td>{r.fullName}</td>
                  <td>{r.apartmentId?.apartmentCode || '---'}</td>
                  <td>{r.gender}</td>
                  <td>{r.dateOfBirth ? new Date(r.dateOfBirth).toLocaleDateString('vi-VN') : ''}</td>
                  <td>{r.relationWithOwner}</td>
                  <td>{r.nationality}</td>
                  <td>{r.idNumber}</td>
                  <td>{r.issueDate ? new Date(r.issueDate).toLocaleDateString('vi-VN') : ''}</td>
                  <td>
                    {r.documentFront ? (
                      <img
                        src={r.documentFront}
                        alt="front"
                        className="thumb"
                        onClick={() => openImage(r.documentFront)}
                      />
                    ) : '---'}
                  </td>
                  <td>
                    <button className="btn-verify" onClick={() => handleVerify(r._id)}>Xác minh</button>
                    <button className="btn-reject" onClick={() => setRejectId(r._id)}>Từ chối</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {rejectId && (
          <div className="reject-modal">
            <div className="modal-content">
              <h3>Lý do từ chối</h3>
              <textarea
                rows="4"
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="modal-actions">
                <button onClick={handleReject}>Gửi từ chối</button>
                <button onClick={() => {
                  setRejectId(null);
                  setRejectReason('');
                }}>Huỷ</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResidentVerifyList;
