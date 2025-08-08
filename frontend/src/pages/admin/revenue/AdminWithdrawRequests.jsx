import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import {
  approveWithdrawal,
  fetchAllWithdrawals,
  rejectWithdrawal,
} from "../../../service/withdrawService";
import AdminDashboard from "../adminDashboard";
import Pagination from "../../../../components/Pagination.jsx";
import StatusFilter from "../../../../components/admin/statusFilter.jsx";
import LoadingModal from "../../../../components/loadingModal.jsx";
import ReusableModal from "../../../../components/ReusableModal.jsx";
import SearchInput from "../../../../components/admin/searchInput.jsx";
import { formatPrice } from "../../../../utils/format.jsx";

const AdminWithdrawPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialPageSize = Number(searchParams.get("pageSize")) || 10;

  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [rejectReason, setRejectReason] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const updateQuery = (newParams = {}) => {
    const updated = {
      ...Object.fromEntries(searchParams.entries()),
      ...newParams,
    };
    Object.keys(updated).forEach(
      (key) => (updated[key] === "" || updated[key] == null) && delete updated[key]
    );
    setSearchParams(updated);
  };

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetchAllWithdrawals();
      const allData = res.data || [];

      // Lọc theo trạng thái nếu có
      let filtered = filter
        ? allData.filter((r) => r.status === filter)
        : allData;

      // Lọc theo searchTerm
      if (searchTerm.trim()) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter((w) =>
        (w.user?.name?.toLowerCase().includes(lowerSearch) ||
          w.user?.email?.toLowerCase().includes(lowerSearch) ||
          w.accountHolder?.toLowerCase().includes(lowerSearch) ||
          w.bankNumber?.includes(lowerSearch) ||
          w.bankName?.toLowerCase().includes(lowerSearch) ||
          String(w.amount).includes(searchTerm.trim()))
        );
      }

      // Sắp xếp theo approvedAt
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(a.approvedAt || a.createdAt); // fallback nếu chưa có approvedAt
        const dateB = new Date(b.approvedAt || b.createdAt);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });

      setWithdrawals(filtered);
    } catch (err) {
      toast.error("Không thể nạp danh sách yêu cầu rút tiền!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, [filter, searchTerm, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(withdrawals.length / pageSize) || 1;
  const pagedWithdrawals = withdrawals.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1); // Reset page khi filter/search thay đổi
  }, [searchTerm, filter]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  const openRejectModal = (id) => {
    setSelectedId(id);
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectReason("");
    setSelectedId(null);
  };

  const handleApprove = async (id) => {
    try {
      await approveWithdrawal(id);
      toast.success("✅ Đã duyệt yêu cầu!");
      loadWithdrawals();
    } catch (err) {
      toast.error("❌ Duyệt thất bại: " + err.response?.data?.message);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối!");
      return;
    }
    try {
      await rejectWithdrawal(selectedId, rejectReason); // CHỈ TRUYỀN CHUỖI
      toast.success("❌ Đã từ chối yêu cầu!");
      closeRejectModal();
      loadWithdrawals();
    } catch (err) {
      toast.error("❌ Từ chối thất bại: " + err.response?.data?.message);
    }
  };

  return (
    <AdminDashboard active="withdrawals">
      {loading && <LoadingModal />}


      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Yêu cầu rút tiền</h2>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div className="d-flex gap-2">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder="Tìm theo tên, email, chủ tài khoản..."
            width={400}
          />
          <select
            className="form-select w-auto"
            style={{ maxWidth: 180 }}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>

          <StatusFilter
            value={filter}
            onChange={setFilter}
            type="withdraw"
          />
        </div>
      </div>

      <div className="card w-100">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>STT</th>
                  <th>Người yêu cầu</th>
                  <th>Chủ tài khoản</th>
                  <th>Số tài khoản</th>
                  <th>Ngân hàng</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : pagedWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      Không có yêu cầu phù hợp
                    </td>
                  </tr>
                ) : (
                  pagedWithdrawals.map((w, idx) => (
                    <tr key={w._id}>
                      <td>{(page - 1) * pageSize + idx + 1}</td>
                      <td>
                        {w.user?.name || "Ẩn danh"}
                        <br />
                        <small>{w.user?.email}</small>
                      </td>
                      <td>{w.accountHolder}</td>
                      <td>{w.bankNumber}</td>
                      <td>{w.bankName}</td>
                      <td>{formatPrice(w.amount)}</td>
                      <td>
                        <span
                          className={`badge ${w.status === "approved"
                            ? "bg-success"
                            : w.status === "rejected"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                            }`}
                        >
                          {w.status === "pending" ? "Chờ duyệt" :
                            w.status === "approved" ? "Đã duyệt" :
                              w.status === "rejected" ? "Từ chối" : w.status}
                        </span>
                      </td>
                      <td>
                        {w.status === "rejected" ? (
                          <span className="text-danger">{w.rejectedReason || "--"}</span>
                        ) : w.status === "approved" ? (
                          <span className="text-success">
                            Duyệt lúc {new Date(w.approvedAt).toLocaleString()}
                          </span>
                        ) : (
                          "--"
                        )}
                      </td>
                      <td>
                        {w.status === "pending" ? (
                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleApprove(w._id)}
                            >
                              ✅ Duyệt
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => openRejectModal(w._id)}
                            >
                              ❌ Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => {
          setPage(p);
          updateQuery({ page: p });
        }}
        pageSize={pageSize}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
          updateQuery({ pageSize: s, page: 1 });
        }}
      />

      {/* Modal từ chối */}
      {rejectModalOpen && (
        <ReusableModal
          show={rejectModalOpen}
          onClose={closeRejectModal}
          title="Lý do từ chối"
          body={
            <div className="mb-3">
              <label>Lý do từ chối:</label>
              <textarea
                className="form-control"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
              />
            </div>
          }
          footerButtons={[
            {
              label: "Hủy",
              variant: "secondary",
              onClick: closeRejectModal,
            },
            {
              label: "Gửi từ chối",
              variant: "danger",
              onClick: handleRejectConfirm,
            },
          ]}
        />
      )}

    </AdminDashboard>
  );
};

export default AdminWithdrawPage;
