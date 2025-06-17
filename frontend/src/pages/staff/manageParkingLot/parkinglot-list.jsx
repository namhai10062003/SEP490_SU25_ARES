import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './manageParkinglot.css'; // Dùng lại CSS cũ

const ParkingLotList = () => {
  const [parkingList, setParkingList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [slotInfo, setSlotInfo] = useState({
    totalSlots: 0,
    usedSlots: 0,
    availableSlots: 0
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Không tìm thấy token! Vui lòng đăng nhập lại.');
      return;
    }

    try {
      jwtDecode(token); // kiểm tra token hợp lệ
      fetchParkingList(token);
      fetchSlotInfo(token);
    } catch (err) {
      toast.error('Token không hợp lệ. Vui lòng đăng nhập lại.');
    }

    return () => { isMountedRef.current = false; };
  }, []);

  const fetchParkingList = async (token) => {
    try {
      const res = await fetch('http://localhost:4000/api/parkinglot/parkinglotall', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const { data = [] } = await res.json();
      const filteredList = data
        .filter(item => item['trạngThái'] !== 'pending')
        .map(item => ({
          _id:           item.id || Math.random(),
          apartmentCode: item['mãCănHộ'],
          owner:         item['tênChủSởHữu'],
          licensePlate:  item['biểnSốXe'],
          vehicleType:   item['loạiXe'],
          registerDate:  item['ngàyĐăngKý'],
          status:        item['trạngThái'] || 'Không rõ',
        }));

      if (isMountedRef.current) {
        setParkingList(filteredList);
      }
    } catch (err) {
      toast.error(`Lỗi tải dữ liệu: ${err.message}`);
    }
  };

  const fetchSlotInfo = async (token) => {
    try {
      const res = await fetch('http://localhost:4000/api/parkinglot/parkinglot/available-slots', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (isMountedRef.current) {
        setSlotInfo(data);
      }
    } catch (err) {
      toast.error(`Không lấy được thông tin chỗ trống: ${err.message}`);
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
          <h2>Danh sách bãi đỗ xe</h2>

          {/* 🟦 Hiển thị tổng quan slot */}
          <div className="slot-summary" style={{ marginBottom: '1rem', fontSize: '1rem' }}>
            <strong>Tổng chỗ:</strong> {slotInfo.totalSlots} |{' '}
            <strong>Đã dùng:</strong> {slotInfo.usedSlots} |{' '}
            <strong>Còn trống:</strong> {slotInfo.availableSlots}
          </div>

          {/* 🟨 Bộ lọc trạng thái */}
          <div className="filter-container" style={{ marginBottom: '16px' }}>
            <label htmlFor="statusFilter">Lọc theo trạng thái: </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '4px 8px', marginLeft: '8px', borderRadius: '4px' }}
            >
              <option value="all">Tất cả</option>
              <option value="approved">Đã phê duyệt</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>

          <table className="parking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Căn hộ</th>
                <th>Chủ xe</th>
                <th>Biển số</th>
                <th>Loại xe</th>
                <th>Ngày đăng ký</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {parkingList.length > 0 ? (
                parkingList
                  .filter(item => {
                    if (statusFilter === 'all') return true;
                    return item.status === statusFilter;
                  })
                  .map((item, idx) => (
                    <tr key={item._id}>
                      <td>{idx + 1}</td>
                      <td>{item.apartmentCode}</td>
                      <td>{item.owner}</td>
                      <td>{item.licensePlate}</td>
                      <td>{item.vehicleType}</td>
                      <td>{formatDate(item.registerDate)}</td>
                      <td style={{
                        color: item.status === 'approved' ? 'green'
                              : item.status === 'rejected' ? 'red' : 'gray',
                        fontWeight: 'bold',
                      }}>
                        {item.status}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="7">Không có dữ liệu.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ParkingLotList;
