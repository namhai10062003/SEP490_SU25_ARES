import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

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
      jwtDecode(token);
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
          _id: item.id || Math.random(),
          apartmentCode: item['mãCănHộ'],
          owner: item['tênChủSởHữu'],
          licensePlate: item['biểnSốXe'],
          vehicleType: item['loạiXe'],
          registerDate: item['ngàyĐăngKý'],
          status: item['trạngThái'] || 'Không rõ',
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
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <aside className="bg-primary text-white p-4" style={{ minWidth: 240 }}>
        <h2 className="fw-bold mb-4 text-warning text-center">BẢN QUẢN LÝ</h2>
        <nav>
          <ul className="nav flex-column gap-2">
            <li className="nav-item"><Link to="/staff-dashboard" className="nav-link text-white">Dashboard</Link></li>
            <li className="nav-item"><Link to="/posts" className="nav-link text-white">Quản lý bài post</Link></li>
            <li className="nav-item">
              <span className="nav-link text-white fw-bold">Quản lý bãi đỗ xe ▼</span>
              <ul className="nav flex-column ms-3">
                <li className="nav-item"><Link to="/parkinglot-list" className="nav-link text-primary fw-bold bg-white">Danh sách bãi đỗ xe</Link></li>
                <li className="nav-item"><Link to="/manage-parkinglot" className="nav-link text-white">Quản lý yêu cầu gửi xe</Link></li>
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
          <h2 className="fw-bold mb-3">Danh sách bãi đỗ xe</h2>
          <div className="mb-3">
            <span className="me-3"><strong>Tổng chỗ:</strong> {slotInfo.totalSlots}</span>
            <span className="me-3"><strong>Đã dùng:</strong> {slotInfo.usedSlots}</span>
            <span><strong>Còn trống:</strong> {slotInfo.availableSlots}</span>
          </div>
          <div className="mb-3">
            <label className="me-2">Lọc theo trạng thái:</label>
            <select
              className="form-select d-inline-block w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="approved">Đã phê duyệt</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
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
                        <td>
                          <span className={
                            item.status === 'approved'
                              ? 'badge bg-success'
                              : item.status === 'rejected'
                                ? 'badge bg-danger'
                                : 'badge bg-secondary'
                          }>
                            {item.status === 'approved'
                              ? 'Đã phê duyệt'
                              : item.status === 'rejected'
                                ? 'Đã từ chối'
                                : item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">Không có dữ liệu.</td>
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

export default ParkingLotList;