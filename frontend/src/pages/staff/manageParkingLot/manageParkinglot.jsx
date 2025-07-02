import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import socket from '../../../server/socket';

const ManageParkingLot = () => {
  const [parkingRequests, setParkingRequests] = useState([]);
  const [role, setRole] = useState('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

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

      const mappedList = rawList
        .filter((item) => item['trạngThái'] === 'pending')
        .map((item) => ({
          _id: item.id,
          apartmentCode: item['mãCănHộ'],
          owner: item['tênChủSởHữu'],
          licensePlate: item['biểnSốXe'],
          vehicleType: item['loạiXe'],
          registerDate: item['ngàyĐăngKý'],
          status: item['trạngThái'] || 'pending',
        }));
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
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <aside className="bg-primary text-white p-4" style={{ minWidth: 240 }}>
        <h2 className="fw-bold mb-4 text-warning text-center">BẢN QUẢN LÝ</h2>
        <nav>
          <ul className="nav flex-column gap-2">
            <li className="nav-item"><Link to="/staff-dashboard" className="nav-link text-white">Dashboard</Link></li>
            <li className="nav-item"><Link to="/posts" className="nav-link text-white">Quản lý bài post</Link></li>
            <li className="nav-item"><Link to="/real-estate" className="nav-link text-white">Quản lý bất động sản</Link></li>
            <li className="nav-item">
              <span className="nav-link text-white fw-bold">Quản lý bãi đỗ xe ▼</span>
              <ul className="nav flex-column ms-3">
                <li className="nav-item"><Link to="/parkinglot-list" className="nav-link text-white">Danh sách bãi đỗ xe</Link></li>
                <li className="nav-item"><Link to="/manage-parkinglot" className="nav-link text-primary fw-bold bg-white">Quản lý yêu cầu gửi xe</Link></li>
              </ul>
            </li>
            <li className="nav-item"><Link to="/expenses" className="nav-link text-white">Quản lý chi phí</Link></li>
            <li className="nav-item"><Link to="/residentVerification" className="nav-link text-white">Quản lý người dùng</Link></li>
            <li className="nav-item"><Link to="/revenue" className="nav-link text-white">Quản lý doanh thu</Link></li>
            <li className="nav-item"><Link to="/resident-verify" className="nav-link text-white">Quản lý nhân khẩu</Link></li>
            <li className="nav-item"><Link to="/login" className="nav-link text-white">Đăng Xuất</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-grow-1 p-4">
        <div className="bg-white rounded-4 shadow p-4 mb-4">
          <h2 className="fw-bold mb-3">Quản lý yêu cầu gửi xe</h2>
          <div className="table-responsive">
            <table className="table table-bordered align-middle bg-white rounded-4 shadow">
              <thead className="table-primary">
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
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handleStatusChange(item._id, 'approve')}
                              className="btn btn-success btn-sm"
                            >
                              Phê duyệt
                            </button>
                            <button
                              onClick={() => handleStatusChange(item._id, 'reject')}
                              className="btn btn-danger btn-sm"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <i>Chỉ xem</i>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">Không có yêu cầu nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageParkingLot;