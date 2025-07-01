import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const token = localStorage.getItem("token");

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

  // ✅ Lấy dữ liệu user để fill vào form
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/users/profile/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userInfo = res.data;
        setForm({
          name: userInfo.name || "",
          phone: userInfo.phone || "",
          gender: userInfo.gender || "",
          dob: userInfo.dob ? userInfo.dob.split("T")[0] : "",
          address: userInfo.address || "",
          identityNumber: userInfo.identityNumber || "",
          bio: userInfo.bio || "",
          jobTitle: userInfo.jobTitle || "",
        });

        setPreviewImage(userInfo.profileImage || null);
        setName(userInfo.name);
      } catch (err) {
        console.error("❌ Lỗi khi lấy thông tin người dùng:", err);
        toast.error("Không thể tải thông tin người dùng!");
      }
    };

    if (user?._id && token) {
      fetchUserProfile();
    }
  }, [user, token]);

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
            src={previewImage || "/default-avatar.png"}
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
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>SĐT</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <select name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <input type="date" name="dob" value={form.dob} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Địa chỉ</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>CMND/CCCD</label>
            <input type="text" name="identityNumber" value={form.identityNumber} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Giới thiệu</label>
            <textarea name="bio" rows="3" value={form.bio} onChange={handleChange} required></textarea>
          </div>

          <div className="form-group">
            <label>Nghề nghiệp</label>
            <input type="text" name="jobTitle" value={form.jobTitle} onChange={handleChange} required />
          </div>

          <div className="button-group">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate(-1)}
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
