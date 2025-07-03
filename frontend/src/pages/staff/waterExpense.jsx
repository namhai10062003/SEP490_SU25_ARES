import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

export default function WaterExpense() {
  const [file, setFile] = useState(null);
  const [waterData, setWaterData] = useState([]);

  // Load dữ liệu nước từ DB khi vào trang
  useEffect(() => {
    fetchWaterUsage();
  }, []);

  const fetchWaterUsage = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/water/usage`);
      setWaterData(res.data);
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu nước từ server!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Chọn file trước.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`http://localhost:4000/api/water/upload`, formData);
      toast.success("Tải file thành công!");
      fetchWaterUsage(); // Sau khi upload thì tải lại danh sách mới
    } catch (err) {
      toast.error("Tải file thất bại!");
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Sidebar */}
      <aside className="bg-primary text-white p-4" style={{ minWidth: 240, minHeight: "100vh" }}>
        <h2 className="fw-bold mb-4 text-warning text-center">BẢNG QUẢN LÝ</h2>
        <nav>
          <ul className="nav flex-column gap-2">
            <li className="nav-item"><Link to="/staff-dashboard" className="nav-link text-white">Dashboard</Link></li>
            <li className="nav-item"><Link to="/posts" className="nav-link text-white">Quản lý bài post</Link></li>
            <li className="nav-item"><Link to="/manage-parkinglot" className="nav-link text-white">Quản lý bãi đỗ xe</Link></li>
            <li className="nav-item"><Link to="/expenses" className="nav-link text-white">Quản lý chi phí</Link></li>
            <li className="nav-item"><Link to="/residentVerification" className="nav-link text-white">Quản lý người dùng</Link></li>
            <li className="nav-item"><Link to="/resident-verify" className="nav-link text-white">Quản lý nhân khẩu</Link></li>
            <li className="nav-item"><Link to="/water-expense" className="nav-link active bg-white text-primary fw-bold">Quản lý chi phí nước</Link></li>
            <li className="nav-item"><Link to="/login" className="nav-link text-white">Đăng Xuất</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-grow-1 p-4">
        <div className="mb-4">
          <h1 className="fw-bold" style={{ fontSize: "2.2rem", color: "#333" }}>Quản lý chi phí nước</h1>
        </div>

        {/* Tiêu đề + import */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap" style={{ maxWidth: 800, margin: "0 auto" }}>
          <h4 className="fw-bold text-primary m-0">📊 Thống kê tiêu thụ nước</h4>

          <form onSubmit={handleSubmit} className="d-flex gap-2">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="form-control form-control-sm"
              style={{ width: 240 }}
            />
            <button type="submit" className="btn btn-primary btn-sm">📁 Import File</button>
          </form>
        </div>

        {/* Bảng dữ liệu nước */}
        {waterData.length > 0 ? (
          <div className="table-responsive mb-5" style={{ maxWidth: 1000, margin: "0 auto" }}>
            <table className="table table-bordered table-hover text-center align-middle bg-white">
              <thead className="table-dark">
                <tr>
                  <th>Căn hộ</th>
                  <th>Tên chủ căn hộ</th>
                  <th>Tháng</th>
                  <th>Ngày ghi</th>
                  <th>Số nước (m³)</th>
                  <th>Đơn giá (VND)</th>
                  <th>Thành tiền (VND)</th>
                </tr>
              </thead>
              <tbody>
                {waterData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.apartmentCode}</td>
                    <td>{row.ownerName}</td>
                    <td>{row.month}</td>
                    <td>{row.readingDate || "---"}</td>
                    <td>{row.usage}</td>
                    <td>{row.unitPrice.toLocaleString()}</td>
                    <td className="fw-bold text-primary">{row.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-secondary text-center mb-5">Chưa có dữ liệu nước.</div>
        )}
      </main>
    </div>
  );
}
