import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // CSS mặc định
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import Header from '../../../../components/header';
import { useAuth } from '../../../../context/authContext';

const socket = io(`${import.meta.env.VITE_API_URL}`); // địa chỉ backend socket

const ParkingRegistrationList = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [carRegistrations, setCarRegistrations] = useState([]);
  const [bikeRegistrations, setBikeRegistrations] = useState([]);
  const [canRegister, setCanRegister] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
const [filterPlate, setFilterPlate] = useState('');
const [filterApartment, setFilterApartment] = useState('');
const [sortOption, setSortOption] = useState('date_desc');
const [loading, setLoading] = useState(true);
// hàm sort dữ liệu 
const getFilteredAndSortedData = (data) => {
  const cleanedPlate = filterPlate.toLowerCase().trim();
  const cleanedApartment = filterApartment.toLowerCase().trim();

  const filtered = data.filter(item => {
    const matchesStatus =
      filterStatus === 'all' || item.trạngThái === filterStatus;
    const matchesPlate = item.biểnSốXe?.toLowerCase().includes(cleanedPlate);
    const matchesApartment = item.mãCănHộ?.toLowerCase().includes(cleanedApartment);
    return matchesStatus && matchesPlate && matchesApartment;
  });

  const sorted = [...filtered];
  if (sortOption === 'date_desc') {
    sorted.sort((a, b) => new Date(b.ngàyĐăngKý) - new Date(a.ngàyĐăngKý));
  } else if (sortOption === 'date_asc') {
    sorted.sort((a, b) => new Date(a.ngàyĐăngKý) - new Date(b.ngàyĐăngKý));
  } else if (sortOption === 'price_asc') {
    sorted.sort((a, b) => a.giá - b.giá);
  } else if (sortOption === 'price_desc') {
    sorted.sort((a, b) => b.giá - a.giá);
  }

  return sorted;
};

// hàm hủy khi mà người dùng không muốn đăng ký nữa 
const handleCancel = (id) => {
  confirmAlert({
    title: 'Xác nhận huỷ đơn',
    message: 'Bạn chắc chắn muốn huỷ đơn đăng ký gửi xe này?',
    buttons: [
      {
        label: 'Có, huỷ ngay',
        onClick: () => doCancel(id),
      },
      {
        label: 'Không',
        onClick: () => {},
      },
    ],
  });
};

