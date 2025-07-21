import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/authContext";
import { getAllPosts } from "../../../service/postService";
import AdminDashboard from "../adminDashboard";

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 7;

  const { user } = useAuth();

  const formatSmartTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();

    const sameDay = d.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const isThisWeek = d >= weekStart;

    const hhmm = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (sameDay) return `Hôm nay lúc ${hhmm}`;
    if (isYesterday) return `Hôm qua lúc ${hhmm}`;
    if (isThisWeek) {
      const weekday = d.toLocaleDateString("vi-VN", { weekday: "long" });
      return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} lúc ${hhmm}`;
    }

    return `${d.toLocaleDateString("vi-VN")} lúc ${hhmm}`;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await getAllPosts();
        setPosts(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const expiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = (d - now) / (1000 * 60 * 60 * 24);
    return diffDays <= 7 && diffDays >= 0;
  };

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

  const filteredPosts =
    categoryFilter === "all"
      ? posts
      : posts.filter((p) => p.status === categoryFilter);

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const totalPages = Math.ceil(filteredPosts.length / perPage);

  const latestPosts = posts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const expiringPosts = posts.filter((p) => expiringSoon(p.expiredDate));

  return (
    <AdminDashboard>
      <div className="container py-3">
        <div className="bg-primary text-white rounded p-2 text-center mb-3">
          <h4>Quản Lý Bài Đăng</h4>
        </div>

        <div className="row g-3">
          {/* Table1 */}
          <div className="col-md-8">
            <div className="d-flex justify-content-between mb-2">
              <select
                className="form-select w-auto"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Đã từ chối</option>
              </select>
              <div className="text-muted small">
                Tổng: <strong>{filteredPosts.length}</strong> bài
              </div>
            </div>

            <div className="list-group">
              {loading ? (
                <div className="text-center py-3">Đang tải...</div>
              ) : paginatedPosts.length === 0 ? (
                <div className="alert alert-info">Không có bài đăng</div>
              ) : (
                paginatedPosts.map((p) => (
                  <PostItemButton
                    key={p._id}
                    p={p}
                    navigate={navigate}
                    formatSmartTime={formatSmartTime}
                    tagLabel={tagLabel}
                  />
                ))
              )}
            </div>

            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Table2 + Table3 */}
          <div className="col-md-4 d-flex flex-column gap-3">
            <div className="card flex-grow-1 shadow-sm">
              <div className="card-header bg-success text-white py-1">
                🆕 Bài đăng mới nhất
              </div>
              <div className="list-group list-group-flush">
                {latestPosts.map((p) => (
                  <PostItemButton
                    key={p._id}
                    p={p}
                    navigate={navigate}
                    formatSmartTime={formatSmartTime}
                    tagLabel={tagLabel}
                    isSmall
                  />
                ))}
              </div>
            </div>

            <div className="card flex-grow-1 shadow-sm">
              <div className="card-header bg-warning text-dark py-1">
                ⚠️ Sắp hết hạn
              </div>
              <div className="list-group list-group-flush">
                {expiringPosts.length === 0 ? (
                  <div className="list-group-item small">Không có bài</div>
                ) : (
                  expiringPosts.map((p) => (
                    <PostItemButton
                      key={p._id}
                      p={p}
                      navigate={navigate}
                      formatSmartTime={formatSmartTime}
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
    </AdminDashboard>
  );
};

const PostItemButton = ({ p, navigate, formatSmartTime, tagLabel, isSmall }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => navigate(`/admin-dashboard/posts/${p._id}`)}
      className={`list-group-item list-group-item-action ${isSmall ? "small" : ""} mb-2 shadow-sm`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered ? "#f8f9fa" : "",
        transform: isHovered ? "scale(1.02)" : "",
        transition: "all 0.2s ease",
      }}
    >
      <div className="fw-bold">
        {tagLabel(p.type)} {p.title}
      </div>
      <div className="small text-muted">
        👤 {p.contactInfo?.name} • ⏱ {formatSmartTime(p.createdAt)} • 📍 {p.location}
      </div>
    </button>
  );
};

export default PostManagement;
