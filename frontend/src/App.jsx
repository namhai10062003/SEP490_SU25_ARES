import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ChatProvider } from "../context/ChatContext.jsx";
import { VideoCallProvider, useVideoCall } from "../context/VideoCallContext.jsx";
import AuthProvider, { useAuth } from "../context/authContext";
import SocketProvider from "../context/socketContext";

import SocketListener from "../components/SocketListener.jsx";
import VideoPlayer from "../src/pages/messages/VideoPlayer.jsx";
import GlobalChatBox from "./pages/messages/GlobalChatBox.jsx";
import VideoCallPopup from "./pages/messages/VideoCallPopup";

// Các trang
import Home from "./home/home";
import BlogList from "./pages/BlogList/BlogList.jsx";
import PostDetail from "./pages/BlogList/BlogListDetail";
import DashboardHome from "./pages/DashboardHome.jsx";
import CustomerPostManagement from "./pages/MangementPostByCustomer/CustomerPostManagement.jsx";
import RegistrationForm from "./pages/PostRegistration/registrationForm.jsx";
import ResidentDetail from "./pages/Residentpeople/residentDetail";
import ResidentRegister from "./pages/Residentpeople/residentRegister";
import ResidentList from "./pages/Residentpeople/residentpeople";
import AdminReportPage from "./pages/admin/report/AdminReportPage";
import AdminResidentApproval from "./pages/admin/residentVerifyByAdmin/AdminResidentApproval";
import ForgotPassword from "./pages/forgotpassword";
import GoogleCallback from "./pages/google-callback.jsx";
import Login from "./pages/login.jsx";
import ManageApartment from "./pages/manage-apartment.jsx";
import ManageApplicationForm from "./pages/manage-application-form.jsx";
import ManageStaff from "./pages/manage-staff.jsx";
import ManageUser from "./pages/manage-user.jsx";
import MyApartment from "./pages/manageUserApartment/MyApartment.jsx";
import Register from "./pages/register.jsx";
import ResetPassword from "./pages/resetpassword";
import PostManagement from "./pages/staff/ManagementPost/PostManagement.jsx";
import ResidentVerificationForm from "./pages/staff/ResidentVerificationForm/ResidentVerificationForm.jsx";
import ResidentVerificationList from "./pages/staff/ResidentVerificationList/ResidentVerificationList.jsx";
import ResidentVerifyList from "./pages/staff/ResidentVerify/residentVerifyList";
import DashboardPage from "./pages/staff/dashboardStatistics";
import ManageExpense from "./pages/staff/manageExpense.jsx";
import ManageParkingLot from "./pages/staff/manageParkingLot/manageParkinglot";
import ParkingLotList from "./pages/staff/manageParkingLot/parkinglot-list";
import VerifyEmail from "./pages/verify-otp.jsx";
import FormParkingRegistration from "./parkingRegistration/formParkingRegistation";
import ParkingRegistrationDetails from "./parkingRegistration/parkingRegistartionDetail";
import ParkingRegistration from "./parkingRegistration/parkingRegistration";

// Bảo vệ route
function ProtectedRoute({ element, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return element;
}

// 🎬 Hiển thị routes và các thành phần ngoài route
function AppRoutes() {
  const { callActive, incomingCall } = useVideoCall();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/google/callback" element={<GoogleCallback />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/postdetail/:id" element={<PostDetail />} />
          <Route path="/dichvu/dangtin" element={<RegistrationForm />} />
          <Route path="/profile/quanlipostcustomer" element={<CustomerPostManagement />} />
          <Route path="/my-apartment" element={<MyApartment />} />
          <Route path="/canho/nhaukhau" element={<ResidentList />} />
          <Route path="/canho/dangkynhankhau" element={<ResidentRegister />} />
          <Route path="/residents/:id" element={<ResidentDetail />} />
          <Route path="/dichvu/baidoxe" element={<ParkingRegistration />} />
          <Route path="/dichvu/dangkybaidoxe" element={<FormParkingRegistration />} />
          <Route path="/parkinglot/detail-parkinglot/:id" element={<ParkingRegistrationDetails />} />

          {/* Admin */}
          <Route path="/admin-dashboard" element={<ProtectedRoute element={<DashboardHome />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/posts" element={<ProtectedRoute element={<PostManagement />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/manage-user" element={<ProtectedRoute element={<ManageUser />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/manage-staff" element={<ProtectedRoute element={<ManageStaff />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/manage-apartment" element={<ProtectedRoute element={<ManageApartment />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/manage-resident-verification" element={<ProtectedRoute element={<ManageApplicationForm />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/resident-verify-admin" element={<ProtectedRoute element={<AdminResidentApproval />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/report" element={<ProtectedRoute element={<AdminReportPage />} allowedRoles={["admin"]} />} />

          {/* Staff */}
          <Route path="/staff-dashboard" element={<ProtectedRoute element={<DashboardPage />} allowedRoles={["staff"]} />} />
          <Route path="/manage-expenses" element={<ProtectedRoute element={<ManageExpense />} allowedRoles={["staff"]} />} />
          <Route path="/resident-verify" element={<ProtectedRoute element={<ResidentVerifyList />} allowedRoles={["staff"]} />} />
          <Route path="/residentVerification" element={<ProtectedRoute element={<ResidentVerificationForm />} allowedRoles={["staff"]} />} />
          <Route path="/listresidentVerification" element={<ProtectedRoute element={<ResidentVerificationList />} allowedRoles={["staff"]} />} />
          <Route path="/manage-parkinglot" element={<ProtectedRoute element={<ManageParkingLot />} allowedRoles={["staff"]} />} />
          <Route path="/parkinglot-list" element={<ProtectedRoute element={<ParkingLotList />} allowedRoles={["staff"]} />} />
        </Routes>

        {/* Global components */}
        <SocketListener />
        <ToastContainer position="top-right" autoClose={1500} theme="light" />
        <GlobalChatBox />
        <VideoCallPopup />
        {(callActive || incomingCall) && <VideoPlayer />}
      </BrowserRouter>
    </>
  );
}

// ✅ Bọc provider + gọi AppRoutes bên trong AppContent
function AppContent() {
  const { user } = useAuth();
  return (
    <VideoCallProvider userId={user?._id}>
      <AppRoutes />
    </VideoCallProvider>
  );
}

// ✅ Gốc của ứng dụng
function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
