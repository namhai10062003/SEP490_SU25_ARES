import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const StaffNavbar = () => {
  const location = useLocation();
  // khai bao quan li cu dan
  const isResidentActive =
    location.pathname === "/staff-resident-register" ||
    location.pathname === "/staff-resident-verification" ||
    location.pathname === "/staff-resident/history";
    location.pathname === "/staff-changePassWord";
    ;

  const [showResidentSub, setShowResidentSub] = useState(isResidentActive);
  const isParkingActive =
    location.pathname === "/staff-parkinglot-list" ||
    location.pathname === "/staff-manage-parkinglot";
  const [showParkingSub, setShowParkingSub] = useState(isParkingActive);
  const isExpenseActive =
    location.pathname === "/staff-expenses" ||
    location.pathname === "/staff-water-data-upload";
  const [showExpenseSub, setShowExpenseSub] = useState(isExpenseActive);

  useEffect(() => {
    if (isParkingActive) setShowParkingSub(true);
    if (isExpenseActive) setShowExpenseSub(true);
  }, [isParkingActive, isExpenseActive]);

  return (
    <aside
      className="bg-primary text-white p-0 shadow-lg d-flex flex-column"
      style={{
        minWidth: 240,
        minHeight: "100vh",
        boxShadow: "0 6px 24px 0 rgba(33,40,50,0.18)",
        zIndex: 100,
      }}
    >
      <div className="py-3 px-3 border-bottom border-2 border-warning bg-gradient">
  <h4
    className="fw-bold mb-0 text-warning text-center"
    style={{ letterSpacing: 1, fontSize: "1.25rem" }} // đồng bộ với h2 trong main
  >
    BẢN QUẢN LÝ
  </h4>
</div>

      <nav className="flex-grow-1">
        <ul className="nav flex-column gap-1 px-2 py-3">
          <li className="nav-item">
            <Link
              to="/staff-dashboard"
              className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-dashboard"
                  ? "active bg-white text-primary fw-bold shadow-sm"
                  : "text-white"
                }`}
              style={{
                background:
                  location.pathname === "/staff-dashboard"
                    ? "white"
                    : "transparent",
              }}
            >
              Dashboard
            </Link>
          </li>
          {/* <li className="nav-item">
                        <Link
                            to="/staff-posts"
                            className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-posts"
                                ? "active bg-white text-primary fw-bold shadow-sm"
                                : "text-white"
                                }`}
                            style={{
                                background:
                                    location.pathname === "/staff-posts"
                                        ? "white"
                                        : "transparent",
                            }}
                        >
                            Quản lý bài post
                        </Link>
                    </li> */}
          {/* Dropdown bãi đỗ xe */}
          <li className="nav-item">
            {/* Không dùng nav-link cho div cha để tránh lỗi mất label */}
            <div
              className={`rounded-3 px-3 py-2 d-flex align-items-center w-100 border-0 ${isParkingActive
                  ? "bg-white text-primary fw-bold shadow-sm"
                  : "text-white"
                }`}
              style={{
                cursor: "pointer",
                userSelect: "none",
                background: isParkingActive ? "white" : "transparent",
                fontWeight: isParkingActive ? 600 : 400,
              }}
              onClick={() => setShowParkingSub((v) => !v)}
              aria-expanded={showParkingSub}
            >
              <span>Quản Lý Bãi Đỗ Xe</span>
              <span className="ms-auto">{showParkingSub ? "▲" : "▼"}</span>
            </div>
            <div
              className={`collapse${showParkingSub ? " show" : ""}`}
              style={{
                marginLeft: "0.5rem",
                borderLeft: "2px solid #fff3",
                transition: "all .2s",
              }}
            >
              <ul className="nav flex-column ps-3 mt-1">
                <li className="nav-item">
                  <Link
                    to="/staff-parkinglot-list"
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-parkinglot-list"
                        ? "active bg-white text-primary fw-bold shadow-sm"
                        : "text-white"
                      }`}
                    style={{
                      background:
                        location.pathname === "/staff-parkinglot-list"
                          ? "white"
                          : "transparent",
                    }}
                  >
                    Danh Sách Bãi Đỗ Xe
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/staff-manage-parkinglot"
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-manage-parkinglot"
                        ? "active bg-white text-primary fw-bold shadow-sm"
                        : "text-white"
                      }`}
                    style={{
                      background:
                        location.pathname === "/staff-manage-parkinglot"
                          ? "white"
                          : "transparent",
                    }}
                  >
                    Quản Lý Yêu Cầu Gửi Xe
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          <li className="nav-item">
            <div
              className={`rounded-3 px-3 py-2 d-flex align-items-center w-100 border-0 ${location.pathname === "/staff-expenses" ||
                  location.pathname === "/staff-water-data-upload"
                  ? "bg-white text-primary fw-bold shadow-sm"
                  : "text-white"
                }`}
              style={{
                cursor: "pointer",
                userSelect: "none",
                background:
                  location.pathname === "/staff-expenses" ||
                    location.pathname === "/staff-water-data-upload"
                    ? "white"
                    : "transparent",
                fontWeight:
                  location.pathname === "/staff-expenses" ||
                    location.pathname === "/staff-water-data-upload"
                    ? 600
                    : 400,
              }}
              onClick={() => setShowExpenseSub((v) => !v)}
              aria-expanded={showExpenseSub}
            >
              <span>Quản Lý Chi Phí</span>
              <span className="ms-auto">{showExpenseSub ? "▲" : "▼"}</span>
            </div>
            <div
              className={`collapse${showExpenseSub ? " show" : ""}`}
              style={{
                marginLeft: "0.5rem",
                borderLeft: "2px solid #fff3",
                transition: "all .2s",
              }}
            >
              <ul className="nav flex-column ps-3 mt-1">
                <li className="nav-item">
                  <Link
                    to="/staff-expenses"
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-expenses"
                        ? "active bg-white text-primary fw-bold shadow-sm"
                        : "text-white"
                      }`}
                  >
                    Tổng Hợp Chi Phí
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/staff-water-data-upload"
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-water-data-upload"
                        ? "active bg-white text-primary fw-bold shadow-sm"
                        : "text-white"
                      }`}
                  >
                    Quản Lý Chi Phí Nước
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* <li className="nav-item">
            <Link
              to="/staff-revenue"
              className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${
                location.pathname === "/staff-revenue"
                  ? "active bg-white text-primary fw-bold shadow-sm"
                  : "text-white"
              }`}
              style={{
                background:
                  location.pathname === "/staff-revenue"
                    ? "white"
                    : "transparent",
              }}
            >
              Quản lý doanh thu
            </Link>
          </li> */}
          <li className="nav-item">
            <Link
              to="/staff-resident-verify"
              className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-resident-verify"
                  ? "active bg-white text-primary fw-bold shadow-sm"
                  : "text-white"
                }`}
              style={{
                background:
                  location.pathname === "/staff-resident-verify"
                    ? "white"
                    : "transparent",
              }}
            >
              Quản Lý Nhân Khẩu
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/staff-residence-decration"
              className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-residence-decration"
                  ? "active bg-white text-primary fw-bold shadow-sm"
                  : "text-white"
                }`}
              style={{
                background:
                  location.pathname === "/staff-residence-decration"
                    ? "white"
                    : "transparent",
              }}
            >
              Quản Lý Tạm Trú Tạm Vắng
            </Link>
          </li>
          {/* <li className="nav-item">
            <Link
              to="/staff-citizenlist"
              className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-citizenlist"
                  ? "active bg-white text-primary fw-bold shadow-sm"
                  : "text-white"
                }`}
              style={{
                background:
                  location.pathname === "/staff-citizenlist"
                    ? "white"
                    : "transparent",
              }}
            >
              Danh sách Nhân Khẩu
            </Link>
          </li> */}
          {/* Dropdown quản lý cư dân */}
          <li className="nav-item">
            {/* Không dùng nav-link cho div cha để tránh lỗi mất label */}
            <div
              className={`rounded-3 px-3 py-2 d-flex align-items-center w-100 border-0 ${isResidentActive
                  ? "bg-white text-primary fw-bold shadow-sm"
                  : "text-white"
                }`}
              style={{
                cursor: "pointer",
                userSelect: "none",
                background: isResidentActive ? "white" : "transparent",
                fontWeight: isResidentActive ? 600 : 400,
              }}
              onClick={() => setShowResidentSub((v) => !v)}
              aria-expanded={showResidentSub}
            >
              <span>Quản Lý Cư Dân</span>
              <span className="ms-auto">{showResidentSub ? "▲" : "▼"}</span>
            </div>
            <div
              className={`collapse${showResidentSub ? " show" : ""}`}
              style={{
                marginLeft: "0.5rem",
                borderLeft: "2px solid #fff3",
                transition: "all .2s",
              }}
            >
              <ul className="nav flex-column ps-3 mt-1">
                <li className="nav-item">
                  <Link
                    to="/staff-resident-register"
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-resident-register"
                        ? "active bg-white text-primary fw-bold shadow-sm"
                        : "text-white"
                      }`}
                    style={{
                      background:
                        location.pathname === "/staff-resident-register"
                          ? "white"
                          : "transparent",
                    }}
                  >
                    Xác Nhận Cư Dân
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/staff-resident-verification"
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-resident-verification"
                        ? "active bg-white text-primary fw-bold shadow-sm"
                        : "text-white"
                      }`}
                    style={{
                      background:
                        location.pathname === "/staff-resident-verification"
                          ? "white"
                          : "transparent",
                    }}
                  >
                    Quản Lý Danh Sách Cư Dân
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/staff-resident/history"
                    className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-resident/history"
                        ? "active bg-white text-primary fw-bold shadow-sm"
                        : "text-white"
                      }`} 
                    style={{
                      background:
                        location.pathname === "/staff-resident/history"
                          ? "white"
                          : "transparent",
                    }}
                  >
                    Lịch Sử Xác Nhận Cư Dân
                  </Link>
                </li>
              </ul>
            </div>
            <li className="nav-item">
            <Link
              to="/staff-changePassWord"
              className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${
                location.pathname === "/staff-changePassWord"
                  ? "active bg-white text-primary fw-bold shadow-sm"
                  : "text-white"
              }`}
              style={{
                background:
                  location.pathname === "/staff-changePassWord"
                    ? "white"
                    : "transparent",
              }}
            >
              Đổi mật khẩu
            </Link>
          </li>
          </li>



          <li className="nav-item mt-3">
            <button
              className="nav-link rounded-3 px-3 py-2 d-flex align-items-center text-white bg-transparent border-0"
              style={{
                background: "rgba(255,255,255,0.07)",
                transition: "all .15s",
              }}
              onClick={() => {
                localStorage.removeItem("token"); // Xoá token
                window.location.href = "/login"; // Redirect
              }}
            >
              <span className="material-icons me-2" style={{ fontSize: 20 }}>
                Đăng Xuất
              </span>
              {/* <span>Đăng Xuất</span> */}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default StaffNavbar;
