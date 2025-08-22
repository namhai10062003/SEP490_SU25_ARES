import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingModal from "../../../components/loadingModal";
import StaffNavbar from "./staffNavbar";
const PAGE_SIZE = 10;

export default function WaterExpense() {
  const [file, setFile] = useState(null);
  const [waterData, setWaterData] = useState([]);
  const [page, setPage] = useState(1);
  const [filterMonth, setFilterMonth] = useState("");
const [filterText, setFilterText] = useState("");
const [loadingModal, setLoadingModal] = useState(false);


  useEffect(() => {
    fetchWaterUsage();
  }, []);

  const fetchWaterUsage = async () => {
    setLoadingModal(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/water/usage`);
      setWaterData(res.data);
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu nước từ server!");
    }
    setLoadingModal(false)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Chọn file trước.");
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      setLoadingModal(true); // 👉 bật loading
  
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/water/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
  
      toast.success("📁 Tải file thành công!");
      fetchWaterUsage();
      setFile(null); // reset file nếu cần
    } catch (err) {
      toast.error("❌ Tải file thất bại!");
    } finally {
      setLoadingModal(false); // 👉 tắt loading
    }
  };
  

  // Pagination
  const filteredData = waterData.filter((item) => {
    const matchesMonth = filterMonth
      ? item.month?.startsWith(filterMonth)
      : true;
    const matchesText = filterText
      ? item.apartmentCode?.toLowerCase().includes(filterText.toLowerCase()) ||
        item.ownerName?.toLowerCase().includes(filterText.toLowerCase())
      : true;
    return matchesMonth && matchesText;
  });
  
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const currentData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  return (
    <div className="bg-light min-vh-100">
      
      <div className="d-flex flex-nowrap">
        {/* Sidebar */}
        <div style={{ minWidth: 240, maxWidth: 320 }}>
          <StaffNavbar />
        </div>
        {/* Main content */}
        <main className="flex-grow-1 p-4" style={{ minWidth: 0 }}>
          <div className="mb-4">
            <h1 className="fw-bold" style={{ fontSize: "2.2rem", color: "#333" }}>
              Quản lý chi phí nước
            </h1>
          </div>
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
  <button type="submit" className="btn btn-primary btn-sm">
    📁 Import File
  </button>
</form>

          </div>
          <div className="row g-3 mb-3" style={{ maxWidth: 1000, margin: "0 auto" }}>
  <div className="col-md-3">
    <label className="form-label fw-bold">Lọc theo tháng</label>
    <input
      type="month"
      className="form-control"
      value={filterMonth}
      onChange={(e) => setFilterMonth(e.target.value)}
    />
  </div>
  <div className="col-md-4">
    <label className="form-label fw-bold">Lọc mã căn hộ hoặc tên chủ hộ</label>
    <input
      type="text"
      className="form-control"
      placeholder="Nhập mã căn hộ hoặc tên..."
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
    />
  </div>
</div>

          {currentData.length > 0 ? (
            <div className="table-responsive mb-4" style={{ maxWidth: 1000, margin: "0 auto" }}>
              <table className="table table-bordered table-hover text-center align-middle bg-white rounded-4 shadow">
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
                  {currentData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.apartmentCode}</td>
                      <td>{row.ownerName}</td>
                      <td>{row.month}</td>
                      <td>{row.readingDate || "---"}</td>
                      <td>{row.usage}</td>
                      <td>{row.unitPrice?.toLocaleString()}</td>
                      <td className="fw-bold text-primary">{row.total?.toLocaleString()}</td>
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
                  disabled={page >= totalPages}
                >
                  Next &gt;
                </button>
              </div>
            </div>
          ) : (
            <div className="text-secondary text-center mb-5">Chưa có dữ liệu nước.</div>
          )}
        </main>
      </div>
      {loadingModal && <LoadingModal />}

    </div>
  );
}