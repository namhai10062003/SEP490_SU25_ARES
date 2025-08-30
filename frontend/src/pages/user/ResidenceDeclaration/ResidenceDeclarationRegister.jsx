import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../../../components/header';
import LoadingModal from '../../../../components/loadingModal';
import { useAuth } from '../../../../context/authContext';

const ResidenceDeclarationRegister = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [apartments, setApartments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [loading, setLoading] = useState(false);
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
      setLoading(true);
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
      }finally{
        setLoading(false);
      }
    })();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const file = files ? files[0] : null;
  
    // Nếu là file, xử lý upload & preview
    if (file) {
      setForm((prev) => ({ ...prev, [name]: file }));
  
      if (name === "documentImage") {
        const url = URL.createObjectURL(file);
        setPreviewDoc(url);
      }
      return; // kết thúc hàm với file
    }
  
    // Nếu là idNumber, chỉ cho nhập số và tối đa 12 chữ số
    if (name === "idNumber") {
      let numValue = value.replace(/\D/g, ""); // loại bỏ ký tự không phải số
      if (numValue.length > 12) numValue = numValue.slice(0, 12); // giới hạn 12 số
      setForm((prev) => ({ ...prev, [name]: numValue }));
    } else {
      // các input khác bình thường
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const validate = () => {
    if (!form.apartmentId) {
      toast.error("❌ Chọn căn hộ");
      return false;
    }
    if (!form.fullName.trim()) {
      toast.error("❌ Nhập họ tên");
      return false;
    }
    if (!form.gender) {
      toast.error("❌ Chọn giới tính");
      return false;
    }
    if (!form.dateOfBirth) {
      toast.error("❌ Chọn ngày sinh");
      return false;
    }
    if (!form.relationWithOwner.trim()) {
      toast.error("❌ Nhập quan hệ với chủ hộ");
      return false;
    }
  
    // ✅ Check CCCD
    if (!form.idNumber) {
      toast.error("❌ Nhập số CCCD");
      return false;
    }
    if (!/^\d{12}$/.test(form.idNumber.trim())) {
      toast.error("❌ Số CCCD phải gồm đúng 12 chữ số");
      return false;
    }
  
    if (!form.startDate) {
      toast.error("❌ Chọn ngày bắt đầu");
      return false;
    }
    if (!form.endDate) {
      toast.error("❌ Chọn ngày kết thúc");
      return false;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast.error("❌ Ngày kết thúc phải sau ngày bắt đầu");
      return false;
    }
    if (!form.documentImage) {
      toast.error("❌ Vui lòng tải lên giấy tờ tạm trú/tạm vắng");
      return false;
    } 
  
    return true;
  };
  
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
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
         // Check cả status HTTP lẫn message trong body
    if (!res.ok || result.success === false) {
      throw new Error(result.message || 'Đăng ký thất bại');
    }
      toast.success('✅ Gửi yêu cầu thành công – chờ xác minh');
      setTimeout(() => navigate('/residence-declaration/list'), 2500);
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    }finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={user?.name} logout={logout} />


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
                <label className="form-label">Quốc tịch *</label>
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
                <label className="form-label">Số CCCD *</label>
                <input
  type="text"
  name="idNumber"
  value={form.idNumber}
  onChange={handleChange}
  className="form-control"
  placeholder="Nhập 12 số"
  pattern="\d{12}"   // chỉ đúng 12 chữ số
  title="CCCD phải gồm đúng 12 số"
  required
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
              <div className="col-12 d-flex justify-content-center">
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

            </div>
          </form>
        </div>
        <footer className="text-center mt-4 text-secondary small">
          © 2025 Quản lý nhân khẩu
        </footer>
      </div>
      {/* ✅ Loading toàn màn hình */}
{loading && <LoadingModal />}
    </div>
  );
};

export default ResidenceDeclarationRegister;
