import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/header';
import { useAuth } from '../../context/authContext';
import './formParkingRegistation.css';

const FormParkingRegistration = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(null);
  const [apartments, setApartments] = useState([]);

  const [formData, setFormData] = useState({
    owner: '',
    ownerPhone: '',
    apartmentId: '',
    vehicleType: '',
    licensePlate: '',
    chassisNumber: '',
    engineNumber: '',
    registeredCity: '',
    registeredDistrict: '',
    registerDate: '',
    expireDate: '',
    documentFront: null,
    documentBack: null,
    previewFront: null,
    previewBack: null,
  });

  /* ---------- lấy danh sách căn hộ ---------- */useEffect(() => {
  setName(user?.name || null);
  (async () => {
    try {
      const r = await fetch('http://localhost:4000/api/apartments');
      const data = await r.json();

      const userId = String(user._id);

      const filtered = data.filter(apt => {
        const isOwner = String(apt.isOwner?._id) === userId;
        const isRenter = String(apt.isRenter?._id) === userId;

        // ✅ Nếu là người thuê → được phép
        if (isRenter) return true;

        // ✅ Nếu là chủ hộ và không có người thuê → được phép
        if (isOwner && !apt.isRenter) return true;

        // ❌ Chủ hộ nhưng có người thuê → không được
        return false;
      });

      setApartments(filtered);
    } catch (err) {
      console.error(err);
      toast.error('❌ Lỗi khi lấy dữ liệu căn hộ');
    }
  })();
}, [user]);

  

  /* ---------- xử lý input ---------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
  
    if (files && files.length > 0) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
  
      setFormData(prev => ({
        ...prev,
        [name]: file,
        [`preview${name === 'documentFront' ? 'Front' : 'Back'}`]: previewUrl
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  

  /* ---------- validate ngày ---------- */
  const validateDates = () => {
    const now = new Date();              // thời gian hiện tại
    const reg = new Date(formData.registerDate);

    if (isNaN(reg)) {
      toast.error('Vui lòng chọn ngày đăng ký hợp lệ!');
      return false;
    }
    if (reg > now) {
      toast.error('Ngày đăng ký không được nằm trong tương lai!');
      return false;
    }

    if (!formData.expireDate) return true;   // backend sẽ tự xử lý

    const exp = new Date(formData.expireDate);
    if (isNaN(exp)) {
      toast.error('Ngày hết hạn không hợp lệ!');
      return false;
    }
    if (exp <= reg) {
      toast.error('Ngày hết hạn phải sau ngày đăng ký!');
      return false;
    }

    return true;
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateDates()) return;

    try {
      const token = localStorage.getItem('token');
      const submission = new FormData();

      submission.append('apartmentId', formData.apartmentId);
      submission.append('owner', formData.owner);
      submission.append('ownerPhone', formData.ownerPhone);
      submission.append('vehicleType', formData.vehicleType);
      submission.append('licensePlate', formData.licensePlate);
      submission.append('chassisNumber', formData.chassisNumber);
      submission.append('engineNumber', formData.engineNumber);
      submission.append('registeredCity', formData.registeredCity);
      submission.append('registeredDistrict', formData.registeredDistrict);
      submission.append('registerDate', formData.registerDate);

      if (formData.expireDate) {
        submission.append('expireDate', formData.expireDate);
      }

      if (formData.documentFront) submission.append('documentFront', formData.documentFront);
      if (formData.documentBack)  submission.append('documentBack',  formData.documentBack);

      const res = await fetch('http://localhost:4000/api/parkinglot/create-parkinglot', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: submission
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Đăng ký thất bại');

      toast.success('✅ Bạn đã đăng ký. Vui lòng đợi nhân viên phê duyệt.');
      setTimeout(() => navigate('/dichvu/baidoxe'), 3000);

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="parking-page">
      <Header user={user} name={name} logout={logout} />
      <ToastContainer />

      <div className="parking-form-wrapper">
        <h2 className="parking-form-title">Đăng ký bãi giữ xe</h2>

        <form className="parking-form-grid" onSubmit={handleSubmit}>
          {/* chủ sở hữu */}
          <div className="form-group">
            <label>Chủ sở hữu *</label>
            <input type="text" name="owner" value={formData.owner} onChange={handleChange} required />
          </div>

          {/* sđt chủ sở hữu */}
          <div className="form-group">
            <label>Số điện thoại chủ sở hữu *</label>
            <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} required />
          </div>

          {/* căn hộ */}
          <div className="form-group">
            <label>Tên căn hộ *</label>
            <select name="apartmentId" value={formData.apartmentId} onChange={handleChange} required>
              <option value="">-- Chọn căn hộ --</option>
              {apartments.map((apt) => (
                <option key={apt._id} value={apt._id}>{apt.apartmentCode}</option>
              ))}
            </select>
          </div>

          {/* loại xe */}
          <div className="form-group">
            <label>Loại xe *</label>
            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} required>
              <option value="">-- Chọn loại --</option>
              <option value="ô tô">Ô tô</option>
              <option value="xe máy">Xe máy</option>
            </select>
          </div>

          {/* biển số */}
          <div className="form-group">
            <label>Biển số xe *</label>
            <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} required />
          </div>

          {/* số khung / máy */}
          <div className="form-group">
            <label>Số khung</label>
            <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Số máy</label>
            <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} />
          </div>

          {/* đăng ký tại */}
          <div className="form-group double">
            <label>Đăng ký tại *</label>
            <div className="double-select">
              <input type="text" placeholder="Tỉnh / Thành phố" name="registeredCity" value={formData.registeredCity} onChange={handleChange} required />
              <input type="text" placeholder="Quận / Huyện" name="registeredDistrict" value={formData.registeredDistrict} onChange={handleChange} required />
            </div>
          </div>

          {/* ngày đăng ký / hết hạn */}
          <div className="form-group">
            <label>Ngày đăng ký *</label>
            <input type="date" name="registerDate" value={formData.registerDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Ngày hết hạn</label>
            <input type="date" name="expireDate" value={formData.expireDate} onChange={handleChange} />
          </div>

          {/* ảnh giấy tờ */}
          <div className="form-group wide">
            <label>Mặt trước và mặt sau giấy tờ xe</label>
            <div className="image-upload-boxes">
  {/* Mặt trước */}
  <span>Mặt trước</span>
  <div className="image-upload-box">
    <label className="upload-btn">
      Chọn ảnh
      <input type="file" name="documentFront" accept="image/*" onChange={handleChange} hidden />
    </label>
    <div className="file-name">
      {formData.documentFront ? formData.documentFront.name : 'Chưa chọn ảnh'}
    </div>
    {formData.previewFront && (
      <img
        src={formData.previewFront}
        alt="Preview trước"
        style={{ marginTop: 8, maxWidth: 200, border: '1px solid #ccc', borderRadius: 8 }}
      />
    )}
  </div>

  {/* Mặt sau */}
  <span>Mặt sau</span>
  <div className="image-upload-box">
    <label className="upload-btn">
      Chọn ảnh
      <input type="file" name="documentBack" accept="image/*" onChange={handleChange} hidden />
    </label>
    <div className="file-name">
      {formData.documentBack ? formData.documentBack.name : 'Chưa chọn ảnh'}
    </div>
    {formData.previewBack && (
      <img
        src={formData.previewBack}
        alt="Preview sau"
        style={{ marginTop: 8, maxWidth: 200, border: '1px solid #ccc', borderRadius: 8 }}
      />
    )}
  </div>
</div>

          </div>

          <div className="form-group full center">
            <button type="submit">Đăng Ký</button>
          </div>
        </form>
      </div>

      <footer className="parking-footer">© 2025 Bãi giữ xe</footer>
    </div>
  );
};

export default FormParkingRegistration;
