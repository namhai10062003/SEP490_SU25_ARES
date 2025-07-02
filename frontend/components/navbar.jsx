import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <ul className="navbar-nav flex-row ms-3">
    <li className="nav-item mx-3">
      <Link className="nav-link fw-bold link-dark" to="/">
        TRANG CHỦ
      </Link>
    </li>
    <li className="nav-item mx-3">
      <Link className="nav-link link-dark" to="/gioi-thieu">
        GIỚI THIỆU
      </Link>
    </li>
    <li className="nav-item dropdown mx-3">
      <span
        className="nav-link dropdown-toggle link-dark"
        id="dichvuDropdown"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{ cursor: "pointer" }}
      >
        DỊCH VỤ
      </span>
      <ul className="dropdown-menu" aria-labelledby="dichvuDropdown">
        <li>
          <Link className="dropdown-item" to="/dichvu/baidoxe">
            Dịch vụ đăng ký bãi đỗ xe
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to="/dichvu/dangtin">
            Dịch vụ đăng tin
          </Link>
        </li>
      </ul>
    </li>
    <li className="nav-item dropdown mx-3">
      <span
        className="nav-link dropdown-toggle link-dark"
        id="hoadonDropdown"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{ cursor: "pointer" }}
      >
        HÓA ĐƠN
      </span>
      <ul className="dropdown-menu" aria-labelledby="hoadonDropdown">
        <li>
          <Link className="dropdown-item" to="/hoa-don/thanh-toan">
            Thanh toán
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to="/hoa-don/lich-su">
            Lịch sử
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to="/hoa-don/yeu-cau">
            Gửi yêu cầu
          </Link>
        </li>
      </ul>
    </li>
    <li className="nav-item dropdown mx-3">
      <span
        className="nav-link dropdown-toggle link-dark"
        id="canhoDropdown"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{ cursor: "pointer" }}
      >
        CĂN HỘ
      </span>
      <ul className="dropdown-menu" aria-labelledby="canhoDropdown">
        <li>
          <Link className="dropdown-item" to="/canho/nhaukhau">
            Danh sách nhân khẩu
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to="/can-ho/chi-tiet">
            Chi tiết
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to="/can-ho/yeu-thich">
            Yêu thích
          </Link>
        </li>
      </ul>
    </li>
    <li className="nav-item mx-3">
      <Link className="nav-link link-dark" to="/blog">
        BLOG
      </Link>
    </li>
    <li className="nav-item mx-3">
      <Link className="nav-link link-dark" to="/lien-he">
        LIÊN HỆ
      </Link>
    </li>
  </ul>
);

export default Navbar;