import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
const AdminResidentApproval = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResidentsToApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/residents/residents/to-approve-by-admin`, {
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
    confirmAlert({
      title: 'Xác nhận duyệt nhân khẩu',
      message: '✅ Bạn có chắc muốn duyệt nhân khẩu này không?',
      buttons: [
        {
          label: 'Có',
          onClick: async () => {
            try {
              const token = localStorage.getItem('token');
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/residents/verify-by-admin/${id}`, {
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
          }
        },
        {
          label: 'Không',
          onClick: () => { /* Không làm gì */ }
        }
      ]
    });
  };

  const openImage = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <aside className="bg-primary text-white p-3" style={{ minWidth: 220 }}>
        <h5 className="fw-bold text-uppercase mb-4">ADMIN PANEL</h5>
        <ul className="nav flex-column gap-1">
          <li><Link to="/admin-dashboard" className="nav-link text-white">• Tổng quan</Link></li>
          <li><Link to="/admin-dashboard/reports" className="nav-link text-white">• Quản lí bài Report</Link></li>
          <li><Link to="/admin-dashboard/create-account" className="nav-link text-white">• Tạo tài khoản</Link></li>
          <li><Link to="/admin-dashboard/posts" className="nav-link text-white">• Quản lí bài Post</Link></li>
          <li><Link to="/admin-dashboard/revenue" className="nav-link text-white">• Phân tích doanh thu</Link></li>
          <li><Link to="/admin-dashboard/notifications" className="nav-link text-white">• Gửi thông báo</Link></li>
          <li><Link to="/admin-dashboard/manage-user" className="nav-link text-white">• Quản lí User</Link></li>
          <li><Link to="/admin-dashboard/manage-staff" className="nav-link text-white">• Quản lí Staff</Link></li>
          <li><Link to="/admin-dashboard/manage-apartment" className="nav-link text-white">• Quản lí Căn hộ</Link></li>
          <li><Link to="/admin-dashboard/resident-verify-admin" className="nav-link active bg-white text-primary fw-bold">• Quản lí Nhân Khẩu</Link></li>
          <li><Link to="/admin-dashboard/manage-resident-verification" className="nav-link text-white">• Quản lý xác nhận cư dân</Link></li>
          <li><Link to="/login" className="nav-link text-white">Đăng xuất</Link></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-4 bg-light">
        <h3 className="mb-4 fw-bold text-primary">Danh sách nhân khẩu đã xác minh bởi nhân viên</h3>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2"></div>
            <div>Đang tải dữ liệu...</div>
          </div>
        ) : residents.length === 0 ? (
          <div className="alert alert-info">Không có nhân khẩu nào đang chờ admin duyệt.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle bg-white rounded-4 shadow-sm">
              <thead className="table-primary">
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
                          className="img-thumbnail"
                          style={{ width: 60, cursor: "pointer", borderRadius: 6 }}
                          onClick={() => openImage(r.documentFront)}
                        />
                      ) : '---'}
                    </td>
                    <td>
                      <button className="btn btn-success btn-sm px-3" onClick={() => handleApprove(r._id)}>
                        Duyệt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminResidentApproval;