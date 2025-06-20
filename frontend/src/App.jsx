import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// index.js hoặc App.js
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import 'bootstrap/dist/css/bootstrap.min.css';

import AuthProvider, { useAuth } from "../context/authContext";
import SocketProvider from "../context/socketContext";
import Home from "./home/home";
import VerifyEmail from "./pages/verify-otp.jsx";
// import Dashboard from "./pages/dashboard.jsx"; // Giả sử đây là trang chỉ dành cho admin
import ForgotPassword from "./pages/forgotpassword";
import GoogleCallback from "./pages/google-callback.jsx";
import Login from "./pages/login.jsx";
import ManageApartment from "./pages/manage-apartment.jsx";
import ManageStaff from "./pages/manage-staff.jsx";
import ManageUser from "./pages/manage-user.jsx";
import Register from "./pages/register.jsx";
import ResetPassword from "./pages/resetpassword";
import ManageParkingLot from "./pages/staff/manageParkingLot/manageParkinglot";
import ParkingLotList from "./pages/staff/manageParkingLot/parkinglot-list";
import StaffDashboard from "./pages/staff/staffDashboard";
import FormParkingRegistration from "./parkingRegistration/formParkingRegistation";
import ParkingRegistrationDetails from "./parkingRegistration/parkingRegistartionDetail";
import ParkingRegistration from "./parkingRegistration/parkingRegistration";
import SocketListener from "../components/SocketListener.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import ManageApplicationForm from "./pages/manage-application-form.jsx";
import ResidentVerificationForm from "./pages/staff/ResidentVerificationForm/ResidentVerificationForm.jsx";
import ResidentVerificationList from "./pages/staff/ResidentVerificationList/ResidentVerificationList.jsx";


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
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/google/callback" element={<GoogleCallback />} />
            <Route path="/dichvu/baidoxe" element={<ParkingRegistration />} />
            <Route path="/dichvu/dangkybaidoxe" element={<FormParkingRegistration />} />
            <Route path="/parkinglot/detail-parkinglot/:id" element={<ParkingRegistrationDetails />} />
            {/* Route được bảo vệ (chỉ admin mới vào được) */}
            {<Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute
                  element={<DashboardHome />}
                  allowedRoles={["admin"]}
                />
              }
            />}
            {<Route
              path="/admin-dashboard/manage-staff"
              element={
                <ProtectedRoute
                  element={<ManageStaff />}
                  allowedRoles={["admin"]}
                />
              }
            />}
            {<Route
              path="/admin-dashboard/manage-user"
              element={
                <ProtectedRoute
                  element={<ManageUser />}
                  allowedRoles={["admin"]}
                />
              }
            />}
            <Route
              path="/admin-dashboard/manage-apartment"
              element={
                <ProtectedRoute
                  element={<ManageApartment />}
                  allowedRoles={["admin"]}
                />
              }
            />
            {/* Route được bảo vệ staff mới được vào */}
            {<Route
              path="/staff-dashboard"
              element={
                <ProtectedRoute
                  element={<StaffDashboard />}
                  allowedRoles={["staff"]}
                />
              }
            />}
            <Route
              path="/residentVerification"
              element={
                <ProtectedRoute
                  element={<ResidentVerificationForm />}
                  allowedRoles={["staff"]}
                />
              }
            />
            <Route
              path="/listresidentVerification"
              element={
                <ProtectedRoute
                  element={<ResidentVerificationList />}
                  allowedRoles={["staff"]}
                />
              }
            />
            <Route
              path="/manage-parkinglot"
              element={
                <ProtectedRoute
                  element={<ManageParkingLot />}
                  allowedRoles={["staff"]}
                />
              }
            />
            <Route
              path="/parkinglot-list"
              element={
                <ProtectedRoute
                  element={<ParkingLotList />}
                  allowedRoles={["staff"]}
                />
              }
            />
            {<Route
              path="/admin-dashboard/manage-staff"
              element={
                <ProtectedRoute
                  element={<ManageStaff />}
                  allowedRoles={["admin"]}
                />
              }
            />}
            <Route
              path="/admin-dashboard/manage-resident-verification"
              element={
                <ProtectedRoute
                  element={<ManageApplicationForm />}
                  allowedRoles={["admin"]}
                />
              }
            />
          </Routes>
          <SocketListener />
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
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
