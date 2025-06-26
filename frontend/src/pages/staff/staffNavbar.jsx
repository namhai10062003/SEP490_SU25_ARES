import React from "react";
import { Link } from "react-router-dom";

const StaffNavbar = () => (
    <aside className="sidebar">
        <h2 className="sidebar-title">BẢN QUẢN LÝ</h2>
        <nav className="sidebar-menu">
            <ul>
                <li><Link to="/staff-dashboard">Dashboard</Link></li>
                <li><Link to="/posts">Quản lý bài post</Link></li>
                <li><Link to="/real-estate">Quản lý bất động sản</Link></li>
                <li><Link to="/manage-parkinglot">Quản lý bãi đồ xe</Link></li>
                <li><Link to="/manage-expenses">Quản lý chi phí</Link></li>
                <li><Link to="/residentVerification">Quản lý người dùng</Link></li>
                <li><Link to="/resident-verify">Quản lý nhân khẩu</Link></li>
                <li><Link to="/revenue">Quản lý doanh thu</Link></li>
                <li><Link to="/login">Đăng Xuất</Link></li>
            </ul>
        </nav>
    </aside>
);

export default StaffNavbar;