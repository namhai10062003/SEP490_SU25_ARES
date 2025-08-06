import React from "react";
import { Link, useLocation } from "react-router-dom";
import ProtectedLink from "../components/ProtectedLink";

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => currentPath === path;
  const isSubPath = (basePath) => currentPath.startsWith(basePath);

  const getNavClass = (path) =>
    `nav-link px-3 py-2 rounded fw-bold ${
      isActive(path) ? "text-primary bg-light shadow-sm" : "text-dark"
    }`;
  
  const getDropdownClass = (basePath) =>
    `nav-link dropdown-toggle px-3 py-2 rounded fw-bold ${
      isSubPath(basePath) ? "text-primary bg-light shadow-sm" : "text-dark"
    }`;

  return (
    <ul className="navbar-nav flex-row ms-3">
      <li className="nav-item mx-2">
      <ProtectedLink className={getNavClass("/")} to="/">
  TRANG CHỦ
</ProtectedLink>
      </li>
      <li className="nav-item mx-2">
        <Link className={getNavClass("/gioi-thieu")} to="/gioi-thieu">
          GIỚI THIỆU
        </Link>
      </li>

      {/* DỊCH VỤ */}
      <li className="nav-item dropdown mx-2">
        <span
          className={getDropdownClass("/dichvu")}
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
            <ProtectedLink className="dropdown-item" to="/dichvu/baidoxe">
              Đăng ký bãi đỗ xe
            </ProtectedLink>
          </li>
          <li>
            <ProtectedLink className="dropdown-item" to="/dichvu/dangtin">
              Dịch vụ đăng tin
            </ProtectedLink>
          </li>
        </ul>
      </li>

      {/* CĂN HỘ */}
      <li className="nav-item dropdown mx-2">
        <span
          className={getDropdownClass("/canho")}
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
            <ProtectedLink className="dropdown-item" to="/canho/nhaukhau">
              Nhân khẩu
            </ProtectedLink>
          </li>
          <li>
            <ProtectedLink className="dropdown-item" to="/residence-declaration/list">
              Tạm trú tạm vắng
            </ProtectedLink>
          </li>
          <li>
            <ProtectedLink className="dropdown-item" to="/canho/liked-posts">
              Yêu thích
            </ProtectedLink>
          </li>
        </ul>
      </li>

      <li className="nav-item mx-2">
        <Link className={getNavClass("/blog")} to="/blog">
          BLOG
        </Link>
      </li>
      <li className="nav-item mx-2">
        <Link className={getNavClass("/contact")} to="/contact">
          LIÊN HỆ
        </Link>
      </li>
    </ul>
  );
};

export default Navbar;
