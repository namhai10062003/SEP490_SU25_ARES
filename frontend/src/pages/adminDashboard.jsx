import React from "react";
import { Link } from "react-router-dom";
import "./adminDashboard.css";

const stats = [
  { title: "Doanh thu hôm nay", value: "$65.4K", change: "▲ So với trước" },
  { title: "Tỉ lệ tăng trưởng", value: "78.4%", change: "▲ So với trước" },
  { title: "Người dùng đang hoạt động", value: "42.5K", change: "▲ So với trước" },
  { title: "Tổng số người dùng", value: "97.4K", change: "▼ So với trước" },
  { title: "Tổng lượt click", value: "82.7K", change: "▲ So với trước" },
];

export default function AdminDashboard() {
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
          <li><Link to="/admin/users" className="text-white text-decoration-none d-block py-1">• Quản lí User</Link></li>
          <li><Link to="/admin/staff" className="text-white text-decoration-none d-block py-1">• Quản lí Staff</Link></li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-grow-1 p-5 bg-light">
        <h2 className="fw-bold mb-4">Dashboard tổng hợp</h2>
        <div className="row g-4">
          {stats.map((item, index) => (
            <div key={index} className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6 className="card-title fw-bold">{item.title}</h6>
                  <h4 className="text-primary">{item.value}</h4>
                  <small className="text-muted">{item.change}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
