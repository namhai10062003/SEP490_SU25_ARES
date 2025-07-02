import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import Header from '../../../../components/header';
import { useAuth } from '../../../../context/authContext';

const socket = io('http://localhost:4000'); // địa chỉ backend socket

const ParkingRegistrationList = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [carRegistrations, setCarRegistrations] = useState([]);
  const [bikeRegistrations, setBikeRegistrations] = useState([]);
  const [canRegister, setCanRegister] = useState(false);

  // Lấy quyền đăng ký
  useEffect(() => {
    const fetchUserApartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/residents/me/residents', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Không thể lấy danh sách căn hộ');

        const data = await res.json();
        const userId = String(user._id);

        const isEligible = data.some(apt => {
          const isOwner = String(apt.isOwner?._id) === userId;
          const isRenter = String(apt.isRenter?._id) === userId;
          if (isRenter) return true;
          if (isOwner && !apt.isRenter) return true;
          return false;
        });

        setCanRegister(isEligible);
      } catch (err) {
        console.error('Lỗi khi kiểm tra quyền đăng ký:', err);
      }
    };

    if (user?._id) {
      fetchUserApartments();
    }
  }, [user]);

  // Lấy danh sách đăng ký giữ xe
  useEffect(() => {
    setName(user?.name || null);

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/parkinglot/parkinglot', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Không thể lấy dữ liệu từ server');

        const result = await res.json();
        const data = result.data || [];

        const cars = data.filter(item => item.loạiXe?.toLowerCase() === 'ô tô');
        const bikes = data.filter(item => item.loạiXe?.toLowerCase() === 'xe máy');

        setCarRegistrations(cars);
        setBikeRegistrations(bikes);
      } catch (error) {
        console.error('❌ Lỗi khi lấy dữ liệu:', error);
      }
    };

    fetchData();

    socket.on('updateRegistrationStatus', updatedItem => {
      setCarRegistrations(prev =>
        prev.map(item => item.id === updatedItem.id ? { ...item, trạngThái: updatedItem.trạngThái } : item)
      );
      setBikeRegistrations(prev =>
        prev.map(item => item.id === updatedItem.id ? { ...item, trạngThái: updatedItem.trạngThái } : item)
      );
    });

    return () => {
      socket.off('updateRegistrationStatus');
    };
  }, [user]);

  const renderTable = (title, data) => (
    <div className="mb-5">
      <h3 className="fw-bold text-primary mb-3">{title}</h3>
      <div className="table-responsive">
        <table className="table table-bordered align-middle bg-white rounded-4 shadow-sm">
          <thead className="table-primary">
            <tr>
              <th>Chủ sở hữu</th>
              <th>Loại xe</th>
              <th>Biển số</th>
              <th>Mã căn hộ</th>
              <th>Giá</th>
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{item.tênChủSởHữu}</td>
                  <td>{item.loạiXe}</td>
                  <td>{item.biểnSốXe}</td>
                  <td>{item.mãCănHộ}</td>
                  <td>{item.giá}</td>
                  <td>{item.ngàyĐăngKý}</td>
                  <td>
                    {item.trạngThái === 'approved' ? (
                      <span className="badge bg-success">Đã đăng ký</span>
                    ) : item.trạngThái === 'rejected' ? (
                      <span className="badge bg-danger">Đã bị từ chối</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Đang đăng ký</span>
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/parkinglot/detail-parkinglot/${item.id}`}
                      className="btn btn-success btn-sm"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-3">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={name} logout={logout} />
      <div className="container py-5">
        <div className="bg-white rounded-4 shadow p-4 mx-auto" style={{ maxWidth: 1200 }}>
          <h2 className="fw-bold text-center mb-4">Danh sách đăng ký bãi giữ xe</h2>

          {canRegister && (
            <div className="d-flex justify-content-end mb-3">
              <Link to="/dichvu/dangkybaidoxe" className="btn btn-primary fw-bold">
                + Đăng ký mới
              </Link>
            </div>
          )}

          {renderTable('🚗 Ô tô', carRegistrations)}
          {renderTable('🏍️ Xe máy', bikeRegistrations)}
        </div>
        <footer className="text-center mt-4 text-secondary small">
          &copy; 2025 Bãi giữ xe
        </footer>
      </div>
    </div>
  );
};

export default ParkingRegistrationList;