
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "fullpage.js";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "fullpage.js/dist/jquery.fullpage.min.css";
import DOMPurify from "dompurify";
import { Button } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";
import ReusableModal from "../../components/ReusableModal.jsx";
import { useAuth } from "../../context/authContext";
import CountUp from "react-countup";

const HeroSection = ({ postStats }) => (
  <div
    className="hero-section d-flex flex-column align-items-center justify-content-center text-center position-relative"
    style={{
      backgroundImage: `url(/src/pages/images/banner.webp)`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      minHeight: "100vh",
      color: "#fff", // Make all text white by default
    }}
  >
    {/* Overlay */}
    <div
      className="position-absolute top-0 start-0 w-100 h-100"
      style={{
        background: "linear-gradient(120deg, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.2) 100%)",
        zIndex: 1,
      }}
    ></div>

    {/* Content */}
    <div className="position-relative w-100" style={{ zIndex: 2, maxWidth: 1200, margin: "0 auto", color: "#fff" }}>
      <h1
        className="fw-bold mb-3"
        style={{
          fontSize: "3.2rem",
          textShadow: "0 4px 24px rgba(0,0,0,0.85)",
          letterSpacing: 1,
          color: "#fff",
        }}
      >
        Căn hộ mơ ước của bạn
      </h1>
      <p
        className="lead mb-4"
        style={{
          fontSize: "1.25rem",
          maxWidth: 700,
          margin: "0 auto",
          textShadow: "0 2px 10px rgba(0,0,0,0.7)",
          color: "#fff",
        }}
      >
        Hệ thống cho thuê & mua bán căn hộ hiện đại, uy tín tại FPT City
      </p>
      <div className="d-flex flex-wrap justify-content-center gap-3 mt-4 mb-5">
        <a
          href="/blog"
          className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow"
          style={{ fontSize: "1.1rem", minWidth: 180, color: "#fff" }}
        >
          🔍 Khám phá dự án
        </a>
        <a
          href="/contact"
          className="btn btn-outline-light px-5 py-3 rounded-pill fw-bold"
          style={{ fontSize: "1.1rem", minWidth: 180, borderWidth: 2, color: "#fff" }}
        >
          📞 Liên hệ tư vấn
        </a>
      </div>
      <div className="d-flex justify-content-center w-100">
        <div className="row g-4 justify-content-center w-100" style={{ maxWidth: 900 }}>
          <div className="col-12 col-md-4">
            <div
              className="rounded-4 shadow-lg py-4 px-2 h-100 d-flex flex-column align-items-center justify-content-center"
              style={{
                background: "#fff",
                minHeight: 160,
                border: "2px solid #f5f5f5",
                transition: "box-shadow 0.2s",
                color: "#333", // Make card text dark for contrast
              }}
            >
              <div className="fs-5 fw-semibold text-secondary mb-2" style={{ letterSpacing: 0.5, color: "#333" }}>Tin đăng bán</div>
              <div
                className="fw-bold"
                style={{
                  fontSize: "3.2rem",
                  color: "#ff9800",
                  lineHeight: 1,
                  textShadow: "0 2px 10px rgba(255,152,0,0.15)",
                }}
              >
                <CountUp end={postStats?.forSale ?? 0} duration={2.5} />
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div
              className="rounded-4 shadow-lg py-4 px-2 h-100 d-flex flex-column align-items-center justify-content-center"
              style={{
                background: "#fff",
                minHeight: 160,
                border: "2px solid #f5f5f5",
                transition: "box-shadow 0.2s",
                color: "#333",
              }}
            >
              <div className="fs-5 fw-semibold text-secondary mb-2" style={{ letterSpacing: 0.5, color: "#333" }}>Tin cho thuê</div>
              <div
                className="fw-bold"
                style={{
                  fontSize: "3.2rem",
                  color: "#1976d2",
                  lineHeight: 1,
                  textShadow: "0 2px 10px rgba(25,118,210,0.15)",
                }}
              >
                <CountUp end={postStats?.forRent ?? 0} duration={2.5} />
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div
              className="rounded-4 shadow-lg py-4 px-2 h-100 d-flex flex-column align-items-center justify-content-center"
              style={{
                background: "#fff",
                minHeight: 160,
                border: "2px solid #f5f5f5",
                transition: "box-shadow 0.2s",
                color: "#333",
              }}
            >
              <div className="fs-5 fw-semibold text-secondary mb-2" style={{ letterSpacing: 0.5, color: "#333" }}>Tin dịch vụ</div>
              <div
                className="fw-bold"
                style={{
                  fontSize: "3.2rem",
                  color: "#1565c0",
                  lineHeight: 1,
                  textShadow: "0 2px 10px rgba(21,101,192,0.15)",
                }}
              >
                <CountUp end={postStats?.saleAndRent ?? 0} duration={2.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Fix: Use correct keys from postStats (res.data is an object with keys: forSale, forRent, saleAndRent)


const PlazasSection = ({ plazas, navigate }) => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };
  return (
    <div className="container py-5">
      <h2 className="fw-bold text-uppercase mb-4 text-center">Dự án nổi bật</h2>
      <Slider {...sliderSettings}>
        {plazas.map((p) => (
          <div key={p._id} className="px-2">
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
                  <button className="btn btn-outline-warning btn-sm" onClick={() => navigate(`/plaza/${p._id}`)}>Chi tiết</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

// Rewrite: Use react-slick for FeaturedApartmentsSection
const FeaturedApartmentsSection = ({ posts, handleViewDetail, listRef }) => {
  const slidesToShow = Math.min(posts.length, 3);
  const sliderSettings = {
    dots: posts.length > 3,
    infinite: posts.length > 3,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    arrows: posts.length > 3,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: Math.min(posts.length, 2) } },
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };
  return (
    <div className="container py-5" ref={listRef}>
      <h2 className="fw-bold text-uppercase mb-4 text-center">Căn hộ nổi bật</h2>
      <Slider {...sliderSettings}>
        {posts.map((post) => (
          <div key={post._id} style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="card border-0 shadow rounded-4 h-100 overflow-hidden" style={{ maxWidth: 450, width: '100%', margin: '0 auto' }}>
              <div className="position-relative">
                <img src={post.images[0]} className="card-img-top" alt={post.title} style={{ height: 200, objectFit: "cover" }} />
                <span className={`position-absolute top-0 start-0 m-2 px-3 py-1 rounded-pill shadow-lg border border-white ${post.type === "ban"
                  ? "bg-danger bg-opacity-75"
                  : post.type === "cho_thue"
                    ? "bg-primary bg-opacity-75"
                    : "bg-warning bg-opacity-75"} text-white`} style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: 0.5 }}>
                  {post.type === "ban"
                    ? "🏠 Bán"
                    : post.type === "cho_thue"
                      ? "💼 Cho thuê"
                      : "🛠️ Dịch vụ"}
                </span>
              </div>
              <div className="card-body d-flex flex-column bg-white">
                <h5 className="card-title fw-bold">{post.title}</h5>
                <p className="card-text flex-grow-1">{post.address}</p>
                <div className="card-text" style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#555", maxHeight: "3.2em", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                    {post.description &&
                      DOMPurify.sanitize(post.description, { ALLOWED_TAGS: [] })
                        .split(/\n+/)
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((line, index) => {
                          const isSectionTitle = line.startsWith("✨") || /THÔNG TIN/i.test(line);
                          return (
                            <li key={index} className={`d-flex align-items-start ${isSectionTitle ? "fw-bold text-primary" : "text-truncate"}`} style={{ gap: "6px" }}>
                              {isSectionTitle ? (
                                <span style={{ fontSize: "1rem" }}>✨</span>
                              ) : (
                                <FaCheckCircle style={{ color: "#0d6efd", marginTop: "3px", fontSize: "0.9rem", flexShrink: 0 }} />
                              )}
                              <span dangerouslySetInnerHTML={{ __html: line.replace(/^([^:]+):/, "<strong style='color:#0d6efd'>$1:</strong>") }} />
                            </li>
                          );
                        })}
                  </ul>
                </div>
                <div className="d-flex justify-content-center mt-2">
                  <Button variant="outline-warning" onClick={() => handleViewDetail(post._id)} className="btn-sm px-3 py-1" style={{ fontSize: '0.8rem' }}>
                    Chi tiết
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

const InfoBannerSection = () => (
  <div className="my-5">
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
  </div>
);

const Home = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const listRef = useRef(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const navigate = useNavigate();
  const [plazas, setPlazas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postStats, setPostStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all data in parallel, then init fullPage.js
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const token = localStorage.getItem("token");
    Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/api/posts/stats`),
      axios.get(`${import.meta.env.VITE_API_URL}/api/plaza`),
      axios.get(`${import.meta.env.VITE_API_URL}/api/posts/get-top-6`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ]).then(([statsRes, plazasRes, postsRes]) => {
      if (!isMounted) return;
      setPostStats(statsRes.data.data);
      setPlazas(plazasRes.data.data);
      setPosts(postsRes.data.data);
      setLoading(false);
    }).catch((err) => {
      if (!isMounted) return;
      setLoading(false);
      // Optionally handle error UI
      console.error('Error loading home data:', err);
    });
    return () => { isMounted = false; };
  }, []);

  // Only init fullPage.js after data is loaded
  useEffect(() => {
    if (loading) return;
    if (window.$ === undefined) window.$ = $;
    $("#fullpage").fullpage({
      navigation: true,
      scrollingSpeed: 350, // Faster, snappier scroll
      easingcss3: "ease",
      fitToSectionDelay: 300,
      anchors: ["hero", "plazas", "featured", "info", "footer"],
      fitToSection: true,
      scrollBar: false,
      scrollOverflow: true,
      scrollOverflowReset: true,
      scrollOverflowOptions: {
        scrollbars: true,
        mouseWheel: true,
        hideScrollbars: false,
        fadeScrollbars: false,
        disableMouse: false
      }
    });
    return () => {
      if ($.fn.fullpage.destroy) $.fn.fullpage.destroy("all");
    };
  }, [loading]);

  useEffect(() => {
    if (user && (!user.identityNumber || !user.phone)) {
      setShowUpdateModal(true);
    }
  }, [user]);

  const handleViewDetail = (postId) => {
    if (!user) {
      setShowModal(true);
      setSelectedPostId(postId);
    } else {
      navigate(`/postdetail/${postId}`);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login", { state: { redirectTo: "/blog" } });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div id="fullpage">
        <div className="section"> <HeroSection postStats={postStats} /> </div>
        <div className="section"> <PlazasSection plazas={plazas} navigate={navigate} /> </div>
        <div className="section"> <FeaturedApartmentsSection posts={posts} handleViewDetail={handleViewDetail} listRef={listRef} /> </div>
        <div className="section"> <InfoBannerSection /> </div>
        <div className="section" id="footer-section" style={{ height: "auto" }}> <Footer /> </div>
      </div>
      <ReusableModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Yêu cầu đăng nhập"
        body={<div>Bạn cần đăng nhập để thực hiện thao tác này.</div>}
        footerButtons={[
          { label: "Hủy", variant: "secondary", onClick: () => setShowModal(false) },
          { label: "Đăng nhập", variant: "primary", onClick: handleLoginRedirect },
        ]}
      />
      <ReusableModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Thông báo"
        body={<div>Bạn chưa cập nhật đầy đủ thông tin cá nhân. Vui lòng cập nhật để tiếp tục sử dụng hệ thống.</div>}
        footerButtons={[
          {
            label: "Cập nhật ngay",
            variant: "primary",
            onClick: () => {
              setShowUpdateModal(false);
              window.location.href = "/profile";
            },
          },
          {
            label: "Hủy và đăng xuất",
            variant: "secondary",
            onClick: () => {
              logout();
              window.location.href = "/";
            },
          },
        ]}
      />
    </div>
  );
};

export default Home;