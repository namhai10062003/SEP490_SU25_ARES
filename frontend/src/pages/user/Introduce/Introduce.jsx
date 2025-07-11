import React from "react";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import h1 from "../../../home/anhteam.png";
import h2 from "../../../home/anhtienich.jpg";
const Introduce = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ background: "#f8fafc", fontFamily: "Segoe UI, sans-serif" }}>
      <Header user={user} name={user?.name} logout={logout} />

      {/* BANNER */}
      <section className="position-relative" style={{ minHeight: 480 }}>
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
          alt="Modern Apartment"
          className="w-100"
          style={{
            height: 480,
            objectFit: "cover",
            filter: "brightness(0.55)",
          }}
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <div className="text-center text-white px-3">
            <h1 className="display-4 fw-bold mb-3">Giới thiệu về ARES</h1>
            <p className="lead text-uppercase fw-semibold">
              💡 Tương lai sống hiện đại – 🎯 Trải nghiệm chuyên nghiệp
            </p>
          </div>
        </div>
      </section>

      {/* GIỚI THIỆU */}
      <section className="container py-5">
        <div className="row g-4">
          <div className="col-12">
            <div className="bg-white p-4 shadow rounded-4 border-start border-warning border-5">
              <h3 className="text-warning fw-bold mb-3">Giới thiệu</h3>
              <p className="fs-5 text-secondary">
                Trong thị trường bất động sản hiện đại đầy sôi động, việc tìm kiếm một không gian sống lý tưởng không hề dễ dàng. Tại <strong>ARES</strong>,
                chúng tôi không chỉ cung cấp dịch vụ môi giới nhà ở mà còn mang đến giải pháp toàn diện giúp bạn an tâm chọn lựa nơi an cư lý tưởng.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="bg-white p-4 shadow rounded-4 h-100 border-top border-warning border-3">
              <h4 className="text-warning fw-bold mb-3">🌟 Tầm nhìn</h4>
              <p className="text-secondary">
                ARES hướng tới trở thành biểu tượng cho niềm tin và chất lượng trong ngành bất động sản, là người bạn đồng hành đáng tin cậy cho mọi khách hàng.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="bg-white p-4 shadow rounded-4 h-100 border-top border-warning border-3">
              <h4 className="text-warning fw-bold mb-3">🎯 Sứ mệnh</h4>
              <p className="text-secondary">
                ARES cam kết cung cấp dịch vụ chuyên nghiệp, minh bạch và hỗ trợ tận tâm – từ lúc tìm nhà cho đến khi bạn chính thức trở thành cư dân.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GIÁ TRỊ CỐT LÕI */}
      <section className="container py-5">
        <div className="bg-white p-4 shadow rounded-4 text-center">
          <h3 className="text-warning fw-bold mb-4">🔑 Giá trị cốt lõi</h3>
          <div className="d-flex justify-content-center gap-4 fs-5 flex-wrap">
            <span>💎 <strong>Minh bạch</strong></span>
            <span>✅ <strong>Trung thực</strong></span>
            <span>🧠 <strong>Chuyên nghiệp</strong></span>
            <span>🤝 <strong>Khách hàng là trung tâm</strong></span>
          </div>
        </div>
      </section>

      {/* THÀNH VIÊN */}
      <section className="container py-5">
        <h3 className="fw-bold text-uppercase text-center mb-4 text-warning">👥 Thành viên</h3>
        <div className="bg-white p-4 shadow rounded-4">
          <img
            src={h1}
            alt="ARES Team"
            className="img-fluid rounded-4 w-100 mb-4"
          />
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <h5 className="fw-bold">Nam Hải (Alex)</h5>
              <p className="text-muted">CEO</p>
            </div>
            <div className="col-md-3">
              <h5 className="fw-bold">Khánh Vy</h5>
              <p className="text-muted">Sales Manager</p>
            </div>
            <div className="col-md-3">
              <h5 className="fw-bold">Thái Tuấn</h5>
              <p className="text-muted">CEO & General Director</p>
            </div>
            <div className="col-md-3">
              <h5 className="fw-bold">Trung Tín (Sunny)</h5>
              <p className="text-muted">Thành viên</p>
            </div>
          </div>
        </div>
      </section>

      {/* LỢI ÍCH */}
      <section className="container py-5">
        <h3 className="fw-bold text-uppercase text-center mb-4 text-warning">🎁 Lợi ích khi chọn ARES</h3>
        <div className="bg-white p-4 shadow rounded-4">
          <img
            src={h2}
            alt="ARES Benefits"
            className="img-fluid rounded-4 w-100 mb-4"
          />
          <div className="row">
            <div className="col-md-6">
              <ul className="fs-5 text-secondary">
                <li><strong>📄 Hỗ trợ giấy tờ:</strong> tạm trú, thuế</li>
                <li><strong>💬 Tư vấn cá nhân:</strong> chọn nhà theo ngân sách</li>
                <li><strong>📈 Thị trường:</strong> tham khảo giá cả minh bạch</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="fs-5 text-secondary">
                <li><strong>🏙️ Vị trí đa dạng:</strong> nhiều khu vực, tiện ích</li>
                <li><strong>⚙️ Hậu mãi:</strong> hỗ trợ sự cố nhanh chóng</li>
                <li><strong>📚 Chuyên môn:</strong> đội ngũ am hiểu pháp lý</li>
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
                <a href="#" className="text-light fs-4"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="text-light fs-4"><i className="fab fa-twitter"></i></a>
                <a href="#" className="text-light fs-4"><i className="fab fa-instagram"></i></a>
                <a href="#" className="text-light fs-4"><i className="fab fa-linkedin-in"></i></a>
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

export default Introduce;
