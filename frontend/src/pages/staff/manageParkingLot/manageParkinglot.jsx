import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import socket from '../../../server/socket';
import StaffNavbar from '../../staff/staffNavbar'; // ✅ Thêm dòng này

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parkinglot/parkinglotall`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await res.json();
      console.log(responseData);
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
      toast.error('🚫 Bạn không có quyền thực hiện hành động này.');
      return;
    }

    const url = `${import.meta.env.VITE_API_URL}/api/parkinglot/${action}/${id}`;
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
        if (status === 'approved') {
          toast.success('✅ Phê duyệt yêu cầu gửi xe thành công');
        } else {
          toast('🚫 Đã từ chối yêu cầu gửi xe', {
            style: {
              backgroundColor: 'red',
              color: 'white',
            },
          });
        }

        setParkingRequests((prevList) =>
          prevList.filter((item) => item._id !== id)
        );
        socket.emit('parkingStatusUpdated', { id, status });
      } else {
        toast.error(status === 'approved' ? '❌ Phê duyệt thất bại' : '❌ Từ chối thất bại');
      }
    } catch (err) {
      toast.error('❌ Có lỗi xảy ra, vui lòng thử lại sau');
      console.error('❌ Lỗi khi cập nhật trạng thái:', err);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* ✅ Thay aside bằng component StaffNavbar */}
      <StaffNavbar />

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
