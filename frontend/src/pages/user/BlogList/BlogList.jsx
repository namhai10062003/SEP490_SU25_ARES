import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import { getAllPostsActive } from "../../../service/postService";

const BlogList = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 10;

  useEffect(() => {
    if (user && user.name) {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedFilter]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPostsActive();
      if (response.data.success) {
        const sortedPosts = response.data.data.sort((a, b) => {
          const priceA = a.postPackage?.price || 0;
          const priceB = b.postPackage?.price || 0;
          return priceB - priceA;
        });
        setPosts(sortedPosts);
      } else {
        setError("Không thể tải dữ liệu bài đăng");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = () => {
    const filtered = selectedFilter === "all"
      ? posts
      : posts.filter((p) => p.postPackage?.type === selectedFilter);
    setFilteredPosts(filtered);
    setCurrentPage(1);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const getPackageBadgeClass = (type) => {
    switch (type) {
      case "VIP1": return "badge bg-primary";
      case "VIP2": return "badge bg-danger";
      case "VIP3": return "badge bg-warning text-dark";
      default: return "badge bg-secondary";
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <p className="text-danger">{error}</p>
        <button className="btn btn-primary" onClick={fetchPosts}>Thử lại</button>
      </div>
    );
  }

  return (
    <div>
      <Header user={user} name={name} logout={logout} />
      <div className="container py-4">
        <div className="text-center mb-4">
          <h1>📋 Danh sách bài đăng</h1>
          <p className="text-muted">Tổng cộng {filteredPosts.length} bài đăng</p>
        </div>

        <div className="row g-4">
          <div className="col-lg-3">
            <div className="card shadow-sm">
              <div className="card-header fw-bold">Lọc theo gói</div>
              <ul className="list-group list-group-flush">
                {["all", "VIP1", "VIP2", "VIP3"].map((v) => (
                  <li
                    key={v}
                    className={`list-group-item d-flex justify-content-between align-items-center ${selectedFilter === v ? 'active text-white bg-primary' : ''}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedFilter(v)}
                  >
                    {v === "all" ? "Tất cả" : v}
                    <span className="badge bg-light text-dark">
                      {v === "all"
                        ? posts.length
                        : posts.filter((p) => p.postPackage?.type === v).length}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="row g-4">
              {currentPosts.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Không có bài đăng</p>
                </div>
              ) : (
                currentPosts.map((post) => (
                  <div key={post._id} className="col-12">
                    <Link to={`/postdetail/${post._id}`} className="text-decoration-none text-dark">
                      <div className="card h-100 shadow-sm d-flex flex-row" style={{ minHeight: '200px' }}>
                        <div style={{ width: "35%", height: "200px", overflow: "hidden" }}>
                          {post.images?.[0] ? (
                            <img
                              src={post.images[0]}
                              alt={post.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center bg-light" style={{ width: "100%", height: "100%" }}>
                              <span className="fs-1 text-muted">🏠</span>
                            </div>
                          )}
                        </div>
                        <div className="card-body d-flex flex-column justify-content-between" style={{ width: "65%" }}>
                          <div>
                            <h5 className="card-title d-flex justify-content-between align-items-center">
                              {post.title}
                              <span className={getPackageBadgeClass(post.postPackage?.type)}>
                                {post.postPackage?.type || "Standard"}
                              </span>
                            </h5>
                            <p className="card-text small text-muted mb-2">
                              {truncateText(post.description, 120)}
                            </p>
                            <ul className="list-unstyled small mb-2">
                              <li><i className="bi bi-geo-alt"></i> {post.location}</li>
                              <li><i className="bi bi-aspect-ratio"></i> {post.area} m²</li>
                              <li className="fw-bold fs-5">
                                <i className="bi bi-cash"></i> {formatPrice(post.price)}
                              </li>
                            </ul>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="small">👤 {post.contactInfo?.name}</span>
                            <span className={`badge ${post.status === "active" ? "bg-success" : "bg-danger"}`}>
                              {post.status === "active" ? "Đang hoạt động" : "Không hoạt động"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                        <button className="page-link" onClick={() => handlePageChange(page)}>
                          {page}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogList;