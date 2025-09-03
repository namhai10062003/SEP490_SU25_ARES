import React, { useEffect, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../../../../components/footer";
import Header from "../../../../components/header";
import LoadingModal from "../../../../components/loadingModal";
import { useAuth } from "../../../../context/authContext";
import { formatPrice } from "../../../../utils/format";
import { getPostApproved } from "../../../service/postService";
const BlogList = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState({
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    location: "",
    type: "all",
  });
  const postsPerPage = 9;
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredImageIdx, setHoveredImageIdx] = useState(0);
  const hoverTimer = useRef(null);
  const navigate = useNavigate();
  const handleClick = (e) => {
    if (!user) {
      e.preventDefault();
      toast.warn("⚠️ Vui lòng đăng nhập để sử dụng chức năng này!");
      setTimeout(() => {
        navigate("/login");
      }); // delay 1.5s để toast hiện ra
    }
  };

  useEffect(() => {
    if (user && user.name) setName(user.name);
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    applyFilter();
    setCurrentPage(1);
  }, [posts, filter]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPostApproved();
      if (response.data.success) {
        const filteredData = response.data.data.filter(
          (post) => post.paymentDate
        );
        setPosts(filteredData);
      } else {
        setError("Không thể tải dữ liệu bài đăng");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = posts;

    // Price filtering based on selected range
    if (filter.minPrice && filter.maxPrice) {
      filtered = filtered.filter(
        (p) =>
          p.price >= Number(filter.minPrice) &&
          p.price <= Number(filter.maxPrice)
      );
    }

    // Area filtering based on selected range
    if (filter.minArea && filter.maxArea) {
      filtered = filtered.filter(
        (p) =>
          p.area >= Number(filter.minArea) && p.area <= Number(filter.maxArea)
      );
    }

    if (filter.location)
      filtered = filtered.filter((p) =>
        p.location?.toLowerCase().includes(filter.location.toLowerCase())
      );
    if (filter.type !== "all")
      filtered = filtered.filter((p) => p.type === filter.type);
    setFilteredPosts(filtered);
  };

  // Pagination logic
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / postsPerPage)
  );
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Pagination UI logic (max 5 page numbers, ... for jump)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  // Image hover effect logic (2s per image, smooth, no lag)
  const handleMouseEnter = (idx, images) => {
    setHoveredIndex(idx);
    setHoveredImageIdx(0);
    if (images && images.length > 1 && !hoverTimer.current) {
      hoverTimer.current = setInterval(() => {
        setHoveredImageIdx((prev) => (prev + 1) % images.length);
      }, 700);
    }
  };
  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setHoveredImageIdx(0);
    if (hoverTimer.current) {
      clearInterval(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  // if (authLoading || isLoading) {
  //   return (
  //     <div className="d-flex justify-content-center align-items-center vh-100">
  //       <div className="spinner-border text-primary" role="status"></div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <p className="text-danger">{error}</p>
        <button className="btn btn-primary" onClick={fetchPosts}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <Header user={user} name={name} logout={logout} />
      <div className="container py-4 position-relative">
        {/* Filter icon */}
        <button
          className="btn btn-light shadow rounded-circle position-absolute"
          style={{
            top: 10,
            left: 10,
            zIndex: 20,
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #ddd",
          }}
          onClick={() => setShowFilter((v) => !v)}
          aria-label="Bộ lọc"
        >
          <FaFilter size={22} color={showFilter ? "#1976d2" : "#888"} />
        </button>

        <div className="mx-auto" style={{ maxWidth: 1300 }}>
          <div className="text-center mb-4">
            <h1>📋 Danh sách bài đăng</h1>
            <p className="text-muted">
              Tổng cộng {filteredPosts.length} bài đăng
            </p>
          </div>
          <div className="row g-4">
            {/* Filter Sidebar */}
            {showFilter && (
              <div className="col-12 col-lg-3">
                <div className="card shadow-sm border-0 p-3 mb-3 mb-lg-0">
                  <div className="row g-2 align-items-center">
                    <div className="col-12">
                      <select
                        className="form-select mb-2"
                        value={`${filter.minPrice}-${filter.maxPrice}`}
                        onChange={(e) => {
                          const [min, max] = e.target.value.split("-");
                          setFilter((f) => ({
                            ...f,
                            minPrice: min,
                            maxPrice: max,
                          }));
                        }}
                      >
                        <option value="-">Tất cả giá</option>
                        <option value="0-500000000">Dưới 500 triệu</option>
                        <option value="500000000-1000000000">
                          500 triệu - 1 tỷ
                        </option>
                        <option value="1000000000-1500000000">
                          1 tỷ - 1 tỷ 5
                        </option>
                        <option value="1500000000-2000000000">
                          1 tỷ 5 - 2 tỷ
                        </option>
                        <option value="2000000000-999999999999">
                          2 tỷ trở lên
                        </option>
                      </select>
                    </div>

                    <div className="col-12">
                      <select
                        className="form-select mb-2"
                        value={`${filter.minArea}-${filter.maxArea}`}
                        onChange={(e) => {
                          const [min, max] = e.target.value.split("-");
                          setFilter((f) => ({
                            ...f,
                            minArea: min,
                            maxArea: max,
                          }));
                        }}
                      >
                        <option value="-">Tất cả diện tích</option>
                        <option value="0-50">Dưới 50m²</option>
                        <option value="50-100">50-100m²</option>
                        <option value="100-150">100-150m²</option>
                        <option value="150-999999">Trên 150m²</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <select
                        className="form-select mb-2"
                        value={filter.type}
                        onChange={(e) =>
                          setFilter((f) => ({ ...f, type: e.target.value }))
                        }
                      >
                        <option value="all">Tất cả dạng bài đăng</option>
                        <option value="ban">Bán</option>
                        <option value="cho_thue">Cho thuê</option>
                        <option value="dich_vu">Dịch vụ</option>
                      </select>
                    </div>
                    <div className="col-12 d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() =>
                          setFilter({
                            minPrice: "",
                            maxPrice: "",
                            minArea: "",
                            maxArea: "",
                            location: "",
                            type: "all",
                          })
                        }
                      >
                        Xoá bộ lọc
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Grid */}
            <div className={showFilter ? "col-12 col-lg-9" : "col-12"}>
              <div className="row g-4">
                {currentPosts.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">Không có bài đăng</p>
                  </div>
                ) : (
                  currentPosts.map((post, idx) => (
                    <div
                      key={post._id}
                      className="col-12 col-md-6 col-lg-4 d-flex"
                    >
                      <Link
                        to={`/postdetail/${post._id}`}
                        className="card h-100 shadow-sm border-0 text-decoration-none text-dark w-100"
                        style={{
                          minHeight: "260px",
                          outline: "none",
                          cursor: "pointer",
                          transition:
                            "transform 0.22s cubic-bezier(.4,2,.3,1), box-shadow 0.22s cubic-bezier(.4,2,.3,1)",
                          transform:
                            hoveredIndex === idx ? "scale(1.03)" : "none",
                          boxShadow:
                            hoveredIndex === idx
                              ? "0 8px 32px rgba(25,118,210,0.13)"
                              : undefined,
                          border:
                            hoveredIndex === idx
                              ? "1.5px solid #1976d2"
                              : "1px solid #eee",
                          zIndex: hoveredIndex === idx ? 2 : 1,
                          display: "block",
                        }}
                        onMouseEnter={() => handleMouseEnter(idx, post.images)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {/* Badge VIP Ribbon */}
                        {post.postPackage?.type && (
                          <div
                            className="position-absolute top-0 end-0 m-2 px-3 py-1 fw-bold text-white rounded-pill"
                            style={{
                              fontSize: "0.8rem",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                              background:
                                post.postPackage.type.toLowerCase() === "vip1"
                                  ? "linear-gradient(135deg, #42A5F5, #1E88E5)" // xanh nhạt -> xanh đậm
                                  : post.postPackage.type.toLowerCase() ===
                                    "vip2"
                                  ? "linear-gradient(135deg, #FF5252, #D32F2F)" // đỏ sáng -> đỏ đậm
                                  : post.postPackage.type.toLowerCase() ===
                                    "vip3"
                                  ? "linear-gradient(135deg, #FFD700, #FFA500)" // vàng -> cam
                                  : "linear-gradient(135deg, #9e9e9e, #616161)", // mặc định xám
                              letterSpacing: "1px",
                              textTransform: "uppercase",
                              minWidth: "65px",
                              textAlign: "center",
                              zIndex: 30,
                            }}
                          >
                            {post.postPackage.type}
                          </div>
                        )}

                        <div
                          style={{
                            width: "100%",
                            height: "180px",
                            overflow: "hidden",
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            position: "relative",
                          }}
                        >
                          {post.images?.length ? (
                            <img
                              src={
                                hoveredIndex === idx && post.images.length > 1
                                  ? post.images[
                                      hoveredImageIdx % post.images.length
                                    ]
                                  : post.images[0]
                              }
                              alt={post.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                opacity: 1,
                                transition:
                                  "opacity 0.5s cubic-bezier(.4,2,.3,1)",
                              }}
                            />
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center bg-light"
                              style={{ width: "100%", height: "100%" }}
                            >
                              <span className="fs-1 text-muted">🏠</span>
                            </div>
                          )}
                        </div>
                        <div
                          className="card-body d-flex flex-column justify-content-between"
                          style={{ minHeight: 120 }}
                        >
                          <div
                            className="d-flex align-items-center mb-2"
                            style={{ minHeight: 56 }}
                          >
                            <span
                              className="fw-semibold"
                              style={{
                                fontSize: 20,
                                lineHeight: "1.2",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap", // <-- THIS is the key for 1 line
                                flex: 1,
                                marginRight: 8,
                              }}
                              title={post.title}
                            >
                              {/* {post.type === "ban" && (
                                <span
                                  style={{ color: "#1976d2", fontWeight: 600 }}
                                >
                                  Bán:{" "}
                                </span>
                              )}
                              {post.type === "cho_thue" && (
                                <span
                                  style={{ color: "#fbc02d", fontWeight: 600 }}
                                >
                                  Cho thuê:{" "}
                                </span>
                              )}
                              {post.type === "dich_vu" && (
                                <span
                                  style={{ color: "#43a047", fontWeight: 600 }}
                                >
                                  Dịch vụ:{" "}
                                </span>
                              )} */}
                              {post.title}
                            </span>
                          </div>
                          {/* Practical info grid */}
                          <div className="row g-1 small mb-2">
                            <div className="col-12">
                              <span
                                className="fw-bold"
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  display: "inline-block",
                                  maxWidth: "80px", // adjust as needed for label width
                                  verticalAlign: "middle",
                                }}
                              >
                                Địa chỉ:
                              </span>
                              {/* uncomment để check xem nó vip gì  */}
                              {/* {post.postPackage.type} */}
                              <span
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  display: "inline-block",
                                  maxWidth: "calc(100% - 90px)", // adjust to fit your layout
                                  verticalAlign: "middle",
                                }}
                                title={post.location}
                              >
                                {" "}
                                {post.location}
                              </span>
                            </div>
                            <div className="col-6">
                              <span className="fw-semibold text-muted">
                                Mã căn hộ:
                              </span>{" "}
                              {!post.apartmentCode || post.apartmentCode === "undefined" ? "—" : post.apartmentCode}
                            </div>
                            <div className="col-6">
                              <span className="fw-semibold text-muted">
                                Loại:
                              </span>{" "}
                              {post.property === "nha_can_ho"
                                ? "Căn hộ"
                                : post.property === "nha_dat"
                                ? "Nhà/Đất"
                                : post.property}
                            </div>
                            <div className="col-6">
                              <span className="fw-semibold text-muted">
                                Diện tích:
                              </span>{" "}
                              {post.area} m²
                            </div>
                            <div className="col-6">
                              <span className="fw-semibold text-muted">
                                Nội thất:
                              </span>{" "}
                              {post.interiorStatus || "—"}
                            </div>
                            <div className="col-6">
                              <span className="fw-semibold text-muted">
                                Ngày đăng:
                              </span>{" "}
                              {new Date(post.paymentDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          </div>
                          <div className="d-flex align-items-end justify-content-between mt-2">
                            <span className="fw-bold text-danger">
                              Giá: {formatPrice(post.price)}
                            </span>
                          </div>
                          {/* Contact and type */}
                          <div className="d-flex justify-content-between align-items-end mt-auto pt-2">
                            <div>
                              <span className="fw-semibold text-muted">
                                Người đăng:
                              </span>{" "}
                              {post.contactInfo?.name}
                              <br />
                            </div>
                            <span
                              className={`badge ${
                                post.type === "ban"
                                  ? "bg-danger"
                                  : post.type === "cho_thue"
                                  ? "bg-success"
                                  : post.type === "dich_vu"
                                  ? "bg-info"
                                  : "bg-secondary"
                              }`}
                            >
                              {post.type === "ban" && "Bán"}
                              {post.type === "cho_thue" && "Cho thuê"}
                              {post.type === "dich_vu" && "Dịch vụ"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul className="pagination mb-0">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        &laquo; Prev
                      </button>
                    </li>
                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <li key={idx} className="page-item">
                          <button
                            className="page-link"
                            style={{ minWidth: 40, padding: "0 8px" }}
                            onClick={() => {
                              const input = prompt(
                                "Nhập số trang muốn chuyển đến:",
                                currentPage
                              );
                              const num = Number(input);
                              if (num && num >= 1 && num <= totalPages)
                                handlePageChange(num);
                            }}
                          >
                            ...
                          </button>
                        </li>
                      ) : (
                        <li
                          key={page}
                          className={`page-item ${
                            page === currentPage ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      )
                    )}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
        {/* ✅ Loading toàn màn hình */}
        {isLoading && <LoadingModal />}
      </div>
      <Footer />
    </div>
  );
};

export default BlogList;
