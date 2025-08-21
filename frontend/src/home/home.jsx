import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import CountUp from 'react-countup';
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

// const apartments = [
//   { id: 1, beds: 2, title: "Modern Living Room", description: "Spacious and bright with natural light", imgSrc: "https://storage.googleapis.com/a1aa/image/eb17a6f0-03ac-4788-da98-14157d345540.jpg" },
//   { id: 2, beds: 3, title: "Cozy Kitchen", description: "Equipped with modern appliances", imgSrc: "https://storage.googleapis.com/a1aa/image/a259e0d3-c5cd-434c-c572-a06f04e9a10d.jpg" },
//   { id: 3, beds: 1, title: "Elegant Dining", description: "Perfect for family meals", imgSrc: "https://storage.googleapis.com/a1aa/image/50db75ab-f590-4028-1032-6d830ec5ba54.jpg" },
//   { id: 4, beds: 2, title: "Comfortable Bedroom", description: "Relaxing and spacious", imgSrc: "https://storage.googleapis.com/a1aa/image/e3b41882-d7a6-4875-4c9d-7f199f55a15f.jpg" },
//   { id: 5, beds: 1, title: "Sunny Balcony", description: "Great for morning coffee", imgSrc: "https://storage.googleapis.com/a1aa/image/a671ed03-7bea-40ef-8b7a-e7a4a98b42dd.jpg" },
//   { id: 6, beds: 1, title: "Sunny Balcony", description: "Great for morning coffee", imgSrc: "https://storage.googleapis.com/a1aa/image/a671ed03-7bea-40ef-8b7a-e7a4a98b42dd.jpg" },
//   { id: 7, beds: 1, title: "Sunny Balcony", description: "Great for morning coffee", imgSrc: "https://storage.googleapis.com/a1aa/image/a671ed03-7bea-40ef-8b7a-e7a4a98b42dd.jpg" },
//   { id: 8, beds: 1, title: "Sunny Balcony", description: "Great for morning coffee", imgSrc: "https://storage.googleapis.com/a1aa/image/a671ed03-7bea-40ef-8b7a-e7a4a98b42dd.jpg" },
// ];

