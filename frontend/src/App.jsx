import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ChatProvider } from "../context/ChatContext.jsx";
import { VideoCallProvider, useVideoCall } from "../context/VideoCallContext.jsx";
// index.js hoặc App.js
// import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import AuthProvider, { useAuth } from "../context/authContext";
import SocketProvider from "../context/socketContext";

import SocketListener from "../components/SocketListener.jsx";
import VideoPlayer from "../src/pages/user/messages/VideoPlayer.jsx";
import GlobalChatBox from "./pages/user/messages/GlobalChatBox.jsx";
import VideoCallPopup from "./pages/user/messages/VideoCallPopup";
import ScrollButtons from "../components/ScrollButton.jsx";
// Các trang
import Home from "./home/home";
import DashboardHome from "./pages/admin/DashboardHome.jsx";
import PostManagement from "./pages/admin/ManagementPost/PostManagement.jsx";
import ManageApartment from "./pages/admin/manage-apartment.jsx";
import ManageApplicationForm from "./pages/admin/manage-application-form.jsx";
import ManageStaff from "./pages/admin/manage-staff.jsx";
import ManageUser from "./pages/admin/manage-user.jsx";
import AdminReportPage from "./pages/admin/report/AdminReportPage";
import AdminResidentApproval from "./pages/admin/residentVerifyByAdmin/AdminResidentApproval";
import AdminWithdrawPage from "./pages/admin/revenue/AdminWithdrawRequests.jsx";
import AdminRevenueApartment from "./pages/admin/revenue/apartment.jsx";
import AdminRevenueApartmentDeposit from "./pages/admin/revenue/apartmentDeposit.jsx";
import AdminRevenuePost from "./pages/admin/revenue/posts.jsx";
import AdminPostDetail from "./pages/admin/ManagementPost/PostDetail.jsx";
import ResidentVerificationForm from "./pages/staff/ResidentVerificationForm/ResidentVerificationForm.jsx";
import ResidentVerificationList from "./pages/staff/ResidentVerificationList/ResidentVerificationList.jsx";
import ResidentVerifyList from "./pages/staff/ResidentVerify/residentVerifyList";
import DashboardPage from "./pages/staff/dashboardStatistics";
import ManageExpense from "./pages/staff/manageExpense.jsx";
import ManageParkingLot from "./pages/staff/manageParkingLot/manageParkinglot";
import ParkingLotList from "./pages/staff/manageParkingLot/parkinglot-list";
import WaterDataUpload from "./pages/staff/waterExpense.jsx";
import BlogList from "./pages/user/BlogList/BlogList.jsx";
import PostDetail from "./pages/user/BlogList/BlogListDetail";
import LikedPosts from "./pages/user/BlogList/LikedPosts.jsx";
import Introduce from "./pages/user/Introduce/Introduce.jsx";
import CustomerPostManagement from "./pages/user/MangementPostByCustomer/CustomerPostManagement.jsx";
import RegistrationForm from "./pages/user/PostRegistration/registrationForm.jsx";
import ResidentDetail from "./pages/user/Residentpeople/residentDetail";
import ResidentRegister from "./pages/user/Residentpeople/residentRegister";
import ResidentList from "./pages/user/Residentpeople/residentpeople";
import BookingForm from "./pages/user/booking/BookingForm.jsx";
import ContractDetail from "./pages/user/booking/ContractDetail.jsx";
import MyContractRequests from "./pages/user/booking/MyContractRequests.jsx";
import MyContracts from "./pages/user/booking/myContract.jsx";
import MyVerifiedApplications from "./pages/user/contractofuser/MyVerifiedApplications.jsx";
import ForgotPassword from "./pages/user/forgotpassword";
import GoogleCallback from "./pages/user/google-callback.jsx";
import Login from "./pages/user/login.jsx";
import MyApartment from "./pages/user/manageUserApartment/MyApartment.jsx";
import FormParkingRegistration from "./pages/user/parkingRegistration/formParkingRegistation";
import ParkingRegistrationDetails from "./pages/user/parkingRegistration/parkingRegistartionDetail";
import ParkingRegistration from "./pages/user/parkingRegistration/parkingRegistration";
import ChangePassword from "./pages/user/profile/ChangePassword";
import Profile from "./pages/user/profile/profile";
import UpdateProfileForm from "./pages/user/profile/updateProfile";
import Register from "./pages/user/register.jsx";
import ResetPassword from "./pages/user/resetpassword";
import UserRevenue from "./pages/user/revenuer/UserRevenue.jsx";
import VerifyEmail from "./pages/user/verify-otp.jsx";
import Contact from "./pages/user/Contact/Contact.jsx";
import AdminContactPage from "./pages/admin/contactPage/adminContactPage.jsx";

