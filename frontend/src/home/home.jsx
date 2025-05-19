import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/header";
import { useAuth } from "../../context/authContext";
import image from '../images/banner.jpg';
import image1 from '../images/content (2).jpg';
import "./home.css";
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
          const increment = end / (duration / 16); // chạy 60fps ~ 16ms/frame
  
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
      // kiểm tra ngay khi mount (trường hợp đang ở vị trí ngay phần tử)
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
const Home = () => {
    const { user, logout } = useAuth();
    const [name, setName] = useState(null);
    useEffect(() => {
        if (user) {
          setName(user.name);
        } else {
          setName(null);
        }
      }, [user]);
  return (

    <div className="home-body">
 <div>
      <Header user={user} name={user?.name} logout={logout} />
     
    </div>
      {/* Hero Section */}
      <section className="hero-section">
        <img
          alt="Cityscape at night with illuminated buildings, river and roads with bright street lights"
          className="hero-image"
          src={image}
          width="1920"
          height="600"
        />
        <div className="hero-overlay">
          <h1 className="hero-title">Chào mừng đến với Ares,</h1>
          <p className="hero-subtitle">
            Chúng tôi chuyên cho thuê các dự án, căn hộ ở khu vực xung quanh Q1,
            Q2, Bình thạnh, thành phố Hồ Chí Minh
          </p>
          <button className="hero-button">CÁC CĂN HỘ CHO THUÊ</button>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section">
        <h2 className="projects-title">CÁC DỰ ÁN CÓ CĂN HỘ</h2>
        <div className="projects-grid">
          {/* Project 1 */}
          <div className="project-item">
            <img
              alt="Vinhomes Golden River night view with illuminated buildings and city lights"
              className="project-image"
              src="https://storage.googleapis.com/a1aa/image/3330f0b3-8f9a-4e92-3d3e-ab12bb98ccfb.jpg"
              width="280"
              height="160"
            />
            <p className="project-name">VINHOMES GOLDEN RIVER (BASON)</p>
            <button className="project-button">XEM</button>
          </div>

          {/* Project 2 */}
          <div className="project-item">
            <img
              alt="The River building exterior with modern architecture under blue sky"
              className="project-image"
              src="https://storage.googleapis.com/a1aa/image/9a2e90db-d729-4da2-de9d-236607c00ba3.jpg"
              width="280"
              height="160"
            />
            <p className="project-name">THE RIVER</p>
            <button className="project-button">XEM</button>
          </div>

          {/* Project 3 */}
          <div className="project-item">
            <img
              alt="Sunwah Pearl entrance sign with red letters and green plants"
              className="project-image"
              src="https://storage.googleapis.com/a1aa/image/020040dc-03a9-4614-4b67-a18a349d6467.jpg"
              width="280"
              height="160"
            />
            <p className="project-name">SUNWAH PEARL</p>
            <button className="project-button">XEM</button>
          </div>

          {/* Project 4 */}
          <div className="project-item">
            <img
              alt="Empire City modern residential towers with blue sky background"
              className="project-image"
              src="https://storage.googleapis.com/a1aa/image/1e81d478-dc97-458d-1895-7134e4a97cbf.jpg"
              width="280"
              height="160"
            />
            <p className="project-name">EMPIRE CITY</p>
            <button className="project-button">XEM</button>
          </div>

          {/* Project 5 */}
          <div className="project-item">
            <img
              alt="Metropole Thao Dien city view at sunset with multiple buildings"
              className="project-image"
              src="https://storage.googleapis.com/a1aa/image/1bd24d96-4833-4ef5-ee96-e889bfe8c849.jpg"
              width="280"
              height="160"
            />
            <p className="project-name">METROPOLE THẢO ĐIỀN</p>
            <button className="project-button">XEM</button>
          </div>

          {/* Project 6 */}
          <div className="project-item">
            <img
              alt="Grand Marina Saigon high-rise towers with sunset sky"
              className="project-image"
              src="https://storage.googleapis.com/a1aa/image/e26568dc-2865-4718-8ef4-07f2948aad7b.jpg"
              width="280"
              height="160"
            />
            <p className="project-name">GRAND MARINA SAIGON</p>
            <button className="project-button">XEM</button>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
  <img
    alt="Modern city buildings with blue sky and sunset lighting"
    className="info-image"
    src={image1}// ảnh local nếu có
    width="1920"
    height="600"
  />
  <div className="info-overlay">
    <div className="info-content">
      <div className="info-stats">
        <div className="info-stat-item">
          <span className="stat-number">
            <CountUpOnView end={176} />
          </span>
          <span className="stat-label">CĂN HỘ BÁN TRONG KHU VỰC</span>
        </div>
        <div className="info-stat-item">
          <span className="stat-number">
            <CountUpOnView end={216} />
          </span>
          <span className="stat-label">CĂN HỘ CHO THUÊ</span>
        </div>
        <div className="info-stat-item">
          <span className="stat-number">
            <CountUpOnView end={88} />
          </span>
          <span className="stat-label">CĂN HỘ BÁN CHO THUÊ</span>
        </div>
      </div>
      <div className="info-description">
        <h3 className="info-title">
          Một vài
          <br />
          THÔNG TIN VỀ SỐ LƯỢNG CĂN HỘ BÁN VÀ CHO THUÊ TẠI URBAN KEY
        </h3>
        <p className="info-text">
          Chúng tôi cung cấp các số liệu về số lượng căn hộ bán và cho thuê
          tại khu vực Urban Key, giúp bạn có cái nhìn tổng quan về thị trường
          bất động sản.
        </p>
      </div>
    </div>
  </div>
</section>
{/* {apartment} */}
<section className="apartments-section">
  <h2 className="apartments-title">Căn hộ đang cho thuê</h2> {/* Tiêu đề phần */}
  <div className="apartments-grid">
    {apartments.map(({ id, beds, title, description, imgSrc }) => (
      <article key={id} className="apartment-card">
        {/* Container chứa ảnh và nội dung overlay */}
        <div className="apartment-content-overlay">
          <img alt={title} className="apartment-image" src={imgSrc} />

          {/* Các nhãn overlay trên ảnh (position absolute) */}
          {/* Ví dụ cho nhãn số giường */}
          <div className="apartment-label bed">{beds} BED{beds > 1 ? "S" : ""}</div>
          {/* Bạn có thể thêm các nhãn khác tương tự, điều chỉnh class và vị trí */}
          {/* <div className="apartment-label available">Available</div> */}
          {/* <div className="apartment-label full-noi-that">Full nội thất</div> */}

          {/* Container cho tiêu đề, giá và nút (position absolute) */}
          <div className="apartment-info-overlay">
            <h3 className="apartment-title-overlay">{title}</h3> {/* Tiêu đề căn hộ */}
            <p className="apartment-price-overlay">{description}</p> {/* Giá (giả định description là giá) */}
            <a href={`/detail/${id}`} className="detail-button-overlay">Xem chi tiết <span className="button-line"></span></a> {/* Nút xem chi tiết */}
          </div>
        </div>
      </article>
    ))}
  </div>
</section>
{/* {LOGO THƯƠNG HIỆU} */}



{/* {Footer} */}
<footer className="footer">
      <div className="footer-container">
        <div>
          <h4>Contact Us</h4>
          <p>1234 Apartment St.</p>
          <p>City, State, 12345</p>
          <p>Email: info@apartments.com</p>
          <p>Phone: (123) 456-7890</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Available Apartments</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a aria-label="Facebook" href="#"><i className="fab fa-facebook-f"></i></a>
            <a aria-label="Twitter" href="#"><i className="fab fa-twitter"></i></a>
            <a aria-label="Instagram" href="#"><i className="fab fa-instagram"></i></a>
            <a aria-label="LinkedIn" href="#"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default Home;