const plazas = [
  {
    name: "Plaza 1",
    address: "FPT City, P. Ngũ Hành Sơn, Tp. Đà Nẵng",
    img: "https://chungcufptplaza.com/watermarks/900x450x1/upload/product/z60043682176611910475ee051c7749d09453e87cd4973-1730865005.jpg",
    info: {
      investor: "Công ty Cổ phần Đô thị FPT Đà Nẵng",
      totalCapital: "750 tỷ",
      scale: "600 căn",
      type: "Căn hộ chung cư",
      location: "Đường Võ Chí Công, Khu Đô thị công nghệ FPT Đà Nẵng",
      floors: 15,
      contractor: "Công ty TNHH Tập đoàn XD Delta",
      totalArea: "71.796m²",
      constructionDensity: "49,83%",
      completion: "Đã bàn giao năm 2021"
    }
  },
  {
    name: "Plaza 2",
    address: "FPT City, P. Ngũ Hành Sơn, Tp. Đà Nẵng",
    img: "https://hoanggiaminh.com/uploads/images/FPT%20PLAZA%202%20(2).png",
    info: {
      investor: "Công ty Cổ phần FPT City",
      totalCapital: "920 tỷ",
      scale: "800 căn",
      type: "Căn hộ cao cấp",
      location: "Nguyễn Văn Tạo, FPT City",
      floors: 18,
      contractor: "Tập đoàn Hòa Bình",
      totalArea: "85.000m²",
      constructionDensity: "52%",
      completion: "Dự kiến hoàn thành Q4/2025"
    }
  },
  {
    name: "Plaza 3",
    address: "FPT City, P. Ngũ Hành Sơn, Tp. Đà Nẵng",
    img: "https://fptplaza3.fptcity.vn/wp-content/uploads/2024/05/nen-sang-min.png",
    info: {
      investor: "Tập đoàn Bất Động Sản Ares",
      totalCapital: "1.100 tỷ",
      scale: "900 căn",
      type: "Chung cư cao tầng + Shophouse",
      location: "Trục Võ Chí Công, sát sông Cổ Cò",
      floors: 20,
      contractor: "Coteccons",
      totalArea: "90.000m²",
      constructionDensity: "48%",
      completion: "Khởi công 2024 – hoàn thiện 2026"
    }
  },
  {
    name: "Plaza 4",
    address: "FPT City, P. Ngũ Hành Sơn, Tp. Đà Nẵng",
    img: "https://phungbds.cdn.vccloud.vn/wp-content/uploads/2022/06/fpt-city-plaza-4-1240x672.jpeg",
    info: {
      investor: "Công ty Cổ phần Đầu tư An Gia",
      totalCapital: "680 tỷ",
      scale: "500 căn",
      type: "Căn hộ dịch vụ & nghỉ dưỡng",
      location: "FPT Plaza Zone 4, ven hồ sinh thái",
      floors: 12,
      contractor: "Delta Group",
      totalArea: "55.000m²",
      constructionDensity: "42%",
      completion: "Đã hoàn thành 2023"
    }
  },
  {
    name: "Plaza 5",
    address: "FPT City, P. Ngũ Hành Sơn, Tp. Đà Nẵng",
    img: "https://chungcuhanoixanh.net/wp-content/uploads/2017/01/toan-canh-imperial-plaza.jpg",
    info: {
      investor: "SunLand Đà Nẵng",
      totalCapital: "820 tỷ",
      scale: "720 căn",
      type: "Căn hộ thông minh (Smart Home)",
      location: "Cạnh làng đại học FPT",
      floors: 17,
      contractor: "Tập đoàn Phúc Khang",
      totalArea: "68.000m²",
      constructionDensity: "47%",
      completion: "Dự kiến bàn giao đầu 2025"
    }
  },
  {
    name: "Plaza 6",
    address: "FPT City, P. Ngũ Hành Sơn, Tp. Đà Nẵng",
    img: "https://thangmaygiadinh.edu.vn/images/bai_toan_chung_cu_moi_va_nha_tap_the_cu_1.jpg",
    info: {
      investor: "Tập đoàn Hưng Thịnh",
      totalCapital: "990 tỷ",
      scale: "850 căn",
      type: "Chung cư cao cấp + căn hộ studio",
      location: "Kế bên cầu Cổ Cò, FPT City",
      floors: 19,
      contractor: "Ricons",
      totalArea: "78.500m²",
      constructionDensity: "51%",
      completion: "Đang xây dựng, bàn giao Q3/2025"
    }
  },
];

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
      .then(res => setPlazas(res.data.data))
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
      <section className="position-relative" style={{ minHeight: 420 }}>
        <img src="/images/banner.jpg" alt="Banner" className="w-100" style={{ height: 420, objectFit: "cover", filter: "brightness(0.7)" }} />
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <div className="text-center text-white">
            <h1 className="display-4 fw-bold mb-3">Căn hộ mơ ước của bạn</h1>
            <p className="lead mb-4">Hệ thống cho thuê & mua bán căn hộ chuyên nghiệp, uy tín tại FPT City</p>
            <form
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                maxWidth: 1800,
                margin: "0 auto",
                gap: 0,
              }}
            >
              <input
                type="search"
                placeholder="Nhập tên dự án, khu vực..."
                style={{
                  fontSize: 18,
                  height: 60,
                  width: "50%",
                  border: "none",
                  outline: "none",
                  padding: "0 40px",
                  borderTopLeftRadius: 60,
                  borderBottomLeftRadius: 60,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  margin: 0,
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                style={{
                  fontSize: 18,
                  height: 60,
                  width: "50%",
                  border: "none",
                  outline: "none",
                  background: "#21a6fa",
                  color: "#fff",
                  fontWeight: 700,
                  borderTopRightRadius: 60,
                  borderBottomRightRadius: 60,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  margin: 0,
                  boxSizing: "border-box",
                  cursor: "pointer",
                  letterSpacing: 2,
                }}
              >
                TÌM KIẾM
              </button>
            </form>
          </div>
        </div>
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
        <h2 className="fw-bold text-uppercase mb-4 text-center">Căn hộ nổi bật</h2>
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
                  <p
                    className="card-text text-truncate"
                    style={{
                      maxHeight: "3.6em", // 2 dòng
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {post.description}
                  </p>
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