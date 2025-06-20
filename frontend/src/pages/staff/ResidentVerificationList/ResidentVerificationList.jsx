import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ResidentVerificationList.css";

export default function ResidentVerificationList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:4000/api/users/get-user-apartment"
        );
        if (res.data.success) {
          setUsers(res.data.data);
        } else {
          setError("Không thể tải danh sách người dùng");
        }
      } catch (err) {
        console.error("Lỗi khi gọi API:", err.message);
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Tính toán phân trang
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    
    <div className="user-list-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">BẢN QUẢN LÝ</h2>
        <nav className="sidebar-menu">
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/posts">Quản lý bài post</Link></li>
            <li><Link to="/real-estate">Quản lý bất động sản</Link></li>
            <li><Link to="/vehicles">Quản lý bài đồ xe</Link></li>
            <li><Link to="/expenses">Quản lý chi phí</Link></li>
            <li>
              <span style={{ marginLeft: "10px" }}>Quản lý người dùng ▼</span>
              <ul className="submenu">
                <li><Link to="/residentVerification">Xác Thực</Link></li>
                <li><Link to="/listresidentVerification">Danh Sách Xác Thực</Link></li>
              </ul>
            </li>
            <li><Link to="/revenue">Quản lý doanh thu</Link></li>
            <li><Link to="/login">Đăng Xuất</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <h1>Danh Sách Người Dùng</h1>
          <p>Quản lý thông tin người dùng và căn hộ</p>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="table-container">
            <div className="table-header">
              <h2>Danh sách người dùng</h2>
              <p>Tổng số cư dân: <strong>{users.length}</strong></p>
            </div>

            <div className="table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Ảnh đại diện</th>
                    <th>Mã căn hộ</th>
                    <th>Tòa nhà</th>
                    <th>Tầng</th>
                    <th>Diện tích</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, index) => (
                    <tr key={user._id}>
                      <td>{indexOfFirstUser + index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <img
                          src={user.picture || "/default-avatar.png"}
                          alt={user.name}
                          className="avatar-img"
                        />
                      </td>
                      <td>{user.apartmentId?.apartmentCode || "N/A"}</td>
                      <td>{user.apartmentId?.building || "N/A"}</td>
                      <td>{user.apartmentId?.floor || "N/A"}</td>
                      <td>{user.apartmentId?.area ? `${user.apartmentId.area}m²` : "N/A"}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="empty-state">
                <p>Không có dữ liệu người dùng</p>
              </div>
            )}

            {/* Phân trang */}
            {users.length > usersPerPage && (
              <div className="pagination">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={currentPage === index + 1 ? "active" : ""}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
