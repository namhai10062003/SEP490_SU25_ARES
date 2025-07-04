import axios from "axios";
import PropTypes from "prop-types";
import React, { createContext, useContext, useEffect, useState } from "react";

// Tạo context
const AuthContext = createContext();

// Custom hook
export const useAuth = () => useContext(AuthContext);

// Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "https://api.ares.io.vn";

  // Xác minh token từ localStorage khi app load
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          `${apiUrl}/api/auth/verify`, // ✅ đổi tên endpoint nếu cần
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.user) {
          setUser(response.data.user);
        } else {
          throw new Error("Không tìm thấy thông tin người dùng.");
        }
      } catch (err) {
        console.error("❌ Lỗi xác minh token:", err);
        localStorage.removeItem("token");
        setUser(null);
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  // Hàm login
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
    setError(null); // xoá lỗi cũ nếu có
  };

  // Hàm logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {loading ? <div>Đang kiểm tra đăng nhập...</div> : children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
