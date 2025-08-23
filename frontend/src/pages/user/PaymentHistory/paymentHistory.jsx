import axios from "axios";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import React, { useEffect, useState } from "react";
import UniversalFilter from "../../../../components/filter.jsx";
import Header from "../../../../components/header.jsx";
import LoadingModal from "../../../../components/loadingModal.jsx";
import { useAuth } from "../../../../context/authContext.jsx";

export default function PaymentHistoryTable() {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userId = user?._id || localStorage.getItem("userId");
  const name = user?.name || "";

  useEffect(() => {
    if (!userId || !token) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/payment-history/history/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.success) {
          setHistory(res.data.data);
          setFilteredHistory(res.data.data); // copy cho filter
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, token]);

  // Các field filter
  const filterFields = [
    { name: "status", type: "select", options: ["Tất cả", "Đã thanh toán"] },
    { name: "channel", type: "text", placeholder: "Kênh thanh toán" },
    { name: "orderCode", type: "text", placeholder: "Mã đơn hàng" },
    { 
      name: "type", 
      type: "select", 
      options: ["Tất cả", "Bài đăng", "Hợp đồng", "Phí dịch vụ"] 
    },
  ];
  // Hàm lọc
  const handleFilter = () => {
    let filtered = [...history];
  
    if (filters.status) {
      const statusMap = { "Đã thanh toán": "paid" };
      filtered = filtered.filter((h) => h.status === statusMap[filters.status]);
    }
  
    if (filters.channel) {
      filtered = filtered.filter((h) =>
        h.channel?.toLowerCase().includes(filters.channel.toLowerCase())
      );
    }
  
    if (filters.orderCode) {
      filtered = filtered.filter((h) =>
        h.orderCode?.toLowerCase().includes(filters.orderCode.toLowerCase())
      );
    }
  
    if (filters.type) {
      const typeMap = {
        "Bài đăng": "post",
        "Hợp đồng": "contract",
        "Phí dịch vụ": "fee",
      };
      filtered = filtered.filter((h) => h.type === typeMap[filters.type]);
    }
  
    setFilteredHistory(filtered);
  };
  
  

  // Reset filter
  const handleReset = () => {
    setFilters({});
    setFilteredHistory(history);
  };

  if (loading) return <LoadingModal />;

  return (
    <>
      <Header user={user} name={name} logout={logout} />
      <div className="container mt-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded shadow-sm bg-light">
          <h2 className="fw-bold text-primary m-0 d-flex align-items-center">
            <i className="bi bi-credit-card me-2"></i> 📑 Danh sách thanh toán
          </h2>
          <div className="d-flex align-items-center">
            <span className="badge bg-secondary me-3">
              Tổng: {filteredHistory.length} giao dịch
            </span>
            {/* <button className="btn btn-sm btn-success">
              <i className="bi bi-download"></i> Xuất Excel
            </button> */}
          </div>
        </div>

        {/* Filter */}
        <UniversalFilter
          filters={filters}
          setFilters={setFilters}
          onFilter={handleFilter}
          onReset={handleReset}
          fields={filterFields}
        />

        {/* Card chứa bảng */}
        <div className="card shadow-lg border-0 rounded-3">
          <div className="card-body">
            <div className="table-responsive">
              <table
                id="paymentTable"
                className="table table-hover table-striped table-bordered align-middle"
                style={{ width: "100%", borderRadius: "10px", overflow: "hidden" }}
              >
                <thead className="table-dark text-center">
                  <tr>
                    <th>Kênh thanh toán</th>
                    <th>Tiền đơn hàng</th>
                    <th>Tiền thanh toán</th>
                    <th>Ngày tạo</th>
                    <th>Mô tả</th>
                    <th>Số tài khoản</th>
                    <th>Mã đơn hàng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((h, i) => (
                    <tr key={i}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src="/images/logo_2.png"
                            alt="icon"
                            style={{
                              width: "28px",
                              height: "28px",
                              marginRight: "8px",
                              borderRadius: "50%",
                            }}
                          />
                          <span className="fw-semibold">{h.channel}</span>
                        </div>
                      </td>
                      <td className="fw-bold text-primary">
                        {Number(h.orderAmount).toLocaleString()}{" "}
                        <span className="text-muted">VND</span>
                      </td>
                      <td className="fw-bold text-success">
                        {Number(h.paidAmount).toLocaleString()}{" "}
                        <span className="text-muted">VND</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {new Date(h.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </td>
                      <td className="text-truncate">{h.description}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src="/images/mb.jpg"
                            alt="account"
                            style={{
                              width: "28px",
                              height: "28px",
                              marginRight: "8px",
                              borderRadius: "50%",
                            }}
                          />
                          <span>{h.accountNumber}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-dark fw-semibold">{h.orderCode}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            h.status === "paid" ? "bg-success" : "bg-danger"
                          } px-3 py-2`}
                          style={{ fontSize: "0.9em", borderRadius: "8px" }}
                        >
                          {h.status === "paid" ? "✅ Đã thanh toán" : "❌ Hủy"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {loading && <LoadingModal />}
      </div>
    </>
  );
}
