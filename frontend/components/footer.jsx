import React from "react";
import {
    FaFacebookF,
    FaInstagram,
    FaTiktok,
    FaCommentDots,
} from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-dark text-light py-5 mt-5">
            <div className="container">
                <div className="row">
                    {/* Liên hệ */}
                    <div className="col-md-4 mb-4">
                        <h4 className="fw-bold mb-3 text-warning">Liên hệ</h4>
                        <p>FPT City</p>
                        <p>TP. Đà Nẵng</p>
                        <p>Email: SupportFPTCity@gmail.com</p>
                        <p>Phone: (+84) 833-48-2255</p>
                    </div>

                    {/* Liên kết nhanh */}
                    <div className="col-md-4 mb-4">
                        <h4 className="fw-bold mb-3 text-warning">Liên kết nhanh</h4>
                        <ul className="list-unstyled">
                            <li><a href="/" className="text-light text-decoration-none">Trang chủ</a></li>
                            <li><a href="/blog" className="text-light text-decoration-none">Bài viết nổi bật</a></li>
                            <li><a href="/gioi-thieu" className="text-light text-decoration-none">Về chúng tôi</a></li>
                            <li><a href="#" className="text-light text-decoration-none">Liên hệ</a></li>
                        </ul>
                    </div>

                    {/* Kết nối */}
                    <div className="col-md-4 mb-4">
                        <h4 className="fw-bold mb-3 text-warning">Kết nối với chúng tôi</h4>
                        <div className="d-flex gap-3 mb-3">
                            <a
                                aria-label="Facebook"
                                href="https://www.facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-light fs-4"
                            >
                                <FaFacebookF />
                            </a>
                            <a
                                aria-label="Instagram"
                                href="https://www.instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-light fs-4"
                            >
                                <FaInstagram />
                            </a>
                            <a
                                aria-label="TikTok"
                                href="https://www.tiktok.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-light fs-4"
                            >
                                <FaTiktok />
                            </a>
                            <a
                                aria-label="Zalo"
                                href="https://zalo.me"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-light fs-4"
                            >
                                <FaCommentDots />
                            </a>
                        </div>
                        <h5 className="fw-bold">Hotline: +84 833 48 22 55</h5>
                    </div>
                </div>

                <div className="text-center mt-4 text-secondary small">
                    © {new Date().getFullYear()} Ares Apartment. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
