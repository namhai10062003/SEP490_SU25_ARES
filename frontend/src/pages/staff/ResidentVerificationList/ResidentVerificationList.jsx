import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
        // Không kiểm tra res.data.success nữa
        setUsers(res.data.data || []);
      } catch (err) {
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
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <aside className="bg-primary text-white p-4" style={{ minWidth: 240 }}>
        <h2 className="fw-bold mb-4 text-warning text-center">BẢN QUẢN LÝ</h2>
        <nav>
          <ul className="nav flex-column gap-2">
            <li className="nav-item"><Link to="/staff-dashboard" className="nav-link text-white">Dashboard</Link></li>
            <li className="nav-item"><Link to="/posts" className="nav-link text-white">Quản lý bài post</Link></li>
            <li className="nav-item"><Link to="/real-estate" className="nav-link text-white">Quản lý bất động sản</Link></li>
            <li className="nav-item"><Link to="/manage-parkinglot" className="nav-link text-white">Quản lý bài đồ xe</Link></li>
            <li className="nav-item"><Link to="/expenses" className="nav-link text-white">Quản lý chi phí</Link></li>
            <li className="nav-item"><Link to="/residentVerification" className="nav-link active bg-white text-primary fw-bold">Quản lý người dùng</Link></li>
            <li className="nav-item"><Link to="/revenue" className="nav-link text-white">Quản lý doanh thu</Link></li>
            <li className="nav-item"><Link to="/login" className="nav-link text-white">Đăng Xuất</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-grow-1 p-4">
        <div className="mb-4 text-center">
          <h1 className="fw-bold" style={{
            fontSize: "2.2rem",
            color: "#333",
            marginBottom: 8,
            fontWeight: 600,
            textAlign: "center"
          }}>
            Danh Sách Người Dùng
          </h1>
          <p className="text-secondary">Quản lý thông tin người dùng và căn hộ</p>
        </div>

        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-border text-primary mb-3" style={{ width: 40, height: 40 }}></div>
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle bg-white rounded-4 shadow">
              <thead className="table-primary">
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
                        style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
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

            {users.length === 0 && (
              <div className="text-center py-5 text-secondary">
                Không có dữ liệu người dùng
              </div>
            )}

            {/* Phân trang */}
            {users.length > usersPerPage && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  {[...Array(totalPages)].map((_, index) => (
                    <li key={index} className={`page-item${currentPage === index + 1 ? " active" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        )}
      </main>
    </div>
  );
}