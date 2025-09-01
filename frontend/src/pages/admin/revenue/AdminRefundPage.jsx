import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "../../../../components/Pagination.jsx";
import ReusableModal from "../../../../components/ReusableModal.jsx";
import SearchInput from "../../../../components/admin/searchInput.jsx";
import StatusFilter from "../../../../components/admin/statusFilter.jsx";
import LoadingModal from "../../../../components/loadingModal.jsx";
import { formatPrice } from "../../../../utils/format.jsx";
import {
    approveRefund,
    fetchAllRefunds,
    rejectRefund,
} from "../../../service/refundService"; // đổi sang refund service
import AdminDashboard from "../adminDashboard";

const AdminRefundPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialPageSize = Number(searchParams.get("pageSize")) || 10;

  const [refunds, setRefunds] = useState([]);
  const [filter, setFilter] = useState("all");
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

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const res = await fetchAllRefunds();
  
      // Chuẩn hoá dữ liệu trả về: có thể là mảng hoặc { data: [...] }
      const raw = res?.data;
      const allData = Array.isArray(raw) ? raw : raw?.data || [];
  
      let filtered = allData;
  
      // 🔎 Lọc theo trạng thái (chỉ lọc khi KHÁC 'all')
      if (filter && filter !== "all") {
        filtered = filtered.filter((r) => r.status === filter);
      }
  
      // 🔎 Search theo tên/email + thông tin ngân hàng + số tiền
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        filtered = filtered.filter((r) =>
          (r.user?.name?.toLowerCase().includes(q) ||
            r.user?.email?.toLowerCase().includes(q) ||
            r.accountHolder?.toLowerCase().includes(q) ||
            r.accountNumber?.toLowerCase().includes(q) ||
            r.bankName?.toLowerCase().includes(q) ||
            String(r.amount).includes(searchTerm.trim()))
        );
      }
  
      // ⏱️ Sắp xếp theo approvedAt (nếu có) hoặc createdAt
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(a?.approvedAt || a?.createdAt || 0);
        const dateB = new Date(b?.approvedAt || b?.createdAt || 0);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  
      setRefunds(filtered);
    } catch (err) {
      toast.error("Không thể nạp danh sách yêu cầu hoàn tiền!");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    loadRefunds();
  }, [filter, searchTerm, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(refunds.length / pageSize) || 1;
  const pagedRefunds = refunds.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1); // reset page khi filter/search thay đổi
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
      await approveRefund(id);
      toast.success("✅ Đã duyệt Chuyển Tiền!");
      loadRefunds();
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
      await rejectRefund(selectedId, rejectReason);
      toast.success("❌ Đã từ chối yêu cầu chuyển tiền!");
      closeRejectModal();
      loadRefunds();
    } catch (err) {
      toast.error("❌ Từ chối thất bại: " + err.response?.data?.message);
    }
  };

  return (
    <AdminDashboard active="refunds">
      {loading && <LoadingModal />}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Yêu cầu chuyển tiền</h2>
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
  type="refund"
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
            <th>Số tiền hoàn</th>
            <th>Chủ tài khoản</th>
            <th>Số tài khoản</th>
            <th>Ngân hàng</th>
            <th>Trạng thái</th>
            <th>Ghi chú</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="10" className="text-center text-muted py-4">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : pagedRefunds.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center text-muted py-4">
                Không có yêu cầu phù hợp
              </td>
            </tr>
          ) : (
            pagedRefunds.map((r, idx) => (
              <tr key={r._id}>
                <td>{(page - 1) * pageSize + idx + 1}</td>

                {/* Người yêu cầu */}
                <td>
                  {r.user?.name || "Ẩn danh"}
                  <br />
                  <small>{r.user?.email}</small>
                </td>

                <td>{formatPrice(r.amount)}</td>

                {/* Thêm các trường mới */}
                <td>{r.accountHolder || "--"}</td>
                <td>{r.accountNumber || "--"}</td>
                <td>{r.bankName || "--"}</td>

                {/* Trạng thái */}
                <td>
                  <span
                    className={`badge ${
                      r.status === "approved"
                        ? "bg-success"
                        : r.status === "rejected"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {r.status === "pending"
                      ? "Chờ duyệt"
                      : r.status === "approved"
                      ? "Đã chuyển tiền"
                      : r.status === "rejected"
                      ? "Từ chối"
                      : r.status}
                  </span>
                </td>

                {/* Ghi chú */}
                <td>
                  {r.status === "rejected" ? (
                    <span className="text-danger">
                      {r.rejectReason || "--"}
                    </span>
                  ) : r.status === "approved" ? (
                    <span className="text-success">
                      Hoàn lúc {new Date(r.updatedAt).toLocaleString()}
                    </span>
                  ) : (
                    r.note || "--"
                  )}
                </td>

                {/* Thao tác */}
                <td>
                  {r.status === "pending" ? (
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleApprove(r._id)}
                      >
                        ✅ Duyệt
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => openRejectModal(r._id)}
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
            { label: "Hủy", variant: "secondary", onClick: closeRejectModal },
            { label: "Gửi từ chối", variant: "danger", onClick: handleRejectConfirm },
          ]}
        />
      )}
    </AdminDashboard>
  );
};

export default AdminRefundPage;
