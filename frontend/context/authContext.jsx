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

  useEffect(() => {
    const verifyUser = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("🔹 Token từ localStorage:", token);

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const verifyResponse = await axios.post(
          "http://localhost:4000/api/auth/verify-otp",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ User verified:", verifyResponse.data.user);
        setUser(verifyResponse.data.user);
      } catch (error) {
        console.error("❌ Lỗi khi xác minh token:", error);

        if (error.response && error.response.status === 401) {
          console.log("❌ Token hết hạn! Xóa khỏi localStorage.");
          localStorage.removeItem("token");
        }

        setUser(null);
        setError("Session expired. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    console.log("🔹 Đăng xuất, xóa token khỏi localStorage.");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {!loading ? children : <div>Đang tải...</div>}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
