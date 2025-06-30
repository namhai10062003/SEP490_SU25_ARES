// BlogList.jsx – đã thêm <Link> để click sang trang chi tiết, giữ nguyên style & logic
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import { getAllPostsActive } from "../../../service/postService";

const BlogList = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(user?.name || null);
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedFilter]);

  const fetchPosts = async () => {
    setIsLoading(true);
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
    } catch (error) {
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = () => {
    if (selectedFilter === "all") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter((p) => p.postPackage?.type === selectedFilter));
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });
  const getTypeLabel = (t) => ({ ban: "Bán", cho_thue: "Cho thuê", dich_vu: "Dịch vụ" })[t] || t;
  const getPackageColor = (t) => ({ VIP1: "#3498db", VIP2: "#e74c3c", VIP3: "#f39c12" })[t] || "#95a5a6";

  if (isLoading) return <div style={styles.container}>Đang tải...</div>;
  if (error) return <div style={styles.container}>{error}</div>;

  return (
    <div style={styles.container}>
      <Header user={user} name={name} logout={logout} />
      <div style={styles.contentWrapper}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>📋 Danh sách bài đăng</h1>
          <p style={styles.headerSubtitle}>Tổng cộng {filteredPosts.length} bài đăng</p>
        </div>

        <div style={styles.pageLayout}>
          {/* SIDEBAR FILTER */}
          <div style={styles.sidebar}>
            <h3 style={styles.sidebarTitle}>Lọc theo gói</h3>
            <div style={styles.filterList}>
              {["all", "VIP1", "VIP2", "VIP3"].map((v) => (
                <div
                  key={v}
                  style={{
                    ...styles.filterItem,
                    ...(selectedFilter === v ? styles.activeFilter : {}),
                  }}
                  onClick={() => setSelectedFilter(v)}
                >
                  <span style={styles.filterLabel}>{v === "all" ? "Tất cả" : v}</span>
                  <span style={styles.filterCount}>{v === "all" ? posts.length : posts.filter((p) => p.postPackage?.type === v).length}</span>
                </div>
              ))}
            </div>
          </div>

          {/* POSTS GRID */}
          <div style={styles.postsContent}>
            {filteredPosts.length === 0 ? (
              <div style={styles.emptyState}>Không có bài đăng</div>
            ) : (
              <div style={styles.postsGrid}>
                {filteredPosts.map((post) => (
                  <Link
                    key={post._id}
                    to={`/postdetail/${post._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div style={styles.postCard}>
                      {/* IMAGE */}
                      <div style={styles.postImageContainer}>
                        {post.images?.[0] ? (
                          <img src={post.images[0]} alt={post.title} style={styles.postImage} />
                        ) : (
                          <div style={styles.noImage}><span style={styles.noImageIcon}>🏠</span></div>
                        )}
                        <div
                          style={{
                            ...styles.packageBadge,
                            backgroundColor: getPackageColor(post.postPackage?.type),
                          }}
                        >
                          {post.postPackage?.type || "Standard"}
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div style={styles.postContent}>
                        <div style={styles.postHeader}>
                          <h3 style={styles.postTitle}>{post.title}</h3>
                          <span style={styles.postType}>{getTypeLabel(post.type)}</span>
                        </div>
                        <div style={styles.postDescription}>{post.description}</div>
                        <div style={styles.postDetails}>
                          <div style={styles.postDetailItem}><span style={styles.detailIcon}>📍</span><span>{post.location}</span></div>
                          <div style={styles.postDetailItem}><span style={styles.detailIcon}>📐</span><span>{post.area} m²</span></div>
                          <div style={styles.postDetailItem}><span style={styles.detailIcon}>💰</span><span>{formatPrice(post.price)}</span></div>
                        </div>
                        <div style={styles.postFooter}>
                          <div style={styles.contactInfo}><span style={styles.contactIcon}>👤</span><span>{post.contactInfo?.name}</span></div>
                        </div>
                        <div style={styles.postStatus}>
                          <span style={{
                            ...styles.statusBadge,
                            ...(post.status === "active" ? styles.statusActive : styles.statusInactive),
                          }}>{post.status === "active" ? "Đang hoạt động" : "Không hoạt động"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100vw",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    backgroundColor: "#f4f6f8",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  contentWrapper: {
    width: "100%",
  },

  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "10px 20px",
    paddingTop: "10px",
    textAlign: "center",
    color: "white",
  },
  headerTitle: {
    fontSize: "3rem",
    fontWeight: "700",
    marginBottom: "10px",
  },
  headerSubtitle: {
    fontSize: "1.25rem",
    opacity: 0.9,
  },

  pageLayout: {
    display: "flex",
    width: "100%",
    gap: "20px",
    padding: "20px",
  },

  sidebar: {
    width: "280px",
    background: "#ffffff",
    padding: "30px 20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    height: "fit-content",
    position: "sticky",
    top: "20px",
  },

  sidebarTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#333",
    marginBottom: "20px",
  },

  filterList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  filterItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "1px solid transparent",
  },

  activeFilter: {
    backgroundColor: "#667eea",
    color: "white",
    fontWeight: "600",
  },

  filterLabel: {
    fontSize: "1rem",
  },

  filterCount: {
    fontSize: "0.9rem",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "4px 8px",
    borderRadius: "12px",
    minWidth: "24px",
    textAlign: "center",
  },

  postsContent: {
    flex: 1,
  },

  postsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "24px",
  },

  postCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
  },

  postImageContainer: {
    position: "relative",
    height: "200px",
    overflow: "hidden",
  },

  postImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  noImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  noImageIcon: {
    fontSize: "3rem",
    color: "#ccc",
  },

  packageBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    color: "white",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  postContent: {
    padding: "20px",
  },

  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },

  postTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#333",
    margin: 0,
    flex: 1,
    marginRight: "12px",
  },

  postType: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },

  postDescription: {
    color: "#666",
    fontSize: "0.95rem",
    lineHeight: "1.5",
    marginBottom: "16px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  postDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
  },

  postDetailItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  detailIcon: {
    fontSize: "1rem",
    width: "20px",
  },

  detailText: {
    fontSize: "0.9rem",
    color: "#555",
  },

  postFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "16px",
    borderTop: "1px solid #eee",
    marginBottom: "12px",
  },

  contactInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  contactIcon: {
    fontSize: "1rem",
  },

  contactName: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#333",
  },

  contactPhone: {
    fontSize: "0.85rem",
    color: "#666",
  },

  postDate: {
    fontSize: "0.85rem",
    color: "#888",
  },

  postStatus: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  statusBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },

  statusActive: {
    backgroundColor: "#e8f5e8",
    color: "#2e7d32",
  },

  statusInactive: {
    backgroundColor: "#ffebee",
    color: "#c62828",
  },

  paymentBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },

  paymentPaid: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
  },

  paymentUnpaid: {
    backgroundColor: "#fff3e0",
    color: "#f57c00",
  },

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  },

  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "16px",
  },

  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px",
  },

  emptySubtitle: {
    fontSize: "1rem",
    color: "#666",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "16px",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    fontSize: "1.1rem",
    color: "#666",
  },

  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "16px",
  },

  errorIcon: {
    fontSize: "3rem",
  },

  errorText: {
    fontSize: "1.1rem",
    color: "#e74c3c",
    textAlign: "center",
  },

  retryButton: {
    padding: "12px 24px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 1200px) {
    .posts-grid {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)) !important;
    }
  }
  
  @media (max-width: 768px) {
    .page-layout {
      flex-direction: column !important;
    }
    .sidebar {
      width: 100% !important;
      position: relative !important;
    }
    .posts-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default BlogList;
