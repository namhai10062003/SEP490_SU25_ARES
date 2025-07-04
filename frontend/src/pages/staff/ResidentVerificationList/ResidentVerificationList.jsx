import axios from "axios";
import React, { useEffect, useState } from "react";
import StaffNavbar from "../staffNavbar";

export default function ResidentVerificationList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Phân trang
  const USERS_PER_PAGE = 20;
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/get-user-apartment`
        );
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
  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const indexOfLastUser = page * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="d-flex min-vh-100 bg-light">
      <StaffNavbar />
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
            {/* Pagination */}
            <div className="d-flex justify-content-center align-items-center mt-3">
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                &lt; Prev
              </button>
              <span style={{ minWidth: 90, textAlign: "center" }}>
                Trang {page} / {totalPages || 1}
              </span>
              <button
                className="btn btn-outline-secondary ms-2"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages || totalPages === 0}
              >
                Next &gt;
              </button>
            </div>
            {users.length === 0 && (
              <div className="text-center py-5 text-secondary">
                Không có dữ liệu người dùng
              </div>
            )}


          </div>
        )}
      </main>
    </div>
  );
}