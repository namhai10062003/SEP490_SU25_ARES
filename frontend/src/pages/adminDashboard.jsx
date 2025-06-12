import React from "react";
import { Link } from "react-router-dom";
import "./adminDashboard.css";
// import StatisticsDashboard from "./statisticDashboard.jsx"; 
export default function AdminDashboard({ children }) {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="bg-info p-3 text-white" style={{ width: "240px" }}>
        <h5 className="fw-bold">ADMIN PANEL</h5>
        <ul className="list-unstyled mt-3">
          <li><Link to="/admin/reports" className="text-white text-decoration-none d-block py-1">• Quản lí bài Report</Link></li>
          <li><Link to="/admin/create-account" className="text-white text-decoration-none d-block py-1">• Tạo tài khoản</Link></li>
          <li><Link to="/admin/posts" className="text-white text-decoration-none d-block py-1">• Quản lí bài Post</Link></li>
          <li><Link to="/admin/revenue" className="text-white text-decoration-none d-block py-1">• Phân tích doanh thu</Link></li>
          <li><Link to="/admin/notifications" className="text-white text-decoration-none d-block py-1">• Gửi thông báo</Link></li>
          <li><Link to="/admin-dashboard/manage-user" className="text-white text-decoration-none d-block py-1">• Quản lí User</Link></li>
          <li><Link to="/admin-dashboard/manage-staff" className="text-white text-decoration-none d-block py-1">• Quản lí Staff</Link></li>
          <li><Link to="/admin-dashboard/manage-apartment" className="text-white text-decoration-none d-block py-1">• Quản lí Căn hộ</Link></li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-grow-1 p-3 bg-light">
        {children}
        {/* <StatisticsDashboard/> */}
      </div>
    </div>
  );
}