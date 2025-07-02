import React, { useEffect, useRef, useState } from "react";
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

const projects = [
  { name: "VINHOMES GOLDEN RIVER (BASON)", img: "https://storage.googleapis.com/a1aa/image/3330f0b3-8f9a-4e92-3d3e-ab12bb98ccfb.jpg" },
  { name: "THE RIVER", img: "https://storage.googleapis.com/a1aa/image/9a2e90db-d729-4da2-de9d-236607c00ba3.jpg" },
  { name: "SUNWAH PEARL", img: "https://storage.googleapis.com/a1aa/image/020040dc-03a9-4614-4b67-a18a349d6467.jpg" },
  { name: "EMPIRE CITY", img: "https://storage.googleapis.com/a1aa/image/1e81d478-dc97-458d-1895-7134e4a97cbf.jpg" },
  { name: "METROPOLE THẢO ĐIỀN", img: "https://storage.googleapis.com/a1aa/image/1bd24d96-4833-4ef5-ee96-e889bfe8c849.jpg" },
  { name: "GRAND MARINA SAIGON", img: "https://storage.googleapis.com/a1aa/image/e26568dc-2865-4718-8ef4-07f2948aad7b.jpg" },
];

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ background: "#f8fafc" }}>
      <Header user={user} name={user?.name} logout={logout} />

      {/* HERO SECTION */}
      <section className="position-relative" style={{ minHeight: 420 }}>
        <img src="/images/banner.jpg" alt="Banner" className="w-100" style={{ height: 420, objectFit: "cover", filter: "brightness(0.7)" }} />
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <div className="text-center text-white">
            <h1 className="display-4 fw-bold mb-3">Tìm căn hộ mơ ước của bạn</h1>
            <p className="lead mb-4">Nền tảng thuê & mua căn hộ chuyên nghiệp, minh bạch, uy tín tại TP.HCM</p>
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
      <section className="container py-5">
        <h2 className="fw-bold text-uppercase mb-4 text-center">Dự án nổi bật</h2>
        <div className="row g-4">
          {projects.map((p, i) => (
            <div className="col-12 col-sm-6 col-lg-4" key={i}>
              <div className="card border-0 shadow rounded-4 h-100 overflow-hidden">
                <img src={p.img} className="card-img-top" alt={p.name} style={{ height: 220, objectFit: "cover" }} />
                <div className="card-body text-center bg-white">
                  <p className="card-title fw-bold text-uppercase mb-2 text-dark">{p.name}</p>
                  <button className="btn btn-outline-warning btn-sm">Xem dự án</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED APARTMENTS */}
      <section className="container py-5">
        <h2 className="fw-bold text-uppercase mb-4 text-center">Căn hộ nổi bật</h2>
        <div className="row g-4">
          {apartments.map(({ id, beds, title, description, imgSrc }) => (
            <div className="col-12 col-sm-6 col-lg-4" key={id}>
              <div className="card border-0 shadow rounded-4 h-100 overflow-hidden">
                <div className="position-relative">
                  <img src={imgSrc} className="card-img-top" alt={title} style={{ height: 220, objectFit: "cover" }} />
                  <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2">{beds} PHÒNG</span>
                </div>
                <div className="card-body d-flex flex-column bg-white">
                  <h5 className="card-title fw-bold">{title}</h5>
                  <p className="card-text flex-grow-1">{description}</p>
                  <a href={`/detail/${id}`} className="btn btn-warning mt-auto rounded-pill">Xem chi tiết</a>
                </div>
              </div>
            </div>
          ))}
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
      <footer className="bg-dark text-light py-5 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <h4 className="fw-bold mb-3 text-warning">Liên hệ</h4>
              <p>1234 Apartment St.</p>
              <p>TP. Hồ Chí Minh</p>
              <p>Email: info@apartments.com</p>
              <p>Phone: (123) 456-7890</p>
            </div>
            <div className="col-md-4 mb-4">
              <h4 className="fw-bold mb-3 text-warning">Liên kết nhanh</h4>
              <ul className="list-unstyled">
                <li><a href="#" className="text-light text-decoration-none">Trang chủ</a></li>
                <li><a href="#" className="text-light text-decoration-none">Căn hộ nổi bật</a></li>
                <li><a href="#" className="text-light text-decoration-none">Về chúng tôi</a></li>
                <li><a href="#" className="text-light text-decoration-none">Liên hệ</a></li>
              </ul>
            </div>
            <div className="col-md-4 mb-4">
              <h4 className="fw-bold mb-3 text-warning">Kết nối với chúng tôi</h4>
              <div className="d-flex gap-3">
                <a aria-label="Facebook" href="#" className="text-light fs-4"><i className="fab fa-facebook-f"></i></a>
                <a aria-label="Twitter" href="#" className="text-light fs-4"><i className="fab fa-twitter"></i></a>
                <a aria-label="Instagram" href="#" className="text-light fs-4"><i className="fab fa-instagram"></i></a>
                <a aria-label="LinkedIn" href="#" className="text-light fs-4"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
          </div>
          <div className="text-center mt-4 text-secondary small">
            © {new Date().getFullYear()} Ares Apartment. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;