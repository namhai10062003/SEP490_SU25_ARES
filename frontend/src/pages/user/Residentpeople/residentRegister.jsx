import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '../../../../components/header';
import { useAuth } from '../../../../context/authContext';
import './residentregister.css';

const ResidentRegister = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [apartments, setApartments] = useState([]);
  const [previewFront, setPreviewFront] = useState(null);
  const [previewBack, setPreviewBack] = useState(null);

  const [form, setForm] = useState({
    apartmentId: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    relationWithOwner: '',
    moveInDate: '',
    nationality: 'Việt Nam',
    idNumber: '',
    issueDate: '',
    documentFront: null,
    documentBack: null,
  });

  // 🔄 Lấy căn hộ có liên quan đến user (isOwner / isRenter)
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/apartments', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        // console.log('📦 Dữ liệu từ API /api/apartments:', data);

        const filtered = data.filter(
          (apt) =>
            String(apt.isOwner?._id) === String(user._id) ||
            String(apt.isRenter?._id) === String(user._id)
        );

        // console.log('🏠 Căn hộ sau khi lọc theo user:', filtered);
        setApartments(filtered);
      } catch (err) {
        console.error('❌ Không lấy được danh sách căn hộ:', err);
        toast.error('❌ Không lấy được danh sách căn hộ');
      }
    })();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const file = files ? files[0] : null;

    setForm((prev) => ({ ...prev, [name]: file || value }));

    if (file) {
      const url = URL.createObjectURL(file);
      if (name === 'documentFront') setPreviewFront(url);
      if (name === 'documentBack') setPreviewBack(url);
    }
  };

  const validate = () => {
    if (!form.apartmentId) return toast.error('Chọn căn hộ');
    if (!form.fullName.trim()) return toast.error('Nhập họ tên');
    if (!form.gender) return toast.error('Chọn giới tính');
    if (!form.dateOfBirth) return toast.error('Chọn ngày sinh');
    if (!form.relationWithOwner.trim()) return toast.error('Nhập quan hệ với chủ hộ');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const token = localStorage.getItem('token');
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => v && body.append(k, v));

      const res = await fetch('http://localhost:4000/api/residents/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Đăng ký thất bại');

      toast.success('✅ Đăng ký thành công – chờ xác minh');
      setTimeout(() => navigate(-1), 2500);
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    }
  };

  return (
    <div className="resident-reg-page">
      <Header user={user} name={user?.name} logout={logout} />
      <ToastContainer />

      <div className="resident-reg-container">
        <h2 className="resident-reg-title">Đăng ký nhân khẩu</h2>

        <form className="resident-reg-form" onSubmit={handleSubmit}>
          {/* Căn hộ */}
          <div className="form-group">
            <label>Căn hộ *</label>
            <select
              name="apartmentId"
              value={form.apartmentId}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn căn hộ --</option>
              {apartments.map((apt) => (
  <option key={apt._id} value={apt._id}>
    {apt.apartmentCode}
  </option>
))}
            </select>
          </div>

          {/* Họ tên */}
          <div className="form-group">
            <label>Họ tên *</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Giới tính + ngày sinh */}
          <div className="form-row">
            <div className="form-group">
              <label>Giới tính *</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ngày sinh *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Quan hệ + Quốc tịch */}
          <div className="form-row">
            <div className="form-group">
              <label>Quan hệ với chủ hộ *</label>
              <input
                type="text"
                name="relationWithOwner"
                value={form.relationWithOwner}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Quốc tịch</label>
              <input
                type="text"
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Ngày chuyển đến */}
          <div className="form-group">
            <label>Ngày chuyển đến</label>
            <input
              type="date"
              name="moveInDate"
              value={form.moveInDate}
              onChange={handleChange}
            />
          </div>

          {/* CCCD + ngày cấp */}
          <div className="form-row">
            <div className="form-group">
              <label>Số CCCD</label>
              <input
                type="text"
                name="idNumber"
                value={form.idNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Ngày cấp</label>
              <input
                type="date"
                name="issueDate"
                value={form.issueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Ảnh giấy tờ */}
          <div className="form-row">
            <div className="form-group">
              <label>Mặt trước CCCD</label>
              <input
                type="file"
                name="documentFront"
                accept="image/*"
                onChange={handleChange}
              />
              {previewFront && (
                <img src={previewFront} className="image-preview" alt="front" />
              )}
            </div>
            <div className="form-group">
              <label>Mặt sau CCCD</label>
              <input
                type="file"
                name="documentBack"
                accept="image/*"
                onChange={handleChange}
              />
              {previewBack && (
                <img src={previewBack} className="image-preview" alt="back" />
              )}
            </div>
          </div>

          <div className="form-group full">
            <button type="submit" className="submit-btn">
              Đăng ký
            </button>
          </div>
        </form>
      </div>

      <footer className="resident-reg-footer">© 2025 Quản lý nhân khẩu</footer>
    </div>
  );
};

export default ResidentRegister;
