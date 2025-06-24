import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './residentVerifyListByAdmin.css'; // dùng CSS đã sửa theo sidebar mới

const AdminResidentApproval = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResidentsToApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/residents/residents/to-approve-by-admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResidents(data.residents || []);
    } catch (err) {
      toast.error('❌ Lỗi tải danh sách nhân khẩu cần duyệt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidentsToApprove();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('✅ Bạn có chắc muốn duyệt nhân khẩu này không?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/residents/verify-by-admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        setResidents((prev) => prev.filter((r) => r._id !== id));
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('❌ Lỗi xác minh bởi admin');
    }
  };

  const openImage = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="adminx-layout">
      {/* === Sidebar mới === */}
      <aside className="adminx-sidebar">
        <h5 className="adminx-sidebar-title">ADMIN PANEL</h5>
        <ul className="adminx-nav-list">
          <li><Link to="/admin-dashboard" className="adminx-nav-link">• Tổng quan</Link></li>
          <li><Link to="/admin-dashboard/reports" className="adminx-nav-link">• Quản lí bài Report</Link></li>
          <li><Link to="/admin-dashboard/create-account" className="adminx-nav-link">• Tạo tài khoản</Link></li>
          <li><Link to="/admin-dashboard/posts" className="adminx-nav-link">• Quản lí bài Post</Link></li>
          <li><Link to="/admin-dashboard/revenue" className="adminx-nav-link">• Phân tích doanh thu</Link></li>
          <li><Link to="/admin-dashboard/notifications" className="adminx-nav-link">• Gửi thông báo</Link></li>
          <li><Link to="/admin-dashboard/manage-user" className="adminx-nav-link">• Quản lí User</Link></li>
          <li><Link to="/admin-dashboard/manage-staff" className="adminx-nav-link">• Quản lí Staff</Link></li>
          <li><Link to="/admin-dashboard/manage-apartment" className="adminx-nav-link">• Quản lí Căn hộ</Link></li>
          <li><Link to="/admin-dashboard/resident-verify-admin" className="adminx-nav-link active">• Quản lí Nhân Khẩu</Link></li>
          <li><Link to="/admin-dashboard/manage-resident-verification" className="text-white text-decoration-none d-block py-1">• Quản lý xác nhận cư dân</Link></li>
          <li><Link to="/login" className="adminx-nav-link">Đăng xuất</Link></li>
        </ul>
      </aside>

      {/* === Main Content === */}
      <main className="adminx-main">
        <h3>Danh sách nhân khẩu đã xác minh bởi nhân viên</h3>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : residents.length === 0 ? (
          <p>Không có nhân khẩu nào đang chờ admin duyệt.</p>
        ) : (
          <table className="resident-verify-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Căn hộ</th>
                <th>Giới tính</th>
                <th>Ngày sinh</th>
                <th>Quan hệ</th>
                <th>CCCD</th>
                <th>Ngày cấp</th>
                <th>Ảnh CCCD</th>
                <th>Duyệt</th>
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
                  <td>{r.idNumber}</td>
                  <td>{r.issueDate ? new Date(r.issueDate).toLocaleDateString('vi-VN') : ''}</td>
                  <td>
                    {r.documentFront ? (
                      <img
                        src={r.documentFront}
                        alt="CCCD"
                        className="thumb"
                        onClick={() => openImage(r.documentFront)}
                      />
                    ) : '---'}
                  </td>
                  <td>
                    <button className="btn-verify" onClick={() => handleApprove(r._id)}>
                      Duyệt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default AdminResidentApproval;
