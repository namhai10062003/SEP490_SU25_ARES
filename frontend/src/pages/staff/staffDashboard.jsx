import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from './staffNavbar'; // Sử dụng navbar chung
import h1 from "../images/banner.jpg";
import socket from '../../server/socket';
import 'react-toastify/dist/ReactToastify.css';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let userName = 'Người dùng';

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userName = decoded?.name || 'Người dùng';
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
    }
  }

  useEffect(() => {
    socket.on('staff:new-parking-request', (data) => {
      const message = data['Có đăng ký gửi xe mới cần duyệt'] || '📥 Có yêu cầu gửi xe mới';
      const registration = data?.registration || {};
      const { apartmentCode, owner, licensePlate, vehicleType } = registration;

      toast.info(
        `${message}: 🚗 Căn hộ ${apartmentCode} - ${owner} (${licensePlate}, ${vehicleType})`,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          onClick: () => {
            navigate(`/manage-parkinglot`);
          },
        }
      );
    });

    socket.on('new-resident-registered', (resident) => {
      const {
        fullName,
        gender,
        apartmentCode,
        relation,
      } = resident;
      toast.info(
        `📋 Nhân khẩu mới: ${fullName} (${gender}, ${relation}) – Căn hộ ${apartmentCode}`,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          onClick: () => {
            navigate('/resident-verify');
          },
        }
      );
    });

    return () => {
      socket.off('staff:new-parking-request');
      socket.off('new-resident-registered');
    };
  }, [navigate]);

  const stats = [
    { title: 'Bài Post', count: 128, color: 'primary' },
    { title: 'Căn hộ & BĐS', count: 56, color: 'success' },
    { title: 'Bãi đỗ xe', count: 78, color: 'warning' },
    { title: 'Chi phí', count: 45, color: 'danger' },
  ];

  const users = [
    { name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'Admin', date: '2024-01-15' },
    { name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'Nhân viên', date: '2024-02-12' },
    { name: 'Phạm Văn C', email: 'phamvanc@gmail.com', role: 'Khách hàng', date: '2024-03-10' },
  ];

  return (
    <div className="d-flex min-vh-100 bg-light">
      <ToastContainer />
      <StaffNavbar /> {/* Navbar dùng chung cho staff */}
      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Dashboard</h2>
          <div className="d-flex align-items-center gap-3">
            <input type="text" placeholder="Tìm kiếm..." className="form-control rounded-pill" style={{ width: 250 }} />
            <span className="fw-bold text-primary">{userName}</span>
          </div>
        </div>

        <h2 className="fw-bold mb-4">Bảng điều khiển</h2>

        <div className="row g-4 mb-4">
          {stats.map((item, idx) => (
            <div key={idx} className="col-12 col-md-6 col-lg-3">
              <div className={`card border-0 shadow h-100`}>
                <div className={`card-body text-center border-start border-5 border-${item.color}`}>
                  <div className="text-secondary mb-2">{item.title}</div>
                  <div className="fs-2 fw-bold mb-3">{item.count}</div>
                  <button className={`btn btn-${item.color} rounded-pill px-4`}>Xem chi tiết</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            <div className="card shadow h-100">
              <div className="card-body text-center">
                <h5 className="fw-bold mb-3">Doanh thu theo tháng</h5>
                <img src={h1} alt="Doanh thu" className="img-fluid rounded" style={{ maxHeight: 200, objectFit: "cover" }} />
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card shadow h-100">
              <div className="card-body text-center">
                <h5 className="fw-bold mb-3">Người đăng mới theo tháng</h5>
                <img src={h1} alt="Người dùng mới" className="img-fluid rounded" style={{ maxHeight: 200, objectFit: "cover" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">Danh sách người dùng</h5>
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;