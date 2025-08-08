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
  const [updateStatus, setUpdateStatus] = useState(null); // "pending", "approved", "rejected"
  const [rejectionReason, setRejectionReason] = useState("");
  const [cccdFrontImage, setCccdFrontImage] = useState(null);
const [cccdBackImage, setCccdBackImage] = useState(null);
const [previewFront, setPreviewFront] = useState(null);
const [previewBack, setPreviewBack] = useState(null);

//hàm cccd 
const handleCccdFrontChange = (e) => {
  const file = e.target.files[0];
  setCccdFrontImage(file);
  if (file) {
    const reader = new FileReader();
    reader.onload = () => setPreviewFront(reader.result);
    reader.readAsDataURL(file);
  }
};

const handleCccdBackChange = (e) => {
  const file = e.target.files[0];
  setCccdBackImage(file);
  if (file) {
    const reader = new FileReader();
    reader.onload = () => setPreviewBack(reader.result);
    reader.readAsDataURL(file);
  }
};

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
  const [originalData, setOriginalData] = useState({
    identityNumber: "",
    address: "",
  });
  // Lấy dữ liệu user để fill vào form
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("🔍 Fetching profile for user:", user?._id);
  
        // Lấy thông tin người dùng
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/profile/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
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
        setOriginalData({
          identityNumber: userInfo.identityNumber || "",
          address: userInfo.address || "",
        });
        setPreviewImage(userInfo.profileImage || null);
        setName(userInfo.name);
  
        // 🟡 Lấy yêu cầu cập nhật gần nhất
        const requestRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/profile-update/profile-update-requests?userId=${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        console.log("🟢 Kết quả yêu cầu cập nhật:", requestRes.data);
  
        const latest = requestRes.data?.[0];
  
        if (latest) {
          setUpdateStatus(latest.status);
          setRejectionReason(latest.rejectionReason || "");
        }
  
      } catch (error) {
        console.error("❌ Lỗi khi load thông tin:", error);
      }
    };
  
    if (user?._id && token) {
      fetchUserProfile();
    }
  }, [user, token]);
  
  
  
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "identityNumber" || name === "phone") {
      const onlyDigits = value.replace(/\D/g, "");
      if (name === "identityNumber" && onlyDigits.length <= 12) {
        setForm({ ...form, [name]: onlyDigits });
      } else if (name === "phone" && onlyDigits.length <= 11) {
        setForm({ ...form, [name]: onlyDigits });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
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
    
    const errors = [];

    if (!form.name?.trim()) errors.push("⚠️ Vui lòng nhập họ tên!");
    if (!form.phone?.trim()) errors.push("⚠️ Vui lòng nhập số điện thoại! Số điện thoại bắt buộc 10 số");
    if (!form.gender?.trim()) errors.push("⚠️ Vui lòng chọn giới tính!");
    if (!form.dob?.trim()) errors.push("⚠️ Vui lòng chọn ngày sinh!");
    if (!form.address?.trim()) errors.push("⚠️ Vui lòng nhập địa chỉ!");
  
    if (!form.identityNumber?.trim()) {
      errors.push("⚠️ Vui lòng nhập số CMND/CCCD!");
    } else if (!/^\d{9}$|^\d{12}$/.test(form.identityNumber)) {
      errors.push("⚠️ CMND/CCCD phải gồm 9 hoặc 12 chữ số!");
    }
    
    if (!form.bio?.trim()) errors.push("⚠️ Vui lòng nhập phần giới thiệu!");
    if (!form.jobTitle?.trim()) errors.push("⚠️ Vui lòng nhập nghề nghiệp!");
  
    // if (!cccdFrontImage) errors.push("⚠️ Vui lòng tải ảnh CCCD mặt trước!");
    // if (!cccdBackImage) errors.push("⚠️ Vui lòng tải ảnh CCCD mặt sau!");
  
    if (errors.length > 0) {
      errors.forEach((err) => toast.warn(err));
      return;
    }
   // ✅ Validate tuổi phải >= 18
   const dob = new Date(form.dob);
   const today = new Date();
   const age = today.getFullYear() - dob.getFullYear();
   const hasHadBirthdayThisYear =
     today.getMonth() > dob.getMonth() || 
     (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
 
   const actualAge = hasHadBirthdayThisYear ? age : age - 1;
 
   if (actualAge < 18) {
     toast.error("❌ Bạn phải đủ 18 tuổi trở lên để cập nhật hồ sơ.");
     return;
   }
    const isSensitiveChanged =
      form.identityNumber !== originalData.identityNumber ||
      // form.address !== originalData.address ||
      profileImage ||
      cccdFrontImage ||
      cccdBackImage;
  
    try {
      const formData = new FormData();
      for (let key in form) {
        formData.append(key, form[key]);
      }
  
      if (profileImage) formData.append("profileImage", profileImage);
      if (cccdFrontImage) formData.append("cccdFrontImage", cccdFrontImage);
      if (cccdBackImage) formData.append("cccdBackImage", cccdBackImage);
  
      if (isSensitiveChanged) {
        // Gửi yêu cầu để admin duyệt trước
        await axios.patch(`${import.meta.env.VITE_API_URL}/api/users/updateprofile`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
  
        toast.success("📤 Yêu cầu cập nhật thông tin nhạy cảm đã được gửi, chờ admin duyệt!");
      } else {
        // Gửi trực tiếp, cho phép cập nhật luôn (không cần admin duyệt)
        await axios.patch(`${import.meta.env.VITE_API_URL}/api/users/updateprofile`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
          
        toast.success("✅ Cập nhật thông tin thành công!");
      }
      
  
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      const backendMessage = err.response?.data?.message || "❌ Gửi yêu cầu thất bại, thử lại sau!";
      toast.error(backendMessage);
      console.error("Lỗi cập nhật hồ sơ:", err);
    }
  };
  
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (!form.name || !form.phone || !form.gender || !form.dob || !form.address) {
//     toast.warn("⚠️ Vui lòng điền đầy đủ các trường bắt buộc!");
//     return;
//   }

//   try {
//     const formData = new FormData();
//     for (let key in form) {
//       formData.append(key, form[key]);
//     }
//     if (profileImage) {
//       formData.append("profileImage", profileImage);
//     }

//     // Gửi yêu cầu cập nhật (nhưng để admin duyệt)
//     await axios.patch(`${import.meta.env.VITE_API_URL}/api/users/updateprofile`, formData, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     toast.success("📤 Yêu cầu cập nhật đã được gửi, chờ admin duyệt!");

//     setTimeout(() => {
//       navigate("/profile");
//     }, 1500);
//   } catch (err) {
//     console.error("Lỗi cập nhật hồ sơ:", err);
//     toast.error("❌ Gửi yêu cầu thất bại, thử lại sau!");
//   }
// };

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
              <input type="text" name="name" value={form.name} onChange={handleChange} className="form-control" />
            </div>

            <div className="mb-3">
  <label className="form-label">SĐT</label>
  <input
  type="text"
  name="phone"
  value={form.phone}
  onChange={handleChange}
  className="form-control"
  maxLength={11} // 👈 Giới hạn ký tự tối đa
  pattern="^0\d{9,10}$"
  title="Số điện thoại phải bắt đầu bằng số 0 và có 10-11 chữ số"
/>
</div>

            <div className="mb-3">
              <label className="form-label">Giới tính</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="form-select" >
                <option value="">-- Chọn giới tính --</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Ngày sinh</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} className="form-control" />
            </div>

            <div className="mb-3">
              <label className="form-label">Địa Chỉ</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="form-control" />
            </div>

            <div className="mb-3">
  <label className="form-label">CMND/CCCD</label>
  <input
    type="text"
    name="identityNumber"
    value={form.identityNumber}
    onChange={handleChange}
    className="form-control"
    pattern="^\d{9}$|^\d{12}$"
    title="CMND/CCCD phải gồm 12 chữ số"
  />
</div>
<div className="mb-3">
  <label className="form-label">Ảnh CCCD mặt trước</label>
  <input type="file" accept="image/*" className="form-control" onChange={handleCccdFrontChange} />
  {previewFront && (
    <img
      src={previewFront}
      alt="CCCD mặt trước"
      className="img-thumbnail mt-2"
      style={{ maxHeight: 150 }}
    />
  )}
</div>

<div className="mb-3">
  <label className="form-label">Ảnh CCCD mặt sau</label>
  <input type="file" accept="image/*" className="form-control" onChange={handleCccdBackChange} />
  {previewBack && (
    <img
      src={previewBack}
      alt="CCCD mặt sau"
      className="img-thumbnail mt-2"
      style={{ maxHeight: 150 }}
    />
  )}
</div>

            <div className="mb-3">
              <label className="form-label">Giới thiệu</label>
              <textarea name="bio" rows="3" value={form.bio} onChange={handleChange} className="form-control" ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Nghề nghiệp</label>
              <input type="text" name="jobTitle" value={form.jobTitle} onChange={handleChange} className="form-control"  />
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
            {updateStatus && (
  <div className="alert alert-info mt-3">
    <p>
      📌 Trạng thái yêu cầu cập nhật gần nhất:{" "}
      <strong>
        {{
          pending: "⏳ Chờ duyệt",
          approved: "✅ Đã được chấp nhận",
          rejected: "❌ Bị từ chối",
        }[updateStatus] || "Không xác định"}
      </strong>
    </p>

    {updateStatus === "rejected" && rejectionReason && (
      <p>📝 Lý do từ chối: <em>{rejectionReason}</em></p>
    )}
  </div>
)}
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