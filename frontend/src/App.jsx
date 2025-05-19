import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { default as AuthProvider, default as useAuth } from "../context/authContext";

import Home from "./home/home";
// import Dashboard from "./pages/dashboard.jsx"; // Giả sử đây là trang chỉ dành cho admin
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";

// Component bảo vệ route (chặn người chưa login, hoặc không đủ quyền)
function ProtectedRoute({ element, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return element;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Route được bảo vệ (chỉ admin mới vào được) */}
          {/* <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                element={<Dashboard />}
                allowedRoles={["admin"]}
              />
            }
          /> */}
        </Routes>

        {/* ✅ Thêm ToastContainer để bật thông báo realtime */}
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light" // hoặc "dark"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
