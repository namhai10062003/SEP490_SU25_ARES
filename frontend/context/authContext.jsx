import axios from "axios";
import PropTypes from "prop-types";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "https://api.ares.io.vn";
  const navigate = useNavigate();

  // Hàm logout kèm redirect
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
    navigate("/login"); // Điều hướng về login
  }, [navigate]);

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
          `${apiUrl}/api/auth/verify`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          logout(); // token không hợp lệ → logout
        }
      } catch (err) {
        console.error("❌ Lỗi xác minh token:", err);
        logout(); // verify lỗi → logout
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [apiUrl, logout]);

  // Hàm login
  const login = useCallback(
    (userData, token) => {
      localStorage.setItem("token", token);
      setUser(userData);
      setError(null);
      navigate("/"); // login thành công → về trang chủ
    },
    [navigate]
  );

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
