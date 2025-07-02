import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";

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

  // Lấy dữ liệu user để fill vào form
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
    <div className="bg-light min-vh-100">
      <Header user={user} name={name} logout={logout} />
      <div className="container py-5">
        <div className="bg-white rounded-4 shadow p-4 mx-auto" style={{ maxWidth: 600 }}>
          <h2 className="fw-bold text-center mb-4">Cập nhật thông tin cá nhân</h2>

          <div
            className="d-flex flex-column align-items-center mb-4"
            style={{ cursor: "pointer" }}
            onClick={() => fileInputRef.current.click()}
          >
            <img
              src={previewImage || "/default-avatar.png"}
              alt="Avatar"
              className="rounded-circle border border-3 border-primary shadow"
              style={{ width: 120, height: 120, objectFit: "cover", transition: "transform 0.3s" }}
            />
            <span className="mt-2 text-primary fw-semibold">Nhấn để đổi ảnh</span>
          </div>

          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Họ tên</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="form-control" required />
            </div>

            <div className="mb-3">
              <label className="form-label">SĐT</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="form-control" required />
            </div>

            <div className="mb-3">
              <label className="form-label">Giới tính</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="form-select" required>
                <option value="">-- Chọn giới tính --</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Ngày sinh</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} className="form-control" required />
            </div>

            <div className="mb-3">
              <label className="form-label">Địa chỉ</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="form-control" required />
            </div>

            <div className="mb-3">
              <label className="form-label">CMND/CCCD</label>
              <input type="text" name="identityNumber" value={form.identityNumber} onChange={handleChange} className="form-control" required />
            </div>

            <div className="mb-3">
              <label className="form-label">Giới thiệu</label>
              <textarea name="bio" rows="3" value={form.bio} onChange={handleChange} className="form-control" required></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Nghề nghiệp</label>
              <input type="text" name="jobTitle" value={form.jobTitle} onChange={handleChange} className="form-control" required />
            </div>

            <div className="d-flex justify-content-between gap-2 mt-4">
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={() => navigate(-1)}
              >
                ← Quay lại
              </button>
              <button type="submit" className="btn btn-primary px-4">
                Cập nhật
              </button>
            </div>
          </form>
        </div>
        <footer className="text-center mt-4 text-secondary small">
          &copy; 2025 Hồ sơ người dùng
        </footer>
      </div>
    </div>
  );
};

export default UpdateProfileForm;