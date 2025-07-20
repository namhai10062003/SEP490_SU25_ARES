import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
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

const apartments = [
  { id: 1, beds: 2, title: "Modern Living Room", description: "Spacious and bright with natural light", imgSrc: "https://storage.googleapis.com/a1aa/image/eb17a6f0-03ac-4788-da98-14157d345540.jpg" },
  { id: 2, beds: 3, title: "Cozy Kitchen", description: "Equipped with modern appliances", imgSrc: "https://storage.googleapis.com/a1aa/image/a259e0d3-c5cd-434c-c572-a06f04e9a10d.jpg" },
  { id: 3, beds: 1, title: "Elegant Dining", description: "Perfect for family meals", imgSrc: "https://storage.googleapis.com/a1aa/image/50db75ab-f590-4028-1032-6d830ec5ba54.jpg" },
  { id: 4, beds: 2, title: "Comfortable Bedroom", description: "Relaxing and spacious", imgSrc: "https://storage.googleapis.com/a1aa/image/e3b41882-d7a6-4875-4c9d-7f199f55a15f.jpg" },
  { id: 5, beds: 1, title: "Sunny Balcony", description: "Great for morning coffee", imgSrc: "https://storage.googleapis.com/a1aa/image/a671ed03-7bea-40ef-8b7a-e7a4a98b42dd.jpg" },
  { id: 6, beds: 1, title: "Sunny Balcony", description: "Great for morning coffee", imgSrc: "https://storage.googleapis.com/a1aa/image/a671ed03-7bea-40ef-8b7a-e7a4a98b42dd.jpg" },
  { id: 7, beds: 1, title: "Sunny Balcony", description: "Great for morning coffee", imgSrc: "https://storage.googleapis.com/a1aa/image/a671ed03-7bea-40ef-8b7a-e7a4a98b42dd.jpg" },
  { id: 8, beds: 1, title: "Sunny Balcony", description: "Great for morning coffee", imgSrc: "https://storage.googleapis.com/a1aa/image/a671ed03-7bea-40ef-8b7a-e7a4a98b42dd.jpg" },
];

const plazas = [
  {
    name: "Plaza 1",
    address: "Số 2 Tôn Đức Thắng, Quận 1, TP.HCM",
    img: "https://storage.googleapis.com/a1aa/image/3330f0b3-8f9a-4e92-3d3e-ab12bb98ccfb.jpg"
  },
  {
    name: "Plaza 2",
    address: "Thủ Thiêm, TP. Thủ Đức, TP.HCM",
    img: "https://storage.googleapis.com/a1aa/image/9a2e90db-d729-4da2-de9d-236607c00ba3.jpg"
  },
  {
    name: "Plaza 3",
    address: "90 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM",
    img: "https://storage.googleapis.com/a1aa/image/020040dc-03a9-4614-4b67-a18a349d6467.jpg"
  },
  {
    name: "Plaza 4",
    address: "Thủ Thiêm, TP. Thủ Đức, TP.HCM",
    img: "https://storage.googleapis.com/a1aa/image/1e81d478-dc97-458d-1895-7134e4a97cbf.jpg"
  },
  {
    name: "Plaza 5",
    address: "Thảo Điền, TP. Thủ Đức, TP.HCM",
    img: "https://storage.googleapis.com/a1aa/image/1bd24d96-4833-4ef5-ee96-e889bfe8c849.jpg"
  },
  {
    name: "Plaza 6",
    address: "Số 2 Tôn Đức Thắng, Quận 1, TP.HCM",
    img: "https://storage.googleapis.com/a1aa/image/e26568dc-2865-4718-8ef4-07f2948aad7b.jpg"
  },
];


const Home = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const listRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const selectedPosts = posts.slice(startIndex, startIndex + postsPerPage);
  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
  
      // Scroll đến phần danh sách thay vì về đầu trang
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Lấy token từ localStorage (bạn có thể đổi theo cách bạn lưu token)
        const token = localStorage.getItem("token");
  
        const res = await axios.get("http://localhost:4000/api/posts/active", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setPosts(res.data.data); // data là mảng các bài viết
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
              <div className="display-3 fw-bold text-warning">
                <CountUpOnView end={176} />
              </div>
              <div className="text-secondary fs-5 mt-3">
                Căn hộ bán trong khu vực
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="bg-white rounded-4 shadow-lg py-5 h-100 d-flex flex-column align-items-center justify-content-center">
              <div className="display-3 fw-bold text-warning">
                <CountUpOnView end={216} />
              </div>
              <div className="text-secondary fs-5 mt-3">
                Căn hộ cho thuê
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="bg-white rounded-4 shadow-lg py-5 h-100 d-flex flex-column align-items-center justify-content-center">
              <div className="display-3 fw-bold text-warning">
                <CountUpOnView end={88} />
              </div>
              <div className="text-secondary fs-5 mt-3">
                Căn hộ bán cho thuê
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      {/* PLAZAS - DỰ ÁN NỔI BẬT */}
      <section className="container py-5">
  <h2 className="fw-bold text-uppercase mb-4 text-center">Tòa nhà nổi bật</h2>
  <div className="row g-4">
    {plazas.map((p, i) => (
            <div className="col-12 col-sm-6 col-lg-4" key={i}>
            <div className="card border-0 shadow rounded-4 h-100 overflow-hidden">
              <img
                src={p.img}
                className="card-img-top"
                alt={p.name}
                style={{ height: 220, objectFit: "cover" }}
              />
              <div className="card-body bg-white">
                <h5 className="card-title fw-bold text-dark">{p.name}</h5>
                <p className="text-muted mb-2">
                  <i className="fa fa-map-marker-alt me-2 text-warning"></i>{p.address}
                </p>
                <div className="d-flex justify-content-center">
                  <button className="btn btn-outline-warning btn-sm">Chi tiết</button>
                </div>
              </div>
            </div>
          </div>
          ))}
        </div>
      </section>

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
           <span
  className={`${getPackageBadgeClass(post.postPackage?.type)} position-absolute top-0 end-0 m-2 px-3 py-2 rounded-pill shadow`}
  style={{ fontSize: "0.9rem", fontWeight: "bold" }}
>
  {post.postPackage?.type?.toUpperCase() || "KHÔNG CÓ GÓI"}
</span>
          </div>
          <div className="card-body d-flex flex-column bg-white">
            <h5 className="card-title fw-bold">{post.title}</h5>
            <p className="card-text flex-grow-1">{post.address}</p>
            <a href={`/postdetail/${post._id}`} className="btn btn-warning mt-auto rounded-pill">
              Chi tiết
            </a>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* PAGINATION */}
  <div className="d-flex justify-content-center mt-4">
    <nav>
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Trước</button>
        </li>
        {[...Array(totalPages)].map((_, index) => (
          <li
            key={index}
            className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
          >
            <button className="page-link" onClick={() => handlePageChange(index + 1)}>
              {index + 1}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Sau</button>
        </li>
      </ul>
    </nav>
  </div>
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

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;