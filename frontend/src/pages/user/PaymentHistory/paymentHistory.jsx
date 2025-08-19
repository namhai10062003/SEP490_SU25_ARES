import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../../../../components/header.jsx";
import { useAuth } from "../../../../context/authContext.jsx"; // import useAuth
import h1 from "../../../../public/logo_2.png";
import h2 from "../../../../public/mb.jpg";
export default function PaymentHistoryTable() {
  const { user, logout } = useAuth(); // lấy user và logout từ context
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const userId = user?._id || localStorage.getItem("userId"); // ưu tiên lấy user từ context
  const name = user?.name || "";

  useEffect(() => {
    if (!userId || !token) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/payment-history/history/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.success) setHistory(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, token]);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <>
      <Header user={user} name={name} logout={logout} /> {/* truyền props */}
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold">Danh sách thanh toán</h2>
          <span className="text-muted">{`Tổng: ${history.length} giao dịch`}</span>
        </div>
        <div className="table-responsive" style={{ maxHeight: "600px", overflowY: "auto" }}>
          <table className="table table-hover align-middle">
            <thead className="table-light sticky-top">
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
              {history.map((h, i) => (
                <tr key={i}>
                  {/* Kênh thanh toán với icon */}
                  <td className="text-truncate" style={{ maxWidth: "150px" }}>
                    <div className="d-flex align-items-center">
                      <img
                        src={h1}
                        alt="icon"
                        style={{ width: "24px", height: "24px", marginRight: "8px" }}
                      />
                      {h.channel}
                    </div>
                  </td>

                  <td className="fw-bold">
                    <span className="text-primary">
                      {Number(h.orderAmount).toLocaleString()}
                    </span>{" "}
                    <span className="text-muted">VND</span>
                  </td>

                  <td className="fw-bold">
                    <span className="text-success">
                      {Number(h.paidAmount).toLocaleString()}
                    </span>{" "}
                    <span className="text-muted">VND</span>
                  </td>

                  <td>{new Date(h.createdAt).toLocaleString("vi-VN")}</td>

                  <td className="text-truncate" style={{ maxWidth: "300px" }}>
                    {h.description}
                  </td>

                  {/* Số tài khoản với icon */}
                  <td>
                    <div className="d-flex align-items-center">
                      <img
                        src={h2}
                        alt="account"
                        style={{ width: "24px", height: "24px", marginRight: "8px" }}
                      />
                      {h.accountNumber}
                    </div>
                  </td>

                  <td className="text-truncate" style={{ maxWidth: "150px" }}>
                    {h.orderCode}
                  </td>

                  <td>
                    <span
                      className={`badge ${h.status === "paid"
                          ? "bg-success text-white"
                          : "bg-danger text-white"
                        }`}
                      style={{ padding: "0.4em 0.6em", fontSize: "0.9em" }}
                    >
                      {h.status === "paid" ? "Đã thanh toán" : "Hủy"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </>
  );
}
