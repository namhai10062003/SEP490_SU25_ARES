import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import Header from '../../components/header';
import { useAuth } from '../../context/authContext';
import './parkingRegistration.css';

const socket = io('http://localhost:4000'); // địa chỉ backend socket

const ParkingRegistrationList = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [carRegistrations, setCarRegistrations] = useState([]);
  const [bikeRegistrations, setBikeRegistrations] = useState([]);

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

    // Kết nối socket và lắng nghe sự kiện cập nhật
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
    <div className="parking-section">
      <h3 className="parking-section-title">{title}</h3>
      <div className="parking-list-table-wrapper">
        <table className="parking-list-table">
          <thead>
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
    <span className="status approved">✅ Đã đăng ký</span>
  ) : item.trạngThái === 'rejected' ? (
    <span className="status rejected">❌ Đã bị từ chối</span>
  ) : (
    <span className="status pending">🟡 Đang đăng ký</span>
  )}
</td>
                  <td>
                    <Link
                      to={`/parkinglot/detail-parkinglot/${item.id}`}
                      className="parking-list-view-btn"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '1rem' }}>
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
    <div className="parking-list-page">
      <Header user={user} name={name} logout={logout} />
      <div className="parking-list-container">
        <h2 className="parking-list-title">Danh sách đăng ký bãi giữ xe</h2>
        <div className="parking-list-actions">
          <Link to="/dichvu/dangkybaidoxe" className="parking-register-btn">
            + Đăng ký mới
          </Link>
        </div>
        {renderTable('🚗 Ô tô', carRegistrations)}
        {renderTable('🏍️ Xe máy', bikeRegistrations)}
      </div>
      <footer className="parking-list-footer">&copy; 2025 Bãi giữ xe</footer>
    </div>
  );
};

export default ParkingRegistrationList;