// Component bảo vệ route (chặn người chưa login, hoặc không đủ quyền)

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
          <Route path="/updateprofile" element={<UpdateProfileForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/changepassword" element={<ChangePassword />} />
          <Route path="/booking/:postId" element={<BookingForm />} />
          <Route path="/my-contracts" element={<MyContracts />} />
          <Route path="/my-requests" element={<MyContractRequests />} />
          <Route path="/contracts/:id" element={<ContractDetail />} />
          <Route path="/liked-posts" element={<LikedPosts />} />
          <Route path="/my-verified" element={<MyVerifiedApplications />} />
          <Route path="/gioi-thieu" element={<Introduce />} />
          <Route path="/my-revenue" element={<UserRevenue />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin */}
          <Route path="/admin-dashboard" element={<ProtectedRoute element={<DashboardHome />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/posts" element={<ProtectedRoute element={<PostManagement />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/manage-user" element={<ProtectedRoute element={<ManageUser />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/manage-staff" element={<ProtectedRoute element={<ManageStaff />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/manage-apartment" element={<ProtectedRoute element={<ManageApartment />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/manage-resident-verification" element={<ProtectedRoute element={<ManageApplicationForm />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/resident-verify-admin" element={<ProtectedRoute element={<AdminResidentApproval />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/report" element={<ProtectedRoute element={<AdminReportPage />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/revenue/post" element={<ProtectedRoute element={<AdminRevenuePost />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/revenue/apartment" element={<ProtectedRoute element={<AdminRevenueApartment />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/revenue/apartment-deposit" element={<ProtectedRoute element={<AdminRevenueApartmentDeposit />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/user-revenue" element={<ProtectedRoute element={<AdminWithdrawPage />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/contact" element={<ProtectedRoute element={<AdminContactPage />} allowedRoles={["admin"]} />} />
          <Route path="/admin-dashboard/posts/:id" element={<ProtectedRoute element={<AdminPostDetail />} allowedRoles={["admin"]} />} />

          {/* Staff */}
          <Route path="/staff-dashboard" element={<ProtectedRoute element={<DashboardPage />} allowedRoles={["staff"]} />} />
          <Route path="staff-expenses" element={<ProtectedRoute element={<ManageExpense />} allowedRoles={["staff"]} />} />
          <Route path="staff-resident-verify" element={<ProtectedRoute element={<ResidentVerifyList />} allowedRoles={["staff"]} />} />
          <Route path="staff-resident-register" element={<ProtectedRoute element={<ResidentVerificationForm />} allowedRoles={["staff"]} />} />
          <Route path="staff-resident-verification" element={<ProtectedRoute element={<ResidentVerificationList />} allowedRoles={["staff"]} />} />
          <Route path="staff-manage-parkinglot" element={<ProtectedRoute element={<ManageParkingLot />} allowedRoles={["staff"]} />} />
          <Route path="staff-parkinglot-list" element={<ProtectedRoute element={<ParkingLotList />} allowedRoles={["staff"]} />} />
          <Route path="staff-water-data-upload" element={<ProtectedRoute element={<WaterDataUpload />} allowedRoles={["staff"]} />} />

          {/* User */}
        </Routes>

        {/* Global components */}
        <SocketListener />
        <ToastContainer position="top-right" autoClose={1500} theme="light" />
        <GlobalChatBox />
        <ScrollButtons />
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
