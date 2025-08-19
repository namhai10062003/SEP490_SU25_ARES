import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../../components/header.jsx";
import { useAuth } from "../../../../context/authContext.jsx";

const PAGE_SIZE = 5;
const API_BASE = import.meta.env.VITE_API_URL;

const LikedPosts = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const navigate = useNavigate();

  const fetchLikedPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/interaction/my-liked-posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const now = new Date();
      const filteredPosts = (res.data.data || []).filter(post => {
        const notExpired = !post.expiredDate || new Date(post.expiredDate) > now;
        const notDeleted = post.status !== "deleted";
        return notExpired && notDeleted;
      });
      setPosts(filteredPosts);
    } catch (err) {
      console.error("Lỗi khi load bài đã like", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchLikedPosts();
    }
  }, [authLoading, user]);

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("vi-VN");

  const postStatusLabels = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
  };

  const filteredPosts = posts.filter((post) => {
    const keyword = searchText.toLowerCase();
    const matchesSearch =
      post.title?.toLowerCase().includes(keyword) ||
      post.location?.toLowerCase().includes(keyword) ||
      post.area?.toString().includes(keyword) ||
      post.price?.toString().includes(keyword);

    const matchesDate = filterDate
      ? new Date(post.createdAt).toLocaleDateString("vi-VN") === new Date(filterDate).toLocaleDateString("vi-VN")
      : true;

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);


  return (
    <div className="bg-light min-vh-100">
      <Header user={user} logout={logout} name={user?.name || user?.username || ""} />

      <div className="container py-4">
        <h3 className="mb-3 text-primary">📌 Bài đăng bạn đã thích</h3>

        <div className="row mb-4 g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1); // reset về trang đầu
              }}
            />
          </div>
          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setCurrentPage(1); // reset về trang đầu
              }}
            />
          </div>
          <div className="col-md-2 d-flex align-items-center">
            {(searchText || filterDate) && (
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchText("");
                  setFilterDate("");
                }}
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        <div className="row g-4">
          {paginatedPosts.map((post, index) => (
            <div key={post._id} className="col-12">
              <div className="card shadow-sm border-0 rounded-4 p-3">
                <div className="row g-3 align-items-center flex-column flex-md-row">
                  <div className="col-auto">
                    <span className="badge bg-secondary fs-6 px-3 py-2">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </span>
                  </div>

                  <div className="col-auto">
                    {post.images?.[0] ? (
                      <img
                        src={post.images[0]}
                        alt="Post"
                        className="rounded-3 shadow-sm"
                        style={{ width: 80, height: 60, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="bg-light border rounded d-flex align-items-center justify-content-center"
                        style={{ width: 80, height: 60, fontSize: 12, color: "#666" }}
                      >
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="col" onClick={() => navigate(`/postdetail/${post._id}`)} style={{ cursor: "pointer" }}>
                    <div className="fw-bold mb-1 d-flex align-items-center gap-2">
                      <span className="material-symbols-rounded text-primary" style={{ fontSize: 20 }}>
                        {post.type === "ban"
                          ? "sell"
                          : post.type === "dich_vu"
                            ? "handyman"
                            : post.type === "cho_thue"
                              ? "home_work"
                              : "article"}
                      </span>
                      {(post.type === "ban"
                        ? "Bán"
                        : post.type === "dich_vu"
                          ? "Dịch vụ"
                          : post.type === "cho_thue"
                            ? "Cho thuê"
                            : post.type) + " - " + post.title}
                    </div>
                    <div className="text-muted small mb-1">
                      <span className="material-symbols-rounded align-middle" style={{ fontSize: 16, verticalAlign: "middle" }}>location_on</span>
                      {post.location} • {post.area}m² • {formatPrice(post.price)}{" "}
                      {post.type === "ban" ? "VND" : "VND/tháng"}
                    </div>
                    <div className="text-secondary small mb-1">
                      <span className="material-symbols-rounded align-middle" style={{ fontSize: 16 }}>calendar_month</span>
                      Ngày đăng: {formatDate(post.createdAt)} •
                      <span className={`badge ms-2 px-2 py-1 rounded-pill fw-normal ${post.status === "pending" ? "bg-warning text-dark" : post.status === "approved" ? "bg-success" : "bg-danger"}`}>
                        {postStatusLabels[post.status] || post.status}
                      </span>
                    </div>
                  </div>

                  <div className="col-auto">
                    <span className="badge bg-danger-subtle text-danger">❤️ Đã thích</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-4">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                  <span className="material-symbols-rounded">chevron_left</span>
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                  <span className="material-symbols-rounded">chevron_right</span>
                </button>
              </li>
            </ul>
          </nav>
        )}

        {posts.length === 0 && !loading && (
          <div className="text-center p-5 bg-white rounded-4 mt-4">
            <p>Bạn chưa thích bài đăng nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedPosts;
