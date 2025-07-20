import React from "react";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import Footer from "../../../../components/footer";

const Contact = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ background: "#f8fafc", fontFamily: "Segoe UI, sans-serif" }}>
      <Header user={user} name={user?.name} logout={logout} />

      {/* BANNER */}
      <section className="position-relative" style={{ minHeight: 400 }}>
        <img
          src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=80"
          alt="Contact Banner"
          className="w-100"
          style={{
            height: 400,
            objectFit: "cover",
            filter: "brightness(0.55)",
          }}
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <div className="text-center text-white px-3">
            <h1 className="display-5 fw-bold">Liên hệ Ban Quản lý</h1>
            <p className="lead fw-semibold">📞 Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
          </div>
        </div>
      </section>

      {/* FORM LIÊN HỆ */}
      <section className="container py-5">
        <div className="bg-white p-4 shadow rounded-4">
          <h3 className="text-warning fw-bold mb-4">📬 Gửi tin nhắn đến Admin</h3>
          <form>
            <div className="mb-3">
              <label className="form-label fw-semibold">Họ và tên</label>
              <input type="text" className="form-control" placeholder="Nguyễn Văn A" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input type="email" className="form-control" placeholder="email@example.com" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nội dung liên hệ</label>
              <textarea className="form-control" rows="5" placeholder="Tôi cần hỗ trợ về..."></textarea>
            </div>
            <button type="submit" className="btn btn-warning px-4 fw-bold">
              Gửi yêu cầu
            </button>
          </form>
        </div>
      </section>

      {/* THÔNG TIN LIÊN HỆ */}
      <section className="container pb-5">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="bg-white p-4 shadow rounded-4 h-100 border-start border-warning border-5">
              <h4 className="text-warning fw-bold mb-3">📌 Văn phòng quản lý FPT Plaza</h4>
              <p className="text-secondary mb-1">Địa chỉ: Tòa FPT Plaza 1, FPT City, Ngũ Hành Sơn, Đà Nẵng</p>
              <p className="text-secondary mb-1">Email: support@fptplaza.vn</p>
              <p className="text-secondary">SĐT: 0909 123 456 (hỗ trợ 24/7)</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white p-4 shadow rounded-4 h-100 border-start border-warning border-5">
              <h4 className="text-warning fw-bold mb-3">💬 Các kênh hỗ trợ khác</h4>
              <ul className="list-unstyled text-secondary fs-5">
                <li>📱 Zalo Ban Quản Lý: <strong>0909 123 456</strong></li>
                <li>🌐 Website quản lý: <a href="#" className="text-decoration-none">fptcityres.vn</a></li>
                <li>💼 Gặp trực tiếp tại sảnh lễ tân từ 8h - 17h (T2-T7)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BẢN ĐỒ */}
      <section className="container pb-5">
        <div className="bg-white p-4 shadow rounded-4">
          <h4 className="text-warning fw-bold mb-3">🗺️ Bản đồ</h4>
          <div className="ratio ratio-16x9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.0939117207247!2d108.24263427593068!3d16.05857998463807!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314217e3937ccce7%3A0xa1fd3d30b2d228f5!2sFPT%20City%20Da%20Nang!5e0!3m2!1sen!2s!4v1650000000000!5m2!1sen!2s"
              allowFullScreen=""
              loading="lazy"
              title="FPT City Map"
            ></iframe>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
