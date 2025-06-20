import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import socket from '../../../server/socket';
import './ManageParkingLot.css';

const ManageParkingLot = () => {
  const [parkingRequests, setParkingRequests] = useState([]);
  const [role, setRole] = useState('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Socket listener để cập nhật trạng thái realtime
    socket.on('parkingStatusUpdated', ({ id, status }) => {
      if (isMountedRef.current) {
        setParkingRequests((prevList) =>
          prevList.filter((item) => item._id !== id)
        );
      }
    });

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const userRole = decoded.role || '';
        if (isMountedRef.current) {
          setRole(userRole);
          fetchParkingRequests(storedToken);
        }
      } catch (err) {
        if (isMountedRef.current)
          toast.error('Token không hợp lệ. Vui lòng đăng nhập lại.');
      }
    } else {
      if (isMountedRef.current)
        toast.error('Không tìm thấy token! Vui lòng đăng nhập lại.');
    }

    return () => {
      isMountedRef.current = false;
      socket.off('parkingStatusUpdated');
    };
  }, []);

  const fetchParkingRequests = async (token) => {
    try {
      const res = await fetch('http://localhost:4000/api/parkinglot/parkinglotall', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await res.json();
      const rawList = Array.isArray(responseData.data) ? responseData.data : [];
      console.log('✅ Dữ liệu fetch về:', rawList);


      const mappedList = rawList
  .filter((item) => item['trạngThái'] === 'pending')
  .map((item) => ({
    _id: item.id,
    apartmentCode: item['mãCănHộ'],
    owner: item['tênChủSởHữu'],
    licensePlate: item['biểnSốXe'],
    vehicleType: item['loạiXe'],
    registerDate: item['ngàyĐăngKý'],
    status: item['trạngThái'] || 'pending', // Cập nhật theo key backend
  }));
      console.log('✅ Sau khi lọc pending:', mappedList);
      if (isMountedRef.current) setParkingRequests(mappedList);
    } catch (err) {
      if (isMountedRef.current)
        toast.error(`Lỗi tải dữ liệu: ${err.message}`);
    }
  };

  const handleStatusChange = async (id, action) => {
    const token = localStorage.getItem('token');
    if (role !== 'staff') {
      toast.error('Bạn không có quyền thực hiện hành động này.');
      return;
    }

    const url = `http://localhost:4000/api/parkinglot/${action}/${id}`;
    const method = 'PATCH';
    const status = action === 'approve' ? 'approved' : 'rejected';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success(`✔️ Yêu cầu đã được ${status === 'approved' ? 'phê duyệt' : 'từ chối'}`);
        setParkingRequests((prevList) =>
          prevList.filter((item) => item._id !== id)
        );
        socket.emit('parkingStatusUpdated', { id, status });
      } else {
        const error = await res.json();
        toast.error(`Lỗi: ${error.message || 'Không thể cập nhật trạng thái'}`);
      }
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật trạng thái:', err);
      toast.error('Đã xảy ra lỗi, vui lòng thử lại.');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN'); 
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
            <li className="has-submenu">
  <span>Quản lý bãi đỗ xe ▾</span>
  <ul className="submenu">
    <li><Link to="/parkinglot-list">Danh sách bãi đỗ xe</Link></li>
    <li><Link to="/manage-parkinglot">Quản lý yêu cầu gửi xe</Link></li>
  </ul>
</li>
            <li><Link to="/expenses">Quản lý chi phí</Link></li>
            <li><Link to="/residentVerification">Quản lý người dùng</Link></li>
            <li><Link to="/revenue">Quản lý doanh thu</Link></li>
            <li><Link to="/login">Đăng Xuất</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-container">
        <div className="manage-parking-lot">
          <h2>Quản lý yêu cầu gửi xe</h2>

          <table className="parking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Căn hộ</th>
                <th>Chủ xe</th>
                <th>Biển số</th>
                <th>Loại xe</th>
                <th>Ngày đăng ký</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {parkingRequests.length > 0 ? (
                parkingRequests.map((item, idx) => (
                  <tr key={item._id}>
                    <td>{idx + 1}</td>
                    <td>{item.apartmentCode}</td>
                    <td>{item.owner}</td>
                    <td>{item.licensePlate}</td>
                    <td>{item.vehicleType}</td>
                    <td>{formatDate(item.registerDate)}</td>
                    <td>
                      {role === 'staff' ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(item._id, 'approve')}
                            className="approve-btn"
                          >
                            Phê duyệt
                          </button>
                          <button
                            onClick={() => handleStatusChange(item._id, 'reject')}
                            className="reject-btn"
                          >
                            Từ chối
                          </button>
                        </>
                      ) : (
                        <i>Chỉ xem</i>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">Không có yêu cầu nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ManageParkingLot;
