import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";

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
          `${import.meta.env.VITE_API_URL}/api/users/profile/${user._id}`,
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
  }, [user, navigate]);

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
console.log(userData);
  return (
    <div className="bg-light min-vh-100">
      <Header user={userData} name={name} logout={logout} />

      <div className="container py-5">
        <div className="bg-white rounded-4 shadow p-4 mx-auto" style={{ maxWidth: 600 }}>
          <h2 className="fw-bold text-center mb-4">Thông tin cá nhân</h2>

          <div className="d-flex flex-column align-items-center mb-4">
            <img
              src={userData?.profileImage || "/default-avatar.png"}
              alt="Avatar"
              className="rounded-circle border border-3 border-primary shadow"
              style={{ width: 120, height: 120, objectFit: "cover", transition: "transform 0.3s" }}
            />
          </div>

          <div className="mb-4">
  <p><strong>Họ tên:</strong> {userData?.name || "Chưa cập nhật"}</p>
  <p><strong>SĐT:</strong> {userData?.phone || "Chưa cập nhật"}</p>
  <p><strong>Giới tính:</strong> {displayGender(userData?.gender)}</p>
  <p><strong>Ngày sinh:</strong> {userData?.dob ? userData.dob.split("T")[0] : "Chưa cập nhật"}</p>
  <p><strong>Địa chỉ:</strong> {userData?.address || "Chưa cập nhật"}</p>
  <p><strong>CMND/CCCD:</strong> {userData?.identityNumber || "Chưa cập nhật"}</p>
  <p><strong>Nghề nghiệp:</strong> {userData?.jobTitle || "Chưa cập nhật"}</p>
  <p><strong>Giới thiệu:</strong> {userData?.bio || "Chưa có giới thiệu"}</p>

  {/* Ảnh CCCD mặt trước */}
  <div className="mt-3">
    <p><strong>Ảnh CCCD mặt trước:</strong></p>
    {userData?.cccdFrontImage ? (
      <img src={userData.cccdFrontImage} alt="CCCD mặt trước" style={{ maxWidth: "300px", borderRadius: "8px" }} />
    ) : (
      <p>Chưa cập nhật</p>
    )}
  </div>

  {/* Ảnh CCCD mặt sau */}
  <div className="mt-3">
    <p><strong>Ảnh CCCD mặt sau:</strong></p>
    {userData?.cccdBackImage ? (
      <img src={userData.cccdBackImage} alt="CCCD mặt sau" style={{ maxWidth: "300px", borderRadius: "8px" }} />
    ) : (
      <p>Chưa cập nhật</p>
    )}
  </div>
</div>


          <div className="d-flex justify-content-center gap-3 mt-4">
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/updateprofile")}
            >
              ✏️ Chỉnh sửa hồ sơ
            </button>
            <button
              className="btn btn-secondary px-4"
              onClick={() => navigate("/changepassword")}
            >
              🔒 Đổi mật khẩu
            </button>
          </div>
        </div>

        <footer className="text-center mt-4 text-secondary small">
          &copy; 2025 Hồ sơ người dùng
        </footer>
      </div>
    </div>
  );
};

export default Profile;