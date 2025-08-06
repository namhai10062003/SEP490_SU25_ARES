import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";

const ResidenceDeclarationList = () => {
  const { user, logout } = useAuth();
  const [declarations, setDeclarations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchDeclarations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/residence-declaration/my-declarations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi tải dữ liệu");
      setDeclarations(data.data || []);
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    }
  };

  useEffect(() => {
    fetchDeclarations();
  }, []);

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={user?.name} logout={logout} />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary m-0">
            Hồ sơ tạm trú / tạm vắng của tôi
          </h2>
          {/* 🔹 Nút đăng ký */}
          <Link
            to="/residence-declaration"
            className="btn btn-success rounded-pill fw-semibold"
          >
            + Đăng ký tạm trú-tạm vắng
          </Link>
        </div>

        {/* Bộ lọc */}
        <div className="row mb-4">
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Tìm theo tên..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">🟡 Chờ duyệt</option>
              <option value="true">✅ Đã duyệt</option>
              <option value="false">❌ Đã từ chối</option>
            </select>
          </div>
          <div className="col-md-2 mb-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearchText("");
                setFilterStatus("all");
              }}
            >
              🔄 Xóa lọc
            </button>
          </div>
        </div>

        {/* Danh sách */}
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-primary">
              <tr>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Căn hộ</th>
                <th>Quan hệ</th>
                <th>Thời gian</th>
                <th>Giấy tờ</th>
                <th>Trạng thái</th>
                <th>Lý do từ chối</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {declarations
                .filter((d) =>
                  d.fullName?.toLowerCase().includes(searchText.toLowerCase())
                )
                .filter((d) =>
                  filterStatus === "all"
                    ? true
                    : d.verifiedByStaff === filterStatus
                )
                .map((d) => (
                  <tr key={d._id}>
                    <td>{d.fullName}</td>
                    <td>
                      {d.dateOfBirth &&
                        new Date(d.dateOfBirth).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{d.gender}</td>
                    <td>{d.apartmentId?.apartmentCode || "—"}</td>
                    <td>{d.relationWithOwner}</td>
                    <td>
                      {d.startDate
                        ? new Date(d.startDate).toLocaleDateString("vi-VN")
                        : "—"}{" "}
                      →{" "}
                      {d.endDate
                        ? new Date(d.endDate).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td>
                      {d.documentImage && (
                        <a
                          href={d.documentImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          Xem ảnh
                        </a>
                      )}
                    </td>
                    <td>
                      {d.verifiedByStaff === "true" ? (
                        <span className="badge bg-success">✅ Đã duyệt</span>
                      ) : d.verifiedByStaff === "false" ? (
                        <span className="badge bg-danger">❌ Từ chối</span>
                      ) : (
                        <span className="badge bg-warning text-dark">
                          🟡 Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td>
                      {d.verifiedByStaff === "false" && d.rejectReason && (
                        <span className="text-danger fw-bold">
                          {d.rejectReason}
                        </span>
                      )}
                    </td>
                    <td>
                      {/* 🔹 Nút xem chi tiết */}
                      <Link
                        to={`/residence-declaration/detail/${d._id}`}
                        className="btn btn-primary btn-sm rounded-pill"
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResidenceDeclarationList;
