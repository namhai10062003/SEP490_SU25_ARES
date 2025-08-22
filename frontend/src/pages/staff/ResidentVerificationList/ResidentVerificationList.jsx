import axios from "axios";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import LoadingModal from "../../../../components/loadingModal";
import StaffNavbar from "../staffNavbar";
const USERS_PER_PAGE = 20;

export default function ResidentVerificationList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchDate, setSearchDate] = useState("");

  const [show, setShow] = useState(false);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/resident-verifications/get-user-apartment`
      );
      setUsers(res.data?.data || []);
      console.log("✅ Dữ liệu từ API:", res.data);
      setError(null);
    } catch (err) {
      console.error("❌ Lỗi khi fetch users:", err);
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ...
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users
    .filter((u) => {
      const query = searchQuery.toLowerCase();
      return (
        (!searchQuery ||
          u.name?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.apartmentCode?.toLowerCase().includes(query)) &&
        (!searchDate || (u.approvedAt && new Date(u.approvedAt).toISOString().slice(0, 10) === searchDate))
      );
    })
    .sort((a, b) => new Date(b.approvedAt || 0) - new Date(a.approvedAt || 0));

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const indexOfFirst = (page - 1) * USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfFirst + USERS_PER_PAGE);


  return (
    <div className="d-flex min-vh-100 bg-light">
      <StaffNavbar />
      <main className="flex-grow-1 p-4">
        <div className="text-center mb-4">
          <h2 className="fw-bold text-dark">Danh Sách Cư Dân</h2>
          <p className="text-secondary">Thông tin căn hộ và hợp đồng cư trú</p>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo tên, email, hoặc mã căn hộ"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // reset về trang đầu khi tìm kiếm
              }}
            />
          </div>
          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              value={searchDate}
              onChange={(e) => {
                setSearchDate(e.target.value);
                setPage(1); // reset trang khi lọc theo ngày
              }}
            />
          </div>
        </div>



        {loading && <LoadingModal />}

{!loading && error && (
  <div className="alert alert-danger text-center">{error}</div>
)}

{!loading && !error && (
  <div className="table-responsive">
    <table className="table table-bordered bg-white rounded-4 shadow-sm align-middle">
      <thead className="table-primary">
        <tr>
          <th>STT</th>
          <th>Họ và Tên</th>
          <th>Email</th>
          <th>Mã Căn Hộ</th>
          <th>Vai Trò</th>
          <th>Hình Hợp Đồng</th>
          <th>Ngày Duyệt</th>
        </tr>
      </thead>
      <tbody>
        {currentUsers.map((user, index) => (
          <tr key={`${user.email}-${index}`}>
            <td>{indexOfFirst + index + 1}</td>
            <td>{user.name || "N/A"}</td>
            <td>{user.email || "N/A"}</td>
            <td>{user.apartmentCode || "N/A"}</td>
            <td>
              <span
                className={`badge text-light ${user.role === "Chủ hộ" ? "bg-primary" : "bg-success"}`}
              >
                {user.role}
              </span>
            </td>

            <td className="p-2">
              {user.contractImage ? (
                <>
                  <img
                    src={user.contractImage}
                    alt="Hợp đồng"
                    className="rounded shadow-sm"
                    style={{ width: 60, cursor: "pointer", border: "1px solid #ccc" }}
                    onClick={() => setShow(true)}
                  />

                  {/* Modal xem ảnh */}
                  <Modal show={show} onHide={() => setShow(false)} centered size="lg">
                    <Modal.Body className="text-center">
                      <img
                        src={user.contractImage}
                        alt="Hợp đồng"
                        style={{ maxWidth: "100%", maxHeight: "80vh" }}
                      />
                    </Modal.Body>
                  </Modal>
                </>
              ) : (
                <span className="text-muted ms-2">Không có</span>
              )}
            </td>

            <td>
              {user.approvedAt
                ? new Date(user.approvedAt).toLocaleDateString("vi-VN")
                : <span className="text-muted">-</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Pagination */}
    <div className="d-flex justify-content-center align-items-center mt-3">
      <button
        className="btn btn-outline-secondary me-2"
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        disabled={page <= 1}
      >
        &lt; Trước
      </button>
      <span className="mx-2">
        Trang {page} / {totalPages || 1}
      </span>
      <button
        className="btn btn-outline-secondary ms-2"
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={page >= totalPages}
      >
        Tiếp &gt;
      </button>
    </div>

    {users.length === 0 && (
      <div className="text-center py-5 text-secondary">
        Không có dữ liệu cư dân.
      </div>
    )}
  </div>
)}

      </main>
    </div>
  );
}
