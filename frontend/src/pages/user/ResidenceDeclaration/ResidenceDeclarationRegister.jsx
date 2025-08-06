import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '../../../../components/header';
import { useAuth } from '../../../../context/authContext';

const ResidenceDeclarationRegister = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [apartments, setApartments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [form, setForm] = useState({
    apartmentId: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    relationWithOwner: '',
    nationality: 'Việt Nam',
    idNumber: '',
    startDate: '',
    endDate: '',
    documentImage: null,
  });

  // 🔄 Lấy căn hộ của user
  useEffect(() => {
    if (!user?._id) return;

    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/apartments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const apartmentsArray = data.data || [];

        const filtered = apartmentsArray.filter(
          (apt) =>
            String(apt.isOwner?._id) === String(user._id) ||
            String(apt.isRenter?._id) === String(user._id)
        );

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

    if (file && name === 'documentImage') {
      const url = URL.createObjectURL(file);
      setPreviewDoc(url);
    }
  };

  const validate = () => {
    if (!form.apartmentId) return toast.error('Chọn căn hộ');
    if (!form.fullName.trim()) return toast.error('Nhập họ tên');
    if (!form.gender) return toast.error('Chọn giới tính');
    if (!form.dateOfBirth) return toast.error('Chọn ngày sinh');
    if (!form.relationWithOwner.trim()) return toast.error('Nhập quan hệ với chủ hộ');
    if (!form.startDate) return toast.error('Chọn ngày bắt đầu');
    if (!form.endDate) return toast.error('Chọn ngày kết thúc');
    if (new Date(form.startDate) > new Date(form.endDate)) {
      return toast.error('Ngày kết thúc phải sau ngày bắt đầu');
    }
    if (!form.documentImage) return toast.error('Vui lòng tải lên giấy tạm trú/tạm vắng');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const token = localStorage.getItem('token');
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => v && body.append(k, v));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/residence-declaration/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Đăng ký thất bại');

      toast.success('✅ Gửi yêu cầu thành công – chờ xác minh');
      setTimeout(() => navigate('/residence-declaration/list'), 2500);
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={user?.name} logout={logout} />
      <ToastContainer />

      <div className="container py-5">
        <div className="bg-white rounded-4 shadow p-4 mx-auto" style={{ maxWidth: 800 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold border-start border-4 border-primary ps-3 m-0">
              Đăng ký tạm trú tạm vắng
            </h2>
            <button
              type="button"
              onClick={() => navigate('/residence-declaration/list')}
              className="btn btn-outline-secondary rounded-pill"
            >
              ⬅ Quay lại
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Căn hộ */}
              <div className="col-md-6">
                <label className="form-label">Căn hộ *</label>
                <select
                  name="apartmentId"
                  value={form.apartmentId}
                  onChange={handleChange}
                  className="form-select"
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
              <div className="col-md-6">
                <label className="form-label">Họ tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              {/* Giới tính */}
              <div className="col-md-6">
                <label className="form-label">Giới tính *</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">-- Chọn --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              {/* Ngày sinh */}
              <div className="col-md-6">
                <label className="form-label">Ngày sinh *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              {/* Quan hệ với chủ hộ */}
              <div className="col-md-6">
                <label className="form-label">Quan hệ với chủ hộ *</label>
                <input
                  type="text"
                  name="relationWithOwner"
                  value={form.relationWithOwner}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              {/* Quốc tịch */}
              <div className="col-md-6">
                <label className="form-label">Quốc tịch</label>
                <input
                  type="text"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              {/* Số CCCD */}
              <div className="col-md-6">
                <label className="form-label">Số CCCD</label>
                <input
                  type="text"
                  name="idNumber"
                  value={form.idNumber}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập 12 số (nếu có)"
                />
              </div>
              <div className="row g-3">
  {/* Ngày bắt đầu */}
  <div className="col-md-6">
    <label className="form-label">Ngày bắt đầu *</label>
    <input
      type="date"
      name="startDate"
      value={form.startDate}
      onChange={handleChange}
      className="form-control"
      required
    />
  </div>

  {/* Ngày kết thúc */}
  <div className="col-md-6">
    <label className="form-label">Ngày kết thúc *</label>
    <input
      type="date"
      name="endDate"
      value={form.endDate}
      onChange={handleChange}
      className="form-control"
      required
    />
  </div>
</div>

              {/* Ảnh giấy tạm trú / tạm vắng */}
              <div className="col-12">
                <label className="form-label">Ảnh giấy tạm trú / tạm vắng *</label>
                <input
                  type="file"
                  name="documentImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="form-control"
                  required
                />
                {previewDoc && (
                  <img
                    src={previewDoc}
                    alt="document"
                    className="img-thumbnail mt-2"
                    style={{ maxHeight: 200 }}
                  />
                )}
              </div>

              {/* Nút submit */}
              <div className="col-12">
                <button type="submit" className="btn btn-primary btn-lg w-100 mt-3">
                  Đăng ký
                </button>
              </div>
            </div>
          </form>
        </div>
        <footer className="text-center mt-4 text-secondary small">
          © 2025 Quản lý nhân khẩu
        </footer>
      </div>
    </div>
  );
};

export default ResidenceDeclarationRegister;
