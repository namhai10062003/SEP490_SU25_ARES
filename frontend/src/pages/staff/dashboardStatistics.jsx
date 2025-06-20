import React from "react";
import StaffDashboard from "./staffDashboard";

const stats = [
    { title: 'Bài Post', count: 128, color: 'blue' },
    { title: 'Căn hộ & BĐS', count: 56, color: 'green' },
    { title: 'Bài đồ xe', count: 78, color: 'orange' },
    { title: 'Chi phí', count: 45, color: 'red' },
];

const users = [
    { name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'Admin', date: '2024-01-15' },
    { name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'Nhân viên', date: '2024-02-12' },
    { name: 'Phạm Văn C', email: 'phamvanc@gmail.com', role: 'Khách hàng', date: '2024-03-10' },
];

const DashboardPage = () => (
    <StaffDashboard>
        <h2>Bảng điều khiển</h2>
        <div className="stat-boxes" style={{ display: "flex", gap: 16, marginBottom: 32 }}>
            {stats.map((item, idx) => (
                <div key={idx} className={`stat-box ${item.color}`} style={{ padding: 16, borderRadius: 8, background: "#f5f5f5", minWidth: 150 }}>
                    <div className="stat-title" style={{ fontWeight: "bold" }}>{item.title}</div>
                    <div className="stat-count" style={{ fontSize: 24 }}>{item.count}</div>
                    <button className="stat-btn" style={{ marginTop: 8 }}>Xem chi tiết</button>
                </div>
            ))}
        </div>
        <div className="user-table">
            <h3>Danh sách người dùng</h3>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Ngày đăng ký</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, idx) => (
                        <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </StaffDashboard>
);

export default DashboardPage;