import axios from "axios";
import DOMPurify from "dompurify";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/footer";
import Header from "../../components/header";
// import getBadgeColorForPackage from "../../utils/format.jsx"
import ReusableModal from "../../components/ReusableModal.jsx";
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


const HeroSection = ({ user, logout }) => (
  <section className="position-relative overflow-hidden hero-section">
    <img src="/images/banner.jpg" alt="Banner" className="w-100 hero-bg" />
    <div className="position-absolute top-0 start-0 w-100 h-100 hero-overlay"></div>
    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-center">
      <div className="text-white px-3 hero-text">
        <h1 className="fw-bold mb-3 hero-title">Căn hộ mơ ước của bạn</h1>
        <p className="lead mb-4 hero-desc">
          Hệ thống cho thuê & mua bán căn hộ hiện đại, uy tín tại FPT City
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
          <a href="/blog" className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow hero-btn">🔍 Khám phá dự án</a>
          <a href="/contact" className="btn btn-secondary px-5 py-3 rounded-pill fw-bold hero-contact-btn">📞 Liên hệ tư vấn</a>
        </div>
      </div>
    </div>
  </section>
);

const StatisticsSection = ({ postStats }) => (
  <section className="container py-5">
    <div className="row g-4 justify-content-center">
      <div className="col-12 col-md-4">
        <div className="bg-white rounded-4 shadow-lg py-5 h-100 d-flex flex-column align-items-center justify-content-center">
          <div className="fs-4 fw-bold text-dark mb-3">Tin đăng bán</div>
          <div className="display-3 fw-bold text-warning">
            <CountUpOnView end={postStats?.data?.forSale ?? 0} duration={2} />
          </div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div className="bg-white rounded-4 shadow-lg py-5 h-100 d-flex flex-column align-items-center justify-content-center">
          <div className="fs-4 fw-bold text-dark mb-3">Tin cho thuê</div>
          <div className="display-3 fw-bold text-warning">
            <CountUpOnView end={postStats?.data?.forRent ?? 0} duration={2} />
          </div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div className="bg-white rounded-4 shadow-lg py-5 h-100 d-flex flex-column align-items-center justify-content-center">
          <div className="fs-4 fw-bold text-dark mb-3">Tin dịch vụ</div>
          <div className="display-3 fw-bold text-warning">
            <CountUpOnView end={postStats?.data?.saleAndRent ?? 0} duration={2} />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const PlazasSection = ({ plazas, navigate }) => (
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
                <button className="btn btn-outline-warning btn-sm" onClick={() => navigate(`/plaza/${p._id}`)}>Chi tiết</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const FeaturedApartmentsSection = ({ posts, handleViewDetail, listRef }) => {
  return (
    <section className="container py-5" ref={listRef}>
      <h2 className="fw-bold text-uppercase mb-4 text-center">Căn hộ nổi bật</h2>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
        {posts.map((post) => (
          <div className="col" key={post._id}>
            <div className="card border-0 shadow rounded-4 h-100 overflow-hidden">
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
                {/* <span className={`${getBadgeColorForPackage(post.postPackage?.type)} position-absolute top-0 end-0 m-2 px-3 py-1 rounded-pill shadow-lg border border-white text-white`} style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 0.5 }}>
                  {post.postPackage?.type?.toUpperCase() || "KHÔNG GÓI"}
                </span> */}
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
      </div>
    </section>
  );
};

const InfoBanner = () => (
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

  useEffect(() => {
    const fetchPostStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/stats`);
        setPostStats(res.data);
      } catch (error) {
        console.error("Lỗi khi fetch postStats:", error);
      }
    };
    fetchPostStats();
  }, []);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/plaza`)
      .then(res => setPlazas(res.data.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (user && (!user.identityNumber || !user.phone)) {
      setShowUpdateModal(true);
    }
  }, [user]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/get-top-3`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data.data);
      } catch (err) {
        console.error("❌ Error fetching posts:", err.response?.data || err.message);
      }
    };
    fetchPosts();
  }, []);

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

  return (
    <div style={{ background: "#f8fafc" }}>
      <Header user={user} name={user?.name} logout={logout} />
      <HeroSection user={user} logout={logout} />
      <StatisticsSection postStats={postStats} />
      <PlazasSection plazas={plazas} navigate={navigate} />
      <FeaturedApartmentsSection
        posts={posts}
        handleViewDetail={handleViewDetail}
        listRef={listRef}
      />
      <InfoBanner />
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
      <Footer />
    </div>
  );
};

export default Home;