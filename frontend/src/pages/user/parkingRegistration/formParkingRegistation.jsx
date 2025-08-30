import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../../../components/header';
import LoadingModal from '../../../../components/loadingModal';
import { useAuth } from '../../../../context/authContext';
const FormParkingRegistration = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(null);
  const [apartments, setApartments] = useState([]);

  const [formData, setFormData] = useState({
    owner: '',
    ownerPhone: '',
    apartmentId: '',
    vehicleType: '',
    licensePlate: '',
    registeredCity: '',
    registeredDistrict: '',
    registerDate: '',
    expireDate: '',
    documentFront: null,
    documentBack: null,
    previewFront: null,
    previewBack: null,
  });

  // Lấy danh sách căn hộ
  useEffect(() => {
    setName(user?.name || null);
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/apartments`);
        const data = await r.json();

        const userId = String(user._id);
        const filtered = data.data.filter((apt) => {
          const isOwner = apt.isOwner && String(apt.isOwner._id) === userId;
          const isRenter = apt.isRenter && String(apt.isRenter._id) === userId;
          if (isRenter) return true;
          if (isOwner && !apt.isRenter) return true;
  
          return false;
        });

        setApartments(filtered);
      } catch (err) {
        console.error(err);
        toast.error('❌ Lỗi khi lấy dữ liệu căn hộ');
      }finally{
        setLoading(false);
      }
    })();
  }, [user]);

  // Xử lý input
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
// xu lí sdt 
const handleChangeIphone = (e) => {
  const { name, value, files } = e.target;

  // 👉 Chỉ cho nhập số nếu là ô số điện thoại
  if (name === 'ownerPhone') {
    if (!/^\d*$/.test(value)) return; // Không cho nhập nếu không phải số
  }

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

// Validate ngày
const validateParkingForm = () => {
  if (!formData.owner?.trim()) {
    toast.error("❌ Nhập tên chủ sở hữu");
    return false;
  }

  if (!formData.ownerPhone?.trim()) {
    toast.error("❌ Nhập số điện thoại");
    return false;
  }
  if (!/^(0|\+84)\d{9,10}$/.test(formData.ownerPhone.trim())) {
    toast.error("❌ Số điện thoại không hợp lệ");
    return false;
  }

  // if (!formData.apartmentName?.trim()) {
  //   toast.error("❌ Nhập tên căn hộ");
  //   return false;
  // }

  if (!formData.apartmentId) {
    toast.error("❌ Chọn căn hộ");
    return false;
  }

  

  if (!formData.vehicleType) {
    toast.error("❌ Chọn loại xe");
    return false;
  }

  if (!formData.licensePlate?.trim()) {
    toast.error("❌ Nhập biển số xe");
    return false;
  }
  
  if (!formData.registeredCity?.trim()) {
    toast.error("❌ Nhập nơi đăng ký (Tỉnh / Thành phố)");
    return false;
  }

  if (!formData.registeredDistrict?.trim()) {
    toast.error("❌ Nhập nơi đăng ký (Quận / Huyện)");
    return false;
  }

  if (!formData.registerDate) {
    toast.error("❌ Chọn ngày đăng ký");
    return false;
  }

  const reg = new Date(formData.registerDate);
  if (isNaN(reg)) {
    toast.error("❌ Ngày đăng ký không hợp lệ");
    return false;
  }

  if (formData.expireDate) {
    const exp = new Date(formData.expireDate);
    if (isNaN(exp)) {
      toast.error("❌ Ngày hết hạn không hợp lệ");
      return false;
    }
    if (reg > exp) {
      toast.error("❌ Ngày hết hạn phải sau ngày đăng ký");
      return false;
    }
  }

  // // ✅ Check file đúng kiểu
  // if (!(formData.documentFront instanceof File)) {
  //   toast.error("❌ Vui lòng tải lên ảnh mặt trước giấy tờ xe");
  //   return false;
  // }

  // if (!(formData.documentBack instanceof File)) {
  //   toast.error("❌ Vui lòng tải lên ảnh mặt sau giấy tờ xe");
  //   return false;
  // }

  return true;
};



  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateParkingForm()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const submission = new FormData();

      submission.append('apartmentId', formData.apartmentId);
      submission.append('owner', formData.owner);
      submission.append('ownerPhone', formData.ownerPhone);
      submission.append('vehicleType', formData.vehicleType);
      submission.append('licensePlate', formData.licensePlate);
      // submission.append('chassisNumber', formData.chassisNumber);
      // submission.append('engineNumber', formData.engineNumber);
      submission.append('registeredCity', formData.registeredCity);
      submission.append('registeredDistrict', formData.registeredDistrict);
      submission.append('registerDate', formData.registerDate);

      if (formData.expireDate) {
        submission.append('expireDate', formData.expireDate);
      }

      if (formData.documentFront) submission.append('documentFront', formData.documentFront);
      if (formData.documentBack) submission.append('documentBack', formData.documentBack);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parkinglot/create-parkinglot`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: submission
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Đăng ký thất bại');

      toast.success('✅ Bạn đã đăng ký. Vui lòng đợi nhân viên phê duyệt.');
      setTimeout(() => navigate('/dichvu/baidoxe'), 2000);

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={name} logout={logout} />


      <div className="container py-5">
        <div className="bg-white rounded-4 shadow p-4 mx-auto" style={{ maxWidth: 700 }}>
          <h2 className="fw-bold mb-4 border-start border-4 border-primary ps-3">Đăng ký bãi giữ xe</h2>

          <form className="row g-3" onSubmit={handleSubmit}>
            {/* Chủ sở hữu */}
            <div className="col-md-6">
              <label className="form-label">Chủ sở hữu *</label>
              <input type="text" name="owner" value={formData.owner} onChange={handleChange} className="form-control" required />
            </div>

            {/* SĐT chủ sở hữu */}
            <div className="col-md-6">
  <label className="form-label">Số điện thoại *</label>
  <input
    type="tel"
    name="ownerPhone"
    value={formData.ownerPhone}
    onChange={handleChange}
    className={`form-control ${formData.ownerPhone && !/^[0-9]{9,11}$/.test(formData.ownerPhone) ? 'is-invalid' : ''}`}
    
    pattern="^[0-9]{9,11}$"
    title="Số điện thoại phải là số và từ 9 đến 11 chữ số"
  />
  {/* Thông báo lỗi */}
  {formData.ownerPhone && !/^[0-9]{9,11}$/.test(formData.ownerPhone) && (
    <div className="text-danger mt-1 small">
      Số điện thoại phải là số và từ 9 đến 11 chữ số
    </div>
  )}
</div>


            {/* Căn hộ */}
            <div className="col-md-6">
              <label className="form-label">Tên căn hộ *</label>
              <select name="apartmentId" value={formData.apartmentId} onChange={handleChange} className="form-select" >
                <option value="">-- Chọn căn hộ --</option>
                {apartments.map((apt) => (
                  <option key={apt._id} value={apt._id}>{apt.apartmentCode}</option>
                ))}
              </select>
            </div>

            {/* Loại xe */}
            <div className="col-md-6">
              <label className="form-label">Loại xe *</label>
              <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="form-select" >
                <option value="">-- Chọn loại --</option>
                <option value="ô tô">Ô tô</option>
                <option value="xe máy">Xe máy</option>
              </select>
            </div>

            {/* Biển số */}
            <div className="col-md-6">
              <label className="form-label">Biển số xe *</label>
              <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} className="form-control" />
            </div>

            {/* Số khung */}
            {/* <div className="col-md-6">
              <label className="form-label">Số khung</label>
              <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} className="form-control" />
            </div> */}

            {/* Số máy */}
            {/* <div className="col-md-6">
              <label className="form-label">Số máy</label>
              <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} className="form-control" />
            </div> */}

            {/* Đăng ký tại */}
            <div className="col-md-6">
              <label className="form-label">Đăng ký tại *</label>
              <div className="row g-2">
                <div className="col">
                  <input type="text" placeholder="Tỉnh / Thành phố" name="registeredCity" value={formData.registeredCity} onChange={handleChange} className="form-control"  />
                </div>
                <div className="col">
                  <input type="text" placeholder="Quận / Huyện" name="registeredDistrict" value={formData.registeredDistrict} onChange={handleChange} className="form-control"  />
                </div>
              </div>
            </div>

            {/* Ngày đăng ký */}
            <div className="col-md-6">
              <label className="form-label">Ngày đăng ký *</label>
              <input type="date" name="registerDate" value={formData.registerDate} onChange={handleChange} className="form-control"  />
            </div>

            {/* Ngày hết hạn
            <div className="col-md-6">
              <label className="form-label">Ngày hết hạn</label>
              <input type="date" name="expireDate" value={formData.expireDate} onChange={handleChange} className="form-control" />
            </div> */}

            {/* Ảnh giấy tờ */}
            <div className="col-12">
              <label className="form-label">Mặt trước và mặt sau giấy tờ xe</label>
              <div className="row g-3">
                {/* Mặt trước */}
                <div className="col-md-6">
                  <div className="border border-2 border-primary rounded-3 p-3 bg-light text-center h-100">
                    <span className="fw-semibold">Mặt trước</span>
                    <label className="btn btn-outline-primary btn-sm d-block mt-2">
                      Chọn ảnh
                      <input type="file" name="documentFront" accept="image/*" onChange={handleChange} hidden />
                    </label>
                    <div className="small text-secondary mt-2">
                      {formData.documentFront ? formData.documentFront.name : 'Chưa chọn ảnh'}
                    </div>
                    {formData.previewFront && (
                      <img
                        src={formData.previewFront}
                        alt="Preview trước"
                        className="img-thumbnail mt-2"
                        style={{ maxWidth: 200, borderRadius: 8 }}
                      />
                    )}
                  </div>
                </div>
                {/* Mặt sau */}
                <div className="col-md-6">
                  <div className="border border-2 border-primary rounded-3 p-3 bg-light text-center h-100">
                    <span className="fw-semibold">Mặt sau</span>
                    <label className="btn btn-outline-primary btn-sm d-block mt-2">
                      Chọn ảnh
                      <input type="file" name="documentBack" accept="image/*" onChange={handleChange} hidden />
                    </label>
                    <div className="small text-secondary mt-2">
                      {formData.documentBack ? formData.documentBack.name : 'Chưa chọn ảnh'}
                    </div>
                    {formData.previewBack && (
                      <img
                        src={formData.previewBack}
                        alt="Preview sau"
                        className="img-thumbnail mt-2"
                        style={{ maxWidth: 200, borderRadius: 8 }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Nút submit */}
            <div className="col-12 d-flex justify-content-center mt-4">
            <button
      type="submit"
      className="btn btn-primary btn-lg px-5 fw-bold d-flex align-items-center justify-content-center"
      onClick={handleSubmit}
      disabled={loading} // disable khi loading
    >
      {loading && (
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
      )}
      {loading ? "Đang đăng ký..." : "Đăng Ký"}
    </button>
            </div>
          </form>
        </div>
        <footer className="text-center mt-4 text-secondary small">
          © 2025 Bãi giữ xe
        </footer>
      </div>
      
      {/* Loading modal */}
      {loading && <LoadingModal show={loading} />}
    </div>
  );
};

export default FormParkingRegistration;