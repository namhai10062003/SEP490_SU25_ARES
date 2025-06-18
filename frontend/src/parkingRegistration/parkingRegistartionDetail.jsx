import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../components/header';
import { useAuth } from "../../context/authContext";
import './parkingRegistrationDetail.css';

const ParkingRegistrationDetail = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setName(user?.name || null);

    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:4000/api/parkinglot/detail-parkinglot/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
        const data = await res.json();
        setDetail(data.data || null);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết đăng ký bãi xe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, user]);

  if (loading) return <div className="parking-detail-v2-loading">Đang tải...</div>;
  if (!detail) return <div className="parking-detail-v2-error">Không tìm thấy dữ liệu.</div>;

  return (
    <div className="parking-detail-v2-page">
      <Header user={user} name={name} logout={logout} />
      <div className="parking-detail-v2-container">
        <h2 className="parking-detail-v2-title">Chi tiết đăng ký bãi đỗ xe</h2>

        <div className="parking-detail-v2-info">
          <p><strong>Chủ sở hữu:</strong> {detail.tênChủSởHữu}</p>
          <p><strong>SĐT chủ sở hữu:</strong> {detail.sđtChủSởHữu || 'Chưa có'}</p>
          <p><strong>Loại xe:</strong> {detail.loạiXe}</p>
          <p><strong>Biển số xe:</strong> {detail.biểnSốXe}</p>
          <p><strong>Số khung:</strong> {detail.sốKhung}</p>
          <p><strong>Số máy:</strong> {detail.sốMáy}</p>
          <p><strong>Giá:</strong> {detail.giá || '---'}</p>
          <p><strong>Tên căn hộ:</strong> {detail.tênCănHộ || 'Chưa có'}</p>
          <p><strong>Ngày đăng ký:</strong> {new Date(detail.ngàyĐăngKý).toLocaleDateString()}</p>
          <p><strong>Ngày hết hạn:</strong> {detail.ngàyHếtHạn !== '---' ? new Date(detail.ngàyHếtHạn).toLocaleDateString() : '---'}</p>
          <p><strong>Trạng thái:</strong> {detail.trạngThái}</p>
        </div>

        <div className="parking-detail-v2-images">
          <h3>Hình ảnh</h3>
          <img
            src={`${detail.ảnhTrước}?v=${Date.now()}`}
            alt="Ảnh trước xe"
            className="parking-detail-v2-image"
          />
          {detail.ảnhSau && (
            <img
              src={`${detail.ảnhSau}?v=${Date.now()}`}
              alt="Ảnh sau xe"
              className="parking-detail-v2-image"
            />
          )}
        </div>

        <Link to="/dichvu/baidoxe" className="parking-detail-v2-back-btn">
          ← Quay lại danh sách
        </Link>
      </div>

      <footer className="parking-detail-v2-footer">&copy; 2025 Bãi giữ xe</footer>
    </div>
  );
};

export default ParkingRegistrationDetail;
