import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import Pagination from "../../../../components/Pagination.jsx";
import SearchInput from "../../../../components/admin/searchInput.jsx";
import StatusFilter from "../../../../components/admin/statusFilter.jsx";
import LoadingModal from "../../../../components/loadingModal.jsx";
import { formatSmartDate } from "../../../../utils/format.jsx";
import { getAllPosts, getLatestPosts, getNearlyExpiringPosts } from "../../../service/postService.js";
import AdminDashboard from "../adminDashboard";

const API_BASE = import.meta.env.VITE_API_URL;

const PostManagement = () => {
  // URL state management
  const [searchParams, setSearchParams] = useSearchParams();

  // data + ui
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);

  // Side table data (not affected by filter/search/pagination)
  const [sidePosts, setSidePosts] = useState([]);
  const [loadingSide, setLoadingSide] = useState(false);
  const [nearlyExpiringPosts, setNearlyExpiringPosts] = useState([]);

  // URL-based state
  const page = parseInt(searchParams.get("page")) || 1;
  const pageSize = parseInt(searchParams.get("pageSize")) || 10;
  const searchTerm = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "all";
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  // local state for search input
  const [searchInput, setSearchInput] = useState(searchTerm);

  // fetch posts from backend (uses search + status + pagination)
  const fetchPosts = async () => {
    try {
      setLoadingFetch(true);
      // Only use backend pagination, do not filter/slice on frontend
      const res = await getAllPosts(page, pageSize, statusFilter, searchTerm);
      const data = res.data || {};
      setPosts(Array.isArray(data.data) ? data.data : []);
      setTotalPosts(data.total ?? 0);
      setTotalPages(data.totalPages ?? Math.max(1, Math.ceil((data.total ?? 0) / pageSize)));
    } catch (err) {
      console.error("fetchPosts error:", err);
      toast.error("Không thể tải danh sách bài đăng");
      setPosts([]);
      setTotalPosts(0);
      setTotalPages(1);
    } finally {
      setLoadingFetch(false);
    }
  };

  // fetch all posts for side tables (not affected by filter/search/pagination)
  const fetchSidePosts = async () => {
    try {
      setLoadingSide(true);
      const res = await getLatestPosts();
      const data = res.data || {};
      setSidePosts(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("fetchSidePosts error:", err);
      setSidePosts([]);
    } finally {
      setLoadingSide(false);
    }
  };

  const fetchNearlyExpiringPosts = async () => {
    try {
      setLoadingSide(true);
      const res = await getNearlyExpiringPosts();
      const data = res.data || {};
      setNearlyExpiringPosts(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("fetchNearlyExpiringPosts error:", err);
      setNearlyExpiringPosts([]);
    } finally {
      setLoadingSide(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, statusFilter, searchTerm]);

  // fetch side posts only once on mount
  useEffect(() => {
    fetchSidePosts();
    fetchNearlyExpiringPosts();
  }, []);

  // sync searchInput with searchTerm from URL
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  // search trigger (button or Enter)
  const handleSearchTrigger = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("search", searchInput);
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("search");
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  };

  // filter handler
  const handleStatusChange = (status) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("status", status);
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  };

  // approve/reject handlers
  const handleApprove = async (postId) => {
    if (!window.confirm("Xác nhận duyệt bài đăng này?")) return;

    try {
      setLoading(true);
      await axios.put(`${API_BASE}/api/posts/verify-post/${postId}`);
      toast.success("Đã duyệt bài đăng thành công");
      fetchPosts();
      fetchSidePosts();
    } catch (err) {
      console.error("handleApprove error:", err);
      toast.error("Duyệt bài đăng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (postId) => {
    let reason = prompt("Nhập lý do từ chối:");
    console.log(">> prompt reason (raw):", reason);

    // Trường hợp bấm Cancel hoặc nhập rỗng
    if (!reason || !reason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    // Đảm bảo là chuỗi thuần
    if (typeof reason !== "string") {
      try {
        reason = JSON.stringify(reason);
      } catch {
        reason = String(reason);
      }
    }
    reason = reason.trim();

    if (!window.confirm("Xác nhận từ chối bài đăng này?")) return;

    try {
      setLoading(true);
      console.log(">> Gửi reject với payload:", { reasonreject: reason });
      await rejectPostByAdmin(postId, reason); // ✅ Gửi string thuần
      toast.success("Đã từ chối bài đăng thành công");
      fetchPosts();
      fetchSidePosts();
    } catch (err) {
      console.error("handleReject error:", err);
      toast.error("Từ chối bài đăng thất bại");
    } finally {
      setLoading(false);
    }
  };

  // helper functions
  const tagLabel = (type) => {
    switch (type) {
      case "ban":
        return "[Bán]";
      case "dich_vu":
        return "[Dịch vụ]";
      case "cho_thue":
        return "[Thuê]";
      default:
        return `[${type}]`;
    }
  };

  return (
    <AdminDashboard>
      <div className="container py-3">
        {(loadingFetch || loading) && <LoadingModal />}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">📰 Quản lý bài đăng</h4>
        </div>

        <div className="row g-3 align-items-end mb-3">
          {/* Search Input */}
          <div className="col-md-4">
            <SearchInput
              placeholder="Tìm kiếm..."
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearchTrigger}
              onClear={handleClearSearch}
            />
          </div>

          {/* Status Filter */}
          <div className="col-md-3">
            <StatusFilter
              value={statusFilter}
              onChange={handleStatusChange}
              type="post"
            />
          </div>

          {/* Clear Filter Button */}
          <div className="col-md-2">
            {(searchInput || statusFilter !== "all") && (
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchInput("");
                  const newSearchParams = new URLSearchParams(searchParams);
                  newSearchParams.delete("search");
                  newSearchParams.set("status", "all");
                  newSearchParams.set("page", "1");
                  setSearchParams(newSearchParams);
                }}
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        <div className="row g-3">
          {/* Main Table */}
          <div className="col-lg-9 col-md-8">
            <div className="d-flex justify-content-between mb-2">
              <div className="text-muted small">
                Tổng: <strong>{totalPosts}</strong> bài
              </div>
            </div>

            <div className="list-group">
              {loadingFetch ? (
                <div className="text-center py-3">Đang tải...</div>
              ) : posts.length === 0 ? (
                <div className="alert alert-info">Không có bài đăng</div>
              ) : (
                posts.map((p) => (
                  <PostItemButton
                    key={p._id}
                    p={p}
                    formatSmartDate={formatSmartDate}
                    tagLabel={tagLabel}
                    isSmall
                    onApprove={handleApprove}
                    onReject={handleReject}
                    loading={loading}
                  />
                ))
              )}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set("page", p.toString());
                setSearchParams(newSearchParams);
              }}
              pageSize={pageSize}
              onPageSizeChange={(s) => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set("pageSize", s.toString());
                newSearchParams.set("page", "1");
                setSearchParams(newSearchParams);
              }}
            />
          </div>

          {/* Side Tables */}
          <div className={`col-lg-3 col-md-4 ${pageSize > 20 ? 'd-none d-lg-block' : ''}`}>
            <div className="d-flex flex-column gap-3">
              {/* Latest Posts */}
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white py-2">
                  <small>🆕 Bài đăng mới nhất</small>
                </div>
                <div className="list-group list-group-flush">
                  {loadingSide ? (
                    <div className="list-group-item small">Đang tải...</div>
                  ) : sidePosts.length === 0 ? (
                    <div className="list-group-item small">Không có bài</div>
                  ) : (
                    sidePosts.map((p) => (
                      <PostItemButton
                        key={p._id}
                        p={p}
                        formatSmartDate={formatSmartDate}
                        tagLabel={tagLabel}
                        isSmall
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Expiring Posts */}
              <div className="card shadow-sm">
                <div className="card-header bg-warning text-dark py-2">
                  <small>⚠️ Sắp hết hạn</small>
                </div>
                <div className="list-group list-group-flush">
                  {loadingSide ? (
                    <div className="list-group-item small">Đang tải...</div>
                  ) : nearlyExpiringPosts.length === 0 ? (
                    <div className="list-group-item small">Không có bài</div>
                  ) : (
                    nearlyExpiringPosts.map((p) => (
                      <PostItemButton
                        key={p._id}
                        p={p}
                        formatSmartDate={formatSmartDate}
                        tagLabel={tagLabel}
                        isSmall
                        isExpired
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboard>
  );
};

const PostItemButton = ({ p, formatSmartDate, tagLabel, isSmall, onApprove, onReject, loading, isExpired }) => {
  const [isHovered, setIsHovered] = useState(false);

  // helper function to get user name
  const getUserName = (contactInfo) => {
    if (!contactInfo) return "Không rõ";
    if (typeof contactInfo === "string") return "Không rõ";
    if (contactInfo.name) return contactInfo.name;
    return "Không rõ";
  };

  return (
    <div
      className={`list-group-item list-group-item-action ${isSmall ? "small" : ""} mb-2 shadow-sm`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered ? "#f8f9fa" : "",
        transform: isHovered ? "scale(1.02)" : "",
        transition: "all 0.2s ease",
        cursor: "pointer",
        textDecoration: "none",
        color: "inherit",
        fontSize: isSmall ? "0.875rem" : "1rem",
      }}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="fw-bold text-truncate">
            {tagLabel(p.type)} {p.title}
          </div>
          <div className="small text-muted">
            <div className="text-truncate">👤 {getUserName(p.contactInfo)}</div>
            <div className="text-truncate">⏱ {formatSmartDate(p.createdAt)}</div>
            <div className="text-truncate">📍 {p.location}</div>
          </div>
        </div>
      </div>

      {/* Link overlay for navigation */}
      <Link
        to={`/admin-dashboard/posts/${p._id}`}
        className="stretched-link"
        style={{ textDecoration: "none" }}
      />
    </div>
  );
};

export default PostManagement;
