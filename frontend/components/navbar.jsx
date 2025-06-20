import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

const Navbar = (role) => {
  const [activeMenu, setActiveMenu] = useState(null);
 console.log("Role:", role);
  const handleMouseEnter = (menu) => {
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li className="nav-item active">
          <Link to="/">TRANG CHỦ</Link>
        </li>
        <li className="nav-item">
          <Link to="/gioi-thieu">GIỚI THIỆU</Link>
        </li>

        <li
          className="nav-item dropdown"
          onMouseEnter={() => handleMouseEnter('dichvu')}
          onMouseLeave={handleMouseLeave}
        >
          <span>DỊCH VỤ ▾</span>
          {activeMenu === 'dichvu' && (
            <ul className="dropdown-menu">
              <li><Link to="/dich-vu/don-dep">Dọn dẹp</Link></li>
              <li><Link to="/dich-vu/sua-chua">Sửa chữa</Link></li>
              <li><Link to="/dichvu/baidoxe">Dịch vụ đăng ký bãi đỗ xe</Link></li>
              <li>
                <Link to="/dichvu/dangtin">Dịch vụ đăng tin</Link>
              </li>
               <li>
                <Link to="/quanlipostcustomer">Quản lí tin Customer</Link>
              </li>
            </ul>
          )}
        </li>

        <li
          className="nav-item dropdown"
          onMouseEnter={() => handleMouseEnter('hoadon')}
          onMouseLeave={handleMouseLeave}
        >
          <span>HÓA ĐƠN ▾</span>
          {activeMenu === 'hoadon' && (
            <ul className="dropdown-menu">
              <li><Link to="/hoa-don/thanh-toan">Thanh toán</Link></li>
              <li><Link to="/hoa-don/lich-su">Lịch sử</Link></li>
              <li><Link to="/hoa-don/yeu-cau">Gửi yêu cầu</Link></li>
            </ul>
          )}
        </li>

        <li
          className="nav-item dropdown"
          onMouseEnter={() => handleMouseEnter('canho')}
          onMouseLeave={handleMouseLeave}
        >
          <span>CĂN HỘ ▾</span>
          {activeMenu === 'canho' && (
            <ul className="dropdown-menu">
              <li><Link to="/can-ho/danh-sach">Danh sách</Link></li>
              <li><Link to="/can-ho/chi-tiet">Chi tiết</Link></li>
              <li><Link to="/can-ho/yeu-thich">Yêu thích</Link></li>
            </ul>
          )}
        </li>

        <li className="nav-item">
          <Link to="/blog">BLOG</Link>
        </li>
        <li className="nav-item">
          <Link to="/lien-he">LIÊN HỆ</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
