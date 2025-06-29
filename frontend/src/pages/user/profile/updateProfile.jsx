import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import "./updateProfile.css";

const UpdateProfileForm = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); // ✅ Khởi tạo điều hướng

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    identityNumber: "",
    bio: "",
    jobTitle: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!form.name || !form.phone || !form.gender || !form.dob || !form.address) {
        toast.warn("⚠️ Vui lòng điền đầy đủ các trường bắt buộc!");
        return;
      }
  
    try {
      const formData = new FormData();
      for (let key in form) {
        formData.append(key, form[key]);
      }
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }
  
      await axios.patch("http://localhost:4000/api/users/updateprofile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      toast.success("✅ Đã cập nhật hồ sơ thành công!");
  
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      console.error("Lỗi cập nhật hồ sơ:", err);
      toast.error("❌ Lỗi khi cập nhật hồ sơ!");
    }
  };

  return (
    <div className="update-profile-page">
      <Header user={user} name={name} logout={logout} />
      <div className="update-profile-container">
        <h2 className="update-profile-title">Cập nhật thông tin cá nhân</h2>

        <div className="avatar-wrapper" onClick={() => fileInputRef.current.click()}>
          <img
            src={previewImage || user?.profileImage || "/default-avatar.png"}
            alt="Avatar"
            className="avatar-preview"
          />
          <p className="avatar-text">Nhấn để đổi ảnh</p>
        </div>

        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        <form onSubmit={handleSubmit} className="update-profile-form">
          <div className="form-group">
            <label>Họ tên</label>
            <input type="text" name="name" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>SĐT</label>
            <input type="text" name="phone" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <select name="gender" required value={form.gender} onChange={handleChange}>
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <input type="date" name="dob" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Địa chỉ</label>
            <input type="text" name="address" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>CMND/CCCD</label>
            <input type="text" name="identityNumber"  required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Giới thiệu</label>
            <textarea name="bio" rows="3"  required onChange={handleChange}></textarea>
          </div>

          <div className="form-group">
            <label>Nghề nghiệp</label>
            <input type="text" name="jobTitle"  required onChange={handleChange} />
          </div>

          <div className="button-group">
  <button
    type="button"
    className="back-button"
    onClick={() => navigate(-1)} // 👈 Quay lại trang trước
  >
    ← Quay lại
  </button>

  <button type="submit" className="submit-button">
    Cập nhật
  </button>
</div>
          
        </form>
      </div>
      <footer className="update-profile-footer">&copy; 2025 Hồ sơ người dùng</footer>
    </div>
  );
};

export default UpdateProfileForm;
