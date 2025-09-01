import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../../../components/header';
import LoadingModal from '../../../../components/loadingModal';
import { useAuth } from '../../../../context/authContext';

const ResidentRegister = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    if (!user?._id) return; // ⚠️ Tránh gọi khi chưa có user

    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/apartments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        // console.log('📦 API response:', data);

        const apartmentsArray = data.data || [];

        const filtered = apartmentsArray.filter(
          (apt) =>
            String(apt.isOwner?._id) === String(user._id) ||
            String(apt.isRenter?._id) === String(user._id)
        );

        // console.log("✅ Căn hộ của user:", filtered); // 👈 Log kết quả lọc
        // console.log("👀 Check từng căn hộ:");
        apartmentsArray.forEach((apt) => {
          // console.log({
          //   aptCode: apt.apartmentCode,
          //   owner: apt.isOwner?._id,
          //   renter: apt.isRenter?._id,
          //   match: String(apt.isOwner?._id) === String(user._id) || String(apt.isRenter?._id) === String(user._id),
          // });
        });
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

    setForm((prev) => ({ ...prev, [name]: file || value }));

    if (file) {
      const url = URL.createObjectURL(file);
      if (name === 'documentFront') setPreviewFront(url);
      if (name === 'documentBack') setPreviewBack(url);
    }
  };

  // Hàm tính tuổi từ ngày sinh
const getAge = (dob) => {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
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

  // ✅ Kiểm tra tuổi để xác định validate CCCD hay giấy khai sinh
  const age = getAge(form.dateOfBirth);

  if (age >= 16) {
    if (!form.idNumber?.trim()) {
      toast.error("❌ Nhập số CCCD");
      return false;
    }
    if (!/^\d{12}$/.test(form.idNumber.trim())) {
      toast.error("❌ CCCD phải gồm đúng 12 chữ số");
      return false;
    }
  } else {
    if (!form.documentFront) {
      toast.error("❌ Vui lòng tải lên ảnh giấy khai sinh");
      return false;
    }
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

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/residents/create`, {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={user?.name} logout={logout} />
      <ToastContainer />

      <div className="container py-5">
        <div className="bg-white rounded-4 shadow p-4 mx-auto" style={{ maxWidth: 900 }}>
          <h2 className="fw-bold mb-4 border-start border-4 border-primary ps-3">Đăng ký nhân khẩu</h2>
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
              <div className="col-md-3">
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
              <div className="col-md-3">
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
              <div className="col-md-3">
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
              <div className="col-md-3">
                <label className="form-label">Quốc tịch *</label>
                <input
                  type="text"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              {/* Ngày chuyển đến */}
              <div className="col-md-6">
                <label className="form-label">Ngày chuyển đến *</label>
                <input
                  type="date"
                  name="moveInDate"
                  value={form.moveInDate}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              {/* Số CCCD */}
              <div className="col-md-3">
                <label className="form-label">Số CCCD/ Giấy khai sinh *</label>
                <input
                  type="text"
                  name="idNumber"
                  value={form.idNumber}
                  onChange={handleChange}
                  className="form-control"
                  maxLength={12}
                  pattern="\d{12}"
                  placeholder="Nhập 12 số"
                  required
                />
              </div>
              {/* Ngày cấp */}
              <div className="col-md-3">
                <label className="form-label">Ngày cấp *</label>
                <input
                  type="date"
                  name="issueDate"
                  value={form.issueDate}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              {/* Ảnh giấy tờ */}
              <div className="col-md-6">
                <label className="form-label">
                  {getAge(form.dateOfBirth) < 16 ? 'Ảnh giấy khai sinh *' : 'Mặt trước CCCD *'}
                </label>
                <input
                  type="file"
                  name="documentFront"
                  accept="image/*"
                  onChange={handleChange}
                  className="form-control"
                  required={getAge(form.dateOfBirth) < 16} // bắt buộc nếu là giấy khai sinh
                />
                {previewFront && (
                  <img src={previewFront} alt="front" className="img-thumbnail mt-2" style={{ maxHeight: 180 }} />
                )}
              </div>
              {getAge(form.dateOfBirth) >= 16 && (
                <div className="col-md-6">
                  <label className="form-label">Mặt sau CCCD *</label>
                  <input
                    type="file"
                    name="documentBack"
                    accept="image/*"
                    onChange={handleChange}
                    className="form-control"
                  />
                  {previewBack && (
                    <img
                      src={previewBack}
                      alt="back"
                      className="img-thumbnail mt-2"
                      style={{ maxHeight: 180 }}
                    />
                  )}
                </div>
              )}
              {/* Nút submit */}
              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mt-3 d-flex justify-content-center align-items-center"
                  disabled={loading} // không cho bấm khi đang loading
                >
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                  {loading ? "Đang đăng ký..." : "Đăng ký"}
                </button>
              </div>
            </div>
          </form>
        </div>
        <footer className="text-center mt-4 text-secondary small">
          © 2025 Quản lý nhân khẩu
        </footer>
      </div>
      {loading && <LoadingModal />}
    </div>
  );
};

export default ResidentRegister;