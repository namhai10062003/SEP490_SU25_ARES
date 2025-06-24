import { jwtDecode } from 'jwt-decode';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ import useNavigate
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import socket from '../../server/socket';
import h1 from "../images/banner.jpg";
import './StaffDashboard.css';

const StaffDashboard = () => {
  const navigate = useNavigate(); // ✅ khai báo navigate
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
    /* === Nghe sự kiện đăng ký bãi đỗ xe (giữ nguyên) === */
    socket.on('staff:new-parking-request', (data) => {
      console.log('📥 Dữ liệu socket nhận được:', data);
  
      const message = data['Có đăng ký gửi xe mới cần duyệt'] || '📥 Có yêu cầu gửi xe mới';
      const registration = data?.registration || {};
      const { apartmentCode, owner, licensePlate, vehicleType, _id } = registration;
  
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
  
    /* === Nghe sự kiện đăng ký nhân khẩu mới === */
    socket.on('new-resident-registered', (resident) => {
      console.log('📥 Nhân khẩu mới đăng ký:', resident);
  
      const {
        fullName,
        gender,
        apartmentCode,
        relation,
      } = resident;
    // 👉 Ghi log riêng phần quan hệ
    console.log('🧾 Quan hệ với chủ hộ:', relation);
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
  // ✅ thêm navigate vào dependency array

  const stats = [
    { title: 'Bài Post', count: 128, color: 'blue' },
    { title: 'Căn hộ & BĐS', count: 56, color: 'green' },
    { title: 'Bài đồ xe', count: 78, color: 'orange' },
    { title: 'Chi phí', count: 45, color: 'red' },
  ];

  const users = [
    { name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'Admin', date: '2024-01-15' },
    { name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'Nhân viên', date: '2024-02-12' },
    { name: 'Phạm Văn C', email: 'phamvanc@gmail.com', role: 'Khách hàng', date: '2024-03-10' },
  ];

  return (
    <div className="layout">
      <ToastContainer />
      <aside className="sidebar">
        <h2 className="sidebar-title">BẢN QUẢN LÝ</h2>
        <nav className="sidebar-menu">
          <ul>
            <li><Link to="/staff-dashboard">Dashboard</Link></li>
            <li><Link to="/posts">Quản lý bài post</Link></li>
            <li><Link to="/real-estate">Quản lý bất động sản</Link></li>
            <li><Link to="/manage-parkinglot">Quản lý bãi đồ xe</Link></li>
            <li><Link to="/staff-dashboard/manage-expenses">Quản lý chi phí</Link></li>
            <li><Link to="/residentVerification">Quản lý người dùng</Link></li>
            <li><Link to="/resident-verify">Quản lý nhân khẩu</Link></li>
            <li><Link to="/revenue">Quản lý doanh thu</Link></li>
            <li><Link to="/login">Đăng Xuất</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-container">
        <div className="topbar">
          <h2 className="dashboard-title">Dashboard</h2>
          <input type="text" placeholder="Tìm kiếm..." className="search-bar" />
          <div className="user-info">
            <span className="user-name">{userName}</span>
          </div>
        </div>

        <h2 className="dashboard-title">Bảng điều khiển</h2>

        <div className="stat-boxes">
          {stats.map((item, idx) => (
            <div key={idx} className={`stat-box ${item.color}`}>
              <div className="stat-title">{item.title}</div>
              <div className="stat-count">{item.count}</div>
              <button className="stat-btn">Xem chi tiết</button>
            </div>
          ))}
        </div>

        <div className="charts">
          <div className="chart-box">
            <h3>Doanh thu theo tháng</h3>
            <img src={h1} alt="Doanh thu" />
          </div>
          <div className="chart-box">
            <h3>Người đăng mới theo tháng</h3>
            <img src={h1} alt="Người dùng mới" />
          </div>
        </div>

        <div className="user-table">
          <h3>Danh sách người dùng</h3>
          <table>
            <thead>
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
      </main>
    </div>
  );
};

export default StaffDashboard;
