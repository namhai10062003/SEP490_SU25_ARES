import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import "./profile.css";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user?._id) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:4000/api/users/profile/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserData(res.data);
        setName(res.data.name);
      } catch (err) {
        console.error("❌ Lỗi lấy thông tin người dùng:", err);
        navigate("/login");
      }
    };

    fetchUserProfile();
  }, [user]);

  // ✅ Hàm chuyển đổi giới tính sang tiếng Việt
  const displayGender = (gender) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "Chưa cập nhật";
    }
  };

  return (
    <div className="profile-page">
      <Header user={userData} name={name} logout={logout} />

      <div className="profile-container">
        <h2 className="profile-title">Thông tin cá nhân</h2>

        <div className="profile-avatar">
          <img
            src={userData?.profileImage || "/default-avatar.png"}
            alt="Avatar"
            className="avatar-image"
          />
        </div>

        <div className="profile-info">
          <p><strong>Họ tên:</strong> {userData?.name || "Chưa cập nhật"}</p>
          <p><strong>SĐT:</strong> {userData?.phone || "Chưa cập nhật"}</p>
          <p><strong>Giới tính:</strong> {displayGender(userData?.gender)}</p>
          <p><strong>Ngày sinh:</strong> {userData?.dob ? userData.dob.split("T")[0] : "Chưa cập nhật"}</p>
          <p><strong>Địa chỉ:</strong> {userData?.address || "Chưa cập nhật"}</p>
          <p><strong>CMND/CCCD:</strong> {userData?.identityNumber || "Chưa cập nhật"}</p>
          <p><strong>Nghề nghiệp:</strong> {userData?.jobTitle || "Chưa cập nhật"}</p>
          <p><strong>Giới thiệu:</strong> {userData?.bio || "Chưa có giới thiệu"}</p>
        </div>

        <div className="profile-actions">
          <button className="edit-profile-btn" onClick={() => navigate("/updateprofile")}>
            ✏️ Chỉnh sửa hồ sơ
          </button>

          <button className="change-password-btn" onClick={() => navigate("/changepassword")}>
            🔒 Đổi mật khẩu
          </button>
        </div>
      </div>

      <footer className="profile-footer">&copy; 2025 Hồ sơ người dùng</footer>
    </div>
  );
};

export default Profile;