const doCancel = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parkinglot/cancel/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Không thể huỷ đơn');

    setCarRegistrations(prev => prev.filter(p => p.id !== id));
    setBikeRegistrations(prev => prev.filter(p => p.id !== id));

    toast.success('✅ Đã huỷ đơn đăng ký gửi xe thành công.');
  } catch (err) {
    console.error('❌ Lỗi huỷ đơn:', err);
    toast.error('🚫 Đã có lỗi xảy ra khi huỷ đơn.');
  }
};


  // Lấy quyền đăng ký
  useEffect(() => {
    const fetchUserApartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/residents/me/residents`, {
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
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parkinglot/parkinglot`, {
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
      } finally {
        setLoading(false);
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
                  <td className="d-flex gap-2">
  <Link
    to={`/parkinglot/detail-parkinglot/${item.id}`}
    className="btn btn-success btn-sm"
  >
    Xem chi tiết
  </Link>

  {item.trạngThái === 'pending' && (
  <button
    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 shadow-sm px-3 py-1 rounded-pill"
    onClick={() => handleCancel(item.id)}
    title="Huỷ đăng ký gửi xe"
  >
    <i className="bi bi-x-circle-fill"></i>
    Huỷ
  </button>
)}

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
          <div className="row">
  {/* Sidebar lọc bên trái */}
  <div className="col-md-3">
    <div className="bg-light p-3 rounded shadow-sm mb-4">
      <h5 className="fw-bold mb-3">
        <i className="bi bi-funnel me-2"></i>Bộ lọc
      </h5>

      {/* Trạng thái */}
      <label className="form-label">Trạng thái</label>
      <select
        className="form-select mb-3"
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="all">Tất cả</option>
        <option value="pending">Đang đăng ký</option>
        <option value="approved">Đã đăng ký</option>
        <option value="rejected">Bị từ chối</option>
      </select>

      {/* Biển số */}
      <label className="form-label">Biển số xe</label>
      <input
        type="text"
        className="form-control mb-3"
        value={filterPlate}
        onChange={(e) => setFilterPlate(e.target.value)}
        placeholder="Nhập biển số"
      />

      {/* Căn hộ */}
      <label className="form-label">Mã căn hộ</label>
      <input
        type="text"
        className="form-control mb-3"
        value={filterApartment}
        onChange={(e) => setFilterApartment(e.target.value)}
        placeholder="Nhập mã căn hộ"
      />

      {/* Sort */}
      <label className="form-label">Sắp xếp</label>
      <select
        className="form-select mb-3"
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
      >
        <option value="date_desc">Ngày đăng ký (mới nhất)</option>
        <option value="date_asc">Ngày đăng ký (cũ nhất)</option>
        <option value="price_asc">Giá tăng dần</option>
        <option value="price_desc">Giá giảm dần</option>
      </select>

      {/* Reset */}
      <button
        className="btn btn-outline-secondary w-100"
        onClick={() => {
          setFilterStatus('all');
          setFilterPlate('');
          setFilterApartment('');
          setSortOption('date_desc');
        }}
      >
        Xoá bộ lọc
      </button>
    </div>
  </div>

  {/* Bảng hiển thị bên phải */}
  <div className="col-md-9">
    {loading ? (
      <p className="text-center text-secondary py-4">⏳ Đang tải dữ liệu...</p>
    ) : (
      <>
        {renderTable('🚗 Ô tô', getFilteredAndSortedData(carRegistrations))}
{renderTable('🏍️ Xe máy', getFilteredAndSortedData(bikeRegistrations))}
      </>
    )}
  </div>
</div>
          {/* <div className="col-md-3">
  <label className="form-label">Sắp xếp</label>
  <select
    className="form-select"
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
  >
    <option value="date_desc">Ngày đăng ký (mới nhất)</option>
    <option value="date_asc">Ngày đăng ký (cũ nhất)</option>
    <option value="price_asc">Giá tăng dần</option>
    <option value="price_desc">Giá giảm dần</option>
  </select>
</div> */}
{/* <div className="row g-3 mb-4">
  <div className="col-md-3">
    <label className="form-label">Trạng thái</label>
    <select
      className="form-select"
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
    >
      <option value="all">Tất cả</option>
      <option value="pending">Đang đăng ký</option>
      <option value="approved">Đã đăng ký</option>
      <option value="rejected">Bị từ chối</option>
    </select>
  </div>
  <div className="col-md-3">
    <label className="form-label">Biển số xe</label>
    <input
      type="text"
      className="form-control"
      value={filterPlate}
      onChange={(e) => setFilterPlate(e.target.value)}
      placeholder="Nhập biển số"
    />
  </div>
  <div className="col-md-3">
    <label className="form-label">Mã căn hộ</label>
    <input
      type="text"
      className="form-control"
      value={filterApartment}
      onChange={(e) => setFilterApartment(e.target.value)}
      placeholder="Nhập mã căn hộ"
    />
  </div>
</div> */}

{/* {loading ? (
  
  <p className="text-center text-secondary py-4">⏳ Đang tải dữ liệu...</p>
  
) : (
  <>
    {renderTable('🚗 Ô tô', applySort(applyFilters(carRegistrations)))}
    {renderTable('🏍️ Xe máy', applySort(applyFilters(bikeRegistrations)))}
  </>
)} */}
        </div>
        
        <footer className="text-center mt-4 text-secondary small">
          &copy; 2025 Bãi giữ xe
        </footer>
      </div>
    </div>
  );
};

export default ParkingRegistrationList;