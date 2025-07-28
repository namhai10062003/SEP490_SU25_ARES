import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext.jsx";
const API_ME_URL = `${import.meta.env.VITE_API_URL}/api/contracts/me`;
const API_WITHDRAWAL = `${import.meta.env.VITE_API_URL}/api/withdrawals`;

const PAGE_SIZE = 10;

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN").format(price || 0) + " đ";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};



const UserRevenue = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contracts, setContracts] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  // For contracts table
  const [contractSearchText, setContractSearchText] = useState("");
  const [contractFilterDate, setContractFilterDate] = useState("");

  // For withdrawal history table
  const [withdrawSearchText, setWithdrawSearchText] = useState("");
  const [withdrawFilterDate, setWithdrawFilterDate] = useState("");
  const [withdrawForm, setWithdrawForm] = useState({
    accountHolder: "",
    bankNumber: "",
    bankName: "",
    amount: "",
  });
  const [withdrawMessage, setWithdrawMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [name, setName] = useState(null);
  // kiểm tra người thuê
  const hasNotified = useRef(false);

  useEffect(() => {
    if (user && contracts.length > 0 && !hasNotified.current) {
      const firstContract = contracts[0];

      if (firstContract.userId?.toString() === user._id?.toString()) {
        console.warn("🚫 Người thuê đang cố truy cập trang Doanh thu");
        toast.error("❌ Bạn không có quyền truy cập trang này (chỉ dành cho bên cho thuê)", {
          autoClose: 3000,
        });
        hasNotified.current = true; // đánh dấu đã thông báo
        setTimeout(() => navigate("/"), 3100);
      }
    }
  }, [user, contracts]);
  // setname
  useEffect(() => {
    if (user && user.name) {
      setName(user.name); // ✅ cập nhật tên từ user
    }
  }, [user]);
  const fetchWithdrawHistory = async (token) => {
    try {
      const res = await axios.get(`${API_WITHDRAWAL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWithdrawHistory(res.data.data || []);
    } catch (err) {
      console.error("❌ Không thể tải lịch sử rút tiền:", err);
    }
  };

  const fetchContracts = async (token) => {
    try {
      const res = await axios.get(API_ME_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContracts(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi lấy hợp đồng người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchContracts(token);
      fetchWithdrawHistory(token);
    }
  }, []);

  // ✅ Lọc và phân trang hợp đồng
  const filteredContracts = contracts.filter((c) => {
    const keyword = contractSearchText.toLowerCase();

    const matchesSearch =
      c.apartmentCode?.toLowerCase().includes(keyword) ||
      c.fullNameB?.toLowerCase().includes(keyword) ||
      c.orderCode?.toLowerCase().includes(keyword) ||
      c.depositAmount?.toString().includes(keyword) ||
      c.withdrawableAmount?.toString().includes(keyword);

    const matchesDate = contractFilterDate
      ? new Date(c.paymentDate).toLocaleDateString("vi-VN") ===
      new Date(contractFilterDate).toLocaleDateString("vi-VN")
      : true;

    return (
      c.paymentStatus === "paid" &&
      c.depositAmount &&
      matchesSearch &&
      matchesDate
    );
  });

  const paginatedContracts = filteredContracts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredContracts.length / PAGE_SIZE));
    setTotalPages(pages);
    if (page > pages) setPage(1);
  }, [filteredContracts]);

  // ✅ Tính tổng số tiền có thể rút
  const totalWithdrawable = filteredContracts.reduce(
    (sum, c) =>
      sum +
      (typeof c.withdrawableAmount === "number" ? c.withdrawableAmount : 0),
    0
  );

  const handleWithdrawChange = (e) => {
    setWithdrawForm({ ...withdrawForm, [e.target.name]: e.target.value });
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawMessage("");

    const amount = parseFloat(withdrawForm.amount);
    const EPSILON = 0.01;

    if (isNaN(amount) || amount <= 0 || amount - totalWithdrawable > EPSILON) {
      setWithdrawMessage("❌ Số tiền rút không hợp lệ.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(API_WITHDRAWAL, withdrawForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWithdrawMessage("✅ Gửi yêu cầu rút tiền thành công!");
      setWithdrawForm({
        accountHolder: "",
        bankNumber: "",
        bankName: "",
        amount: "",
      });

      await Promise.all([
        fetchContracts(token),
        fetchWithdrawHistory(token),
      ]);
    } catch (err) {
      console.error("❌ Gửi yêu cầu thất bại:", err);
      setWithdrawMessage("❌ Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const filteredWithdrawHistory = withdrawHistory.filter((w) => {
    const keyword = withdrawSearchText.toLowerCase();

    const matchesSearch =
      w.bankName?.toLowerCase().includes(keyword) ||
      w.bankNumber?.toLowerCase().includes(keyword) ||
      w.status?.toLowerCase().includes(keyword) ||
      w.amount?.toString().includes(keyword);

    const matchesDate = withdrawFilterDate
      ? new Date(w.createdAt).toLocaleDateString("vi-VN") ===
      new Date(withdrawFilterDate).toLocaleDateString("vi-VN")
      : true;

    return matchesSearch && matchesDate;
  });


  return (
    <>
      <Header user={user} name={name} logout={logout} />
      <div className="container py-4">
        <div className="bg-primary text-white rounded-4 p-3 mb-4 text-center">
          <h2 className="mb-0">💰 Doanh thu của bạn</h2>
        </div>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <>
            <h5 className="mb-3 text-end">
              Tổng tiền có thể rút:{" "}
              <span className="text-success fw-bold">
                {formatPrice(totalWithdrawable)}
              </span>
            </h5>

            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm..."
                  value={contractSearchText}
                  onChange={(e) => {
                    setContractSearchText(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  value={contractFilterDate}
                  onChange={(e) => {
                    setContractFilterDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="col-md-2">
                {(contractSearchText || contractFilterDate) && (
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setContractSearchText("");
                      setContractFilterDate("");
                    }}
                  >
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>


            {/* Danh sách hợp đồng */}
            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Mã căn hộ</th>
                    <th>Khách thuê</th>
                    <th>Ngày thanh toán</th>
                    <th>Tiền cọc</th>
                    <th>Tiền nhận được</th>
                    <th>Mã giao dịch</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedContracts.length > 0 ? (
                    paginatedContracts.map((c, idx) => (
                      <tr key={c._id}>
                        <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td>{c.apartmentCode || "Không có"}</td>
                        <td>{c.fullNameB || "Chưa cập nhật"}</td>
                        <td>{formatDate(c.paymentDate)}</td>
                        <td>{formatPrice(c.depositAmount)}</td>
                        <td className="text-success fw-bold">
                          {formatPrice(
                            typeof c.withdrawableAmount === "number"
                              ? c.withdrawableAmount
                              : Math.round(c.depositAmount * 0.9)
                          )}
                        </td>
                        <td>{c.orderCode || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        Không có hợp đồng thanh toán nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="d-flex justify-content-center align-items-center mt-3">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                &lt; Prev
              </button>
              <span style={{ minWidth: 90, textAlign: "center" }}>
                Trang {page} / {totalPages}
              </span>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Next &gt;
              </button>
            </div>

            {/* Form rút tiền */}
            {totalWithdrawable > 0 && (
              <div className="mt-3">
                <div className="row shadow rounded-4 p-4 bg-white">
                  <div className="col-md-6">
                    <h5 className="mb-4 border-start border-4 ps-3 text-primary">
                      Thông tin tài khoản ngân hàng
                    </h5>
                    <form onSubmit={handleWithdrawSubmit}>
                      {["accountHolder", "bankNumber", "bankName"].map((field) => (
                        <div className="mb-3" key={field}>
                          <label className="form-label fw-bold">
                            {{
                              accountHolder: "Tên Chủ Tài Khoản",
                              bankNumber: "Số Tài Khoản",
                              bankName: "Ngân hàng",
                            }[field]}
                          </label>
                          <input
                            type="text"
                            name={field}
                            className="form-control"
                            value={withdrawForm[field]}
                            onChange={handleWithdrawChange}
                            required
                          />
                        </div>
                      ))}
                      <div className="mb-3">
                        <label className="form-label fw-bold">Số tiền muốn rút</label>
                        <input
                          type="number"
                          name="amount"
                          className="form-control"
                          value={withdrawForm.amount}
                          onChange={handleWithdrawChange}
                          required
                          min={1000}
                          step="any"
                        />
                        <small className="text-muted">
                          Tối đa: {formatPrice(totalWithdrawable)}
                        </small>
                      </div>
                      <button type="submit" className="btn btn-primary w-100">
                        Rút tiền
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary mt-2"
                        onClick={() =>
                          setWithdrawForm({
                            ...withdrawForm,
                            amount: totalWithdrawable.toFixed(2),
                          })
                        }
                      >
                        Rút toàn bộ ({formatPrice(totalWithdrawable)})
                      </button>
                      {withdrawMessage && (
                        <div className="alert alert-info mt-3 text-center">
                          {withdrawMessage}
                        </div>
                      )}
                    </form>
                  </div>

                  <div className="col-md-6 d-flex flex-column justify-content-center">
                    <p className="fw-bold mb-2">
                      ADMIN SẼ NHẬN ĐƯỢC THÔNG BÁO RÚT TIỀN
                    </p>
                    <p>
                      **NẾU SAU 24H CHƯA THẤY TIỀN VỀ TÀI KHOẢN <br />
                      HÃY GỬI REPORT TỚI ADMIN BẰNG GMAIL
                    </p>
                    <p className="fw-bold text-primary">ADMIN@GMAIL.COM</p>
                    <p className="text-muted mt-4">
                      ***THANKS FOR USING WEBSITE***
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="row g-3 mb-3 mt-2">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm..."
                  value={withdrawSearchText}
                  onChange={(e) => setWithdrawSearchText(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  value={withdrawFilterDate}
                  onChange={(e) => setWithdrawFilterDate(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                {(withdrawSearchText || withdrawFilterDate) && (
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setWithdrawSearchText("");
                      setWithdrawFilterDate("");
                    }}
                  >
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>


            {/* Lịch sử yêu cầu rút tiền */}
            <div className="mt-4">
              <h5 className="mb-3 border-start border-4 ps-3 text-primary">
                📝 Lịch sử các yêu cầu rút tiền
              </h5>
              {filteredWithdrawHistory.length === 0 ? (
                <p className="text-muted">Chưa có yêu cầu nào.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Ngày gửi</th>
                        <th>Số tiền</th>
                        <th>Ngân hàng</th>
                        <th>Số tài khoản</th>
                        <th>Trạng thái</th>
                        <th>Lý do từ chối</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWithdrawHistory.map((w) => (
                        <tr key={w._id}>
                          <td>{formatDate(w.createdAt)}</td>
                          <td>{formatPrice(w.amount)}</td>
                          <td>{w.bankName}</td>
                          <td>{w.bankNumber}</td>
                          <td>
                            <span
                              className={`badge text-capitalize ${w.status === "approved"
                                ? "bg-success"
                                : w.status === "rejected"
                                  ? "bg-danger"
                                  : "bg-warning text-dark"
                                }`}
                            >
                              {w.status}
                            </span>
                          </td>
                          <td>{w.rejectedReason || "--"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default UserRevenue;
