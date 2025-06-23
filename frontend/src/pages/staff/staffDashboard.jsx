import { jwtDecode } from 'jwt-decode';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ import useNavigate
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import socket from '../../server/socket';
import './StaffDashboard.css';

const StaffDashboard = ({ children }) => {
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
            navigate(`/manage-parkinglot`); // ✅ Đã fix lỗi navigate
          },
        }
      );
    });

    return () => {
      socket.off('staff:new-parking-request');
    };
  }, [navigate]); // ✅ thêm navigate vào dependency array



  return (
    <div className="layout">
      <ToastContainer />
      <aside className="sidebar">
        <h2 className="sidebar-title">BẢN QUẢN LÝ</h2>
        <nav className="sidebar-menu">
          <ul>
            <li><Link to="/staff-dashboard">Dashboard</Link></li>
            <li><Link to="/real-estate">Quản lý bất động sản</Link></li>
            <li><Link to="/manage-parkinglot">Quản lý bãi đồ xe</Link></li>
            <li><Link to="/expenses">Quản lý chi phí</Link></li>
            <li><Link to="/residentVerification">Quản lý người dùng</Link></li>
            <li><Link to="/revenue">Quản lý doanh thu</Link></li>
            <li><Link to="/login">Đăng Xuất</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-container">

        {children}
      </main>
    </div>
  );
};

export default StaffDashboard;
