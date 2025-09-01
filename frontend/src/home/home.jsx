import axios from "axios";
import DOMPurify from "dompurify";
import React, { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import CountUp from 'react-countup';
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import Footer from "../../components/footer";
import Header from "../../components/header";
import { useAuth } from "../../context/authContext";
const CountUpOnView = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef();
  const started = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && !started.current) {
        started.current = true;
        let start = 0;
        const increment = end / (duration / 16);
        const step = () => {
          start += increment;
          if (start < end) {
            setCount(Math.floor(start));
            requestAnimationFrame(step);
          } else {
            setCount(end);
          }
        };
        requestAnimationFrame(step);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [end, duration]);
  return <span ref={ref}>{count}</span>;
};

const Home = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const listRef = useRef(null);
  const [selectedPlaza, setSelectedPlaza] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const selectedPosts = posts.slice(startIndex, startIndex + postsPerPage);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const navigate = useNavigate();

  const [plazas, setPlazas] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postStats, setPostStats] = useState(null);

  useEffect(() => {
    const fetchPostStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/stats`);
        setPostStats(res.data); // Đúng là res.data nếu bạn trả về { forSale, forRent, saleAndRent }
      } catch (error) {
        console.error("Lỗi khi fetch postStats:", error);
      }
    };

    fetchPostStats();
  }, []);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/plaza`)
      .then(res => {
        const sorted = [...(res.data.data || [])].sort((a, b) => {
          // Lấy số từ chuỗi "Plaza 1", "Plaza 2" ...
          const numA = parseInt(a.name?.match(/\d+/)?.[0] || 0, 10);
          const numB = parseInt(b.name?.match(/\d+/)?.[0] || 0, 10);
          return numA - numB;
        });
        setPlazas(sorted);
      })
      .catch(err => console.error(err));
  }, []);


  useEffect(() => {
    // Giả sử bạn xác định người dùng chưa cập nhật nếu thiếu identityNumber hoặc phone
    if (user && (!user.identityNumber || !user.phone)) {
      setShowUpdateModal(true);
    }
  }, [user]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);

      // Scroll đến phần danh sách thay vì về đầu trang
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // hàm xử lí user khi kick vào chitiet
  const handleViewDetail = (postId) => {
    if (!user) {
      setShowModal(true);
      setSelectedPostId(postId);
    } else {
      navigate(`/postdetail/${postId}`);
    }
  };

  // Xử lý chuyển sang trang đăng nhập và truyền trạng thái redirect
  const handleLoginRedirect = () => {
    navigate("/login", { state: { redirectTo: "/blog" } });
  };
  // Xử lý khi nhấn nút "Xem thêm"
  const handleViewMore = () => {
    if (user) {
      navigate("/blog");
    } else {
      setShowModal(true); // Hiện popup đăng nhập
    }
  };



  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Lấy token từ localStorage (bạn có thể đổi theo cách bạn lưu token)
        const token = localStorage.getItem("token");

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/guest/get-post`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPosts(res.data.data); // data là mảng các bài đăng
      } catch (err) {
        console.error("❌ Error fetching posts:", err.response?.data || err.message);
      }
    };

    fetchPosts();
  }, []);
  // hàm thay đổi màu sắc gói
  const getPackageBadgeClass = (type) => {
    switch ((type || "").toUpperCase()) {
      case "VIP1": return "badge bg-primary";       // Xanh
      case "VIP2": return "badge bg-danger";        // Đỏ
      case "VIP3": return "badge bg-warning text-dark"; // Vàng
      default: return "badge bg-secondary";         // Xám
    }
  };

  return (
    <div style={{ background: "#f8fafc" }}>
      <Header user={user} name={user?.name} logout={logout} />

      {/* HERO SECTION */}
      <section className="position-relative overflow-hidden" style={{ minHeight: 500 }}>
        {/* Background Image */}
        <img
          src="/images/banner.jpg"
          alt="Banner"
          className="w-100 hero-bg"
          style={{
            height: 500,
            objectFit: "cover",
          }}
        />

        {/* Overlay gradient */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.15))",
          }}
        ></div>

        {/* Content */}
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-center">
          <div className="text-white px-3 hero-text">
            <h1
              className="fw-bold mb-3"
              style={{
                fontSize: "3.5rem",
                textShadow: "0 4px 20px rgba(0,0,0,0.7)",
                letterSpacing: 1,
              }}
            >
              Căn hộ mơ ước của bạn
            </h1>
            <p
              className="lead mb-4"
              style={{
                fontSize: "1.3rem",
                maxWidth: 800,
                margin: "0 auto",
                textShadow: "0 2px 10px rgba(0,0,0,0.6)",
              }}
            >
              Hệ thống cho thuê, mua bán và quản lý căn hộ hiện đại, uy tín tại FPT City
            </p>

            {/* Call to Action Buttons */}
            <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
              <a
                href="/blog"
                className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow"
                style={{ fontSize: "1.1rem", letterSpacing: 1 }}
              >
                🔍 Khám phá bài đăng
              </a>
              <a
                href="/contact"
                className="btn btn-white px-5 py-3 rounded-pill fw-bold hero-contact-btn"
                style={{
                  fontSize: "1.1rem",
                  letterSpacing: 1,
                  color: "#333",
                  border: "2px solid #fff",
                  backgroundColor: "#fff",
                  transition: "all 0.3s ease",
                }}
              >
                📞 Liên hệ tư vấn
              </a>

              <style>
              </style>
            </div>
          </div>
        </div>

        {/* CSS animation */}
        <style>
          {`
      .hero-bg {
        transform: scale(1.1);
        opacity: 0;
        animation: zoomIn 1.8s ease forwards;
      }

      @keyframes zoomIn {
        from {
          transform: scale(1.2);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .hero-text {
        opacity: 0;
        transform: translateY(40px);
        animation: slideUp 1.2s ease forwards;
        animation-delay: 0.6s;
      }

      @keyframes slideUp {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}
        </style>
      </section>



      {/* STATISTICS */}
      <section className="container py-5">
        <div className="row g-4 justify-content-center">

          <div className="col-12 col-md-4">
            <div className="bg-white rounded-4 shadow-lg py-5 h-100 d-flex flex-column align-items-center justify-content-center">
              <div className="fs-4 fw-bold text-dark mb-3" style={{ color: "#222" }}>
                Tin đăng bán
              </div>
              <div className="display-3 fw-bold text-warning">
                <CountUp end={postStats?.data?.forSale ?? 0} duration={2} />
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="bg-white rounded-4 shadow-lg py-5 h-100 d-flex flex-column align-items-center justify-content-center">
              <div className="fs-4 fw-bold text-dark mb-3" style={{ color: "#222" }}>
                Tin cho thuê
              </div>
              <div className="display-3 fw-bold text-warning">
                <CountUp end={postStats?.data?.forRent ?? 0} duration={2} />
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="bg-white rounded-4 shadow-lg py-5 h-100 d-flex flex-column align-items-center justify-content-center">
              <div className="fs-4 fw-bold text-dark mb-3" style={{ color: "#222" }}>
                Tin dịch vụ
              </div>
              <div className="display-3 fw-bold text-warning">
                <CountUp end={postStats?.data?.saleAndRent ?? 0} duration={2} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      {/* PLAZAS - DỰ ÁN NỔI BẬT */}
      <section className="container py-5">
        <h2 className="fw-bold text-uppercase mb-4 text-center">Dự án nổi bật</h2>
        <div className="row g-4">
          {plazas.map((p) => (
            <div className="col-12 col-sm-6 col-lg-4" key={p._id}>
              <div className="card border-0 shadow rounded-4 h-100 overflow-hidden">
                <div className="ratio ratio-16x9">
                  <img src={p.img} className="rounded-top" alt={p.name} style={{ objectFit: "cover" }} />
                </div>
                <div className="card-body bg-white">
                  <h5 className="card-title fw-bold text-dark">{p.name}</h5>
                  <p className="text-muted mb-2">
                    <i className="fa fa-map-marker-alt me-2 text-warning"></i>{p.location}
                  </p>
                  <div className="d-flex justify-content-center">
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => navigate(`/plaza/${p._id}`)}
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED APARTMENTS */}
      {/* FEATURED APARTMENTS */}
      <section className="container py-5" ref={listRef}>
        <h2 className="fw-bold text-uppercase mb-4 text-center">Bài Đăng nổi bật</h2>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {selectedPosts.map((post) => (
            <div className="col" key={post._id}>
              <div className="card border-0 shadow rounded-4 h-100 overflow-hidden">
                <div className="position-relative">
                  <img
                    src={post.images[0]}
                    className="card-img-top"
                    alt={post.title}
                    style={{ height: 200, objectFit: "cover" }}
                  />
                  {/* 🟢 Badge Bán / Cho thuê - góc trái */}
                  <span
                    className={`position-absolute top-0 start-0 m-2 px-3 py-1 rounded-pill shadow-lg border border-white ${post.type === "ban"
                      ? "bg-danger bg-opacity-75"
                      : post.type === "cho_thue"
                        ? "bg-primary bg-opacity-75"
                        : "bg-warning bg-opacity-75"} text-white`}
                    style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: 0.5 }}
                  >
                    {post.type === "ban"
                      ? "🏠 Bán"
                      : post.type === "cho_thue"
                        ? "💼 Cho thuê"
                        : "🛠️ Dịch vụ"}
                  </span>

                  {/* 🔵 Badge VIP - góc phải */}
                  <span
                    className={`${getPackageBadgeClass(post.postPackage?.type)} position-absolute top-0 end-0 m-2 px-3 py-1 rounded-pill shadow-lg border border-white text-white`}
                    style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 0.5 }}
                  >
                    {post.postPackage?.type?.toUpperCase() || "KHÔNG GÓI"}
                  </span>

                  {/* <span
                    className={`${getPackageBadgeClass(post.postPackage?.type)} position-absolute top-0 end-0 m-2 px-3 py-2 rounded-pill shadow`}
                    style={{ fontSize: "0.9rem", fontWeight: "bold" }}
                  >
                    {post.postPackage?.type?.toUpperCase() || "KHÔNG CÓ GÓI"}
                  </span> */}
                </div>
                <div className="card-body d-flex flex-column bg-white">
                  <h5 className="card-title fw-bold">{post.title}</h5>
                  <p className="card-text flex-grow-1">{post.address}</p>
                  <div
                    className="card-text"
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                      color: "#555",
                      maxHeight: "3.2em", // ~2 dòng
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                      {post.description &&
                        DOMPurify.sanitize(post.description, { ALLOWED_TAGS: [] })
                          .split(/\n+/)
                          .map((line) => line.trim())
                          .filter(Boolean)
                          .slice(0, 2) // chỉ lấy 2 dòng đầu tiên
                          .map((line, index) => {
                            const isSectionTitle =
                              line.startsWith("✨") || /THÔNG TIN/i.test(line);
                            const isBullet = line.startsWith("•") || /^\d+\./.test(line);

                            return (
                              <li
                                key={index}
                                className={`d-flex align-items-start ${isSectionTitle
                                  ? "fw-bold text-primary"
                                  : "text-truncate"
                                  }`}
                                style={{ gap: "6px" }}
                              >
                                {isSectionTitle ? (
                                  <span style={{ fontSize: "1rem" }}>✨</span>
                                ) : (
                                  <FaCheckCircle
                                    style={{
                                      color: "#0d6efd",
                                      marginTop: "3px",
                                      fontSize: "0.9rem",
                                      flexShrink: 0,
                                    }}
                                  />
                                )}

                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: line.replace(
                                      /^([^:]+):/,
                                      "<strong style='color:#0d6efd'>$1:</strong>"
                                    ),
                                  }}
                                />
                              </li>
                            );
                          })}
                    </ul>
                  </div>

                  <div className="d-flex justify-content-center mt-2">
                    <Button
                      variant="outline-warning"
                      onClick={() => handleViewDetail(post._id)}
                      className="btn-sm px-3 py-1"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Nút Xem thêm */}
        <div className="text-center mt-4">
          <button onClick={handleViewMore} className="btn btn-outline-primary px-4 py-2">
            Xem thêm
          </button>
        </div>

        {/* Modal yêu cầu đăng nhập (chỉ 1 modal duy nhất) */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Yêu cầu đăng nhập</Modal.Title>
          </Modal.Header>
          <Modal.Body>Bạn cần đăng nhập để thực hiện thao tác này.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleLoginRedirect}>
              Đăng nhập
            </Button>
          </Modal.Footer>
        </Modal>
      </section>


      {/* INFO BANNER */}
      <section className="my-5">
        <div className="container">
          <div className="row align-items-center bg-white rounded-4 shadow p-4">
            <div className="col-md-6 mb-3 mb-md-0">
              <img src="/images/content (2).jpg" alt="Info" className="w-100 rounded-4" style={{ height: 260, objectFit: "cover" }} />
            </div>
            <div className="col-md-6">
              <h3 className="fw-bold mb-3 text-warning">Vì sao chọn Ares?</h3>
              <ul className="list-unstyled fs-5 mb-0">
                <li className="mb-2"><i className="fa fa-check-circle text-success me-2"></i>Thông tin minh bạch, cập nhật liên tục</li>
                <li className="mb-2"><i className="fa fa-check-circle text-success me-2"></i>Hỗ trợ tận tâm 24/7</li>
                <li className="mb-2"><i className="fa fa-check-circle text-success me-2"></i>Đa dạng lựa chọn căn hộ, dự án</li>
                <li className="mb-2"><i className="fa fa-check-circle text-success me-2"></i>Giao diện hiện đại, dễ sử dụng</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {showUpdateModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Thông báo</h5>
                {/* <button type="button" className="btn-close" onClick={() => setShowUpdateModal(false)}></button> */}
              </div>
              <div className="modal-body">
                <p>Bạn chưa cập nhật đầy đủ thông tin cá nhân. Vui lòng cập nhật để tiếp tục sử dụng hệ thống.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowUpdateModal(false);
                    window.location.href = "/profile"; // Điều hướng đến trang cập nhật thông tin
                  }}
                >
                  Cập nhật ngay
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    logout(); // Gọi hàm logout từ context
                    window.location.href = "/"; // Chuyển về trang chủ hoặc login
                  }}
                >
                  Hủy và đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;