import React, { useEffect, useState } from 'react';
import Header from '../../components/header';
import { useAuth } from "../../context/authContext";
import './ParkingRegistration.css';

const ParkingRegistration = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);

  useEffect(() => {
    setName(user?.name || null);
  }, [user]);

  return (
    <div className="parking-page">
      <Header user={user} name={name} logout={logout} />

      <div className="parking-form-wrapper">
  <h2 className="parking-form-title">Đăng ký bãi giữ xe</h2>

  <form className="parking-form-grid">
    {/* <div className="form-group">
      <label>Mã căn hộ *</label>
      <input type="text" placeholder="FP2-P2-18.01" />
    </div> */}

    <div className="form-group">
      <label>Tên căn hộ *</label>
      <input type="text" placeholder="P2-18.01" />
    </div>

    <div className="form-group">
      <label>Loại xe *</label>
      <select>
        <option>Ô tô</option>
        <option>Xe máy</option>
      </select>
    </div>

    <div className="form-group">
      <label>Tên chủ sở hữu *</label>
      <input type="text" placeholder="Hồ Thái Tuấn" />
    </div>

    <div className="form-group">
      <label>Biển số xe *</label>
      <input type="text" placeholder="43C1 - 168.37" />
    </div>

    <div className="form-group">
      <label>Số khung</label>
      <input type="text" placeholder="aaaaaaaaaaa11111cccc" />
    </div>

    <div className="form-group">
      <label>Số máy</label>
      <input type="text" placeholder="aaaaaaaaaaa11111cccc" />
    </div>

    <div className="form-group double">
      <label>Đăng ký tại *</label>
      <div className="double-select">
        <select>
          <option>Tỉnh / Thành Phố</option>
        </select>
        <select>
          <option>Quận / Huyện</option>
        </select>
      </div>
    </div>

    <div className="form-group">
      <label>Ngày đăng ký *</label>
      <input type="date" placeholder="Ngày đăng ký" />
    </div>

    <div className="form-group">
      <label>Ngày hết hạn</label>
      <input type="date" placeholder="Ngày hết hạn" />
    </div>

    <div className="form-group wide">
      <label>Mặt trước và mặt sau giấy tờ xe</label>
      <div className="image-upload-boxes">
        <div className="image-upload-box">
          <span>Mặt trước</span>
          <input type="file" />
        </div>
        <div className="image-upload-box">
          <span>Mặt sau</span>
          <input type="file" />
        </div>
      </div>
    </div>

    <div className="form-group full center">
      <button type="submit">Đăng Ký</button>
    </div>
  </form>
</div>


      <footer className="parking-footer">&copy; 2025 Bãi giữ xe</footer>
    </div>
  );
};

export default ParkingRegistration;
