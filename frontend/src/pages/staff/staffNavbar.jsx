import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const StaffNavbar = () => {
    const location = useLocation();
    const isParkingActive =
        location.pathname === "/staff-parkinglot-list" ||
        location.pathname === "/staff-manage-parkinglot";
    const [showParkingSub, setShowParkingSub] = useState(isParkingActive);

    useEffect(() => {
        if (isParkingActive) setShowParkingSub(true);
    }, [isParkingActive]);

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
            <div className="py-4 px-3 border-bottom border-2 border-warning bg-gradient">
                <h2 className="fw-bold mb-0 text-warning text-center" style={{ letterSpacing: 1 }}>
                    BẢN QUẢN LÝ
                </h2>
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
                    <li className="nav-item">
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
                    </li>
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
                            <span>Quản lý bãi đỗ xe</span>
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
                                        Danh sách bãi đỗ xe
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
                                        Quản lý yêu cầu gửi xe
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/staff-expenses"
                            className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-expenses"
                                ? "active bg-white text-primary fw-bold shadow-sm"
                                : "text-white"
                                }`}
                            style={{
                                background:
                                    location.pathname === "/staff-expenses"
                                        ? "white"
                                        : "transparent",
                            }}
                        >
                            Quản lý chi phí
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
                            Quản lý người dùng
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/staff-revenue"
                            className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${location.pathname === "/staff-revenue"
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
                    </li>
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
                            Quản lý nhân khẩu
                        </Link>
                    </li>
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
                            Quản lý đăng ký người ở
                        </Link>
                    </li>
                    <li className="nav-item mt-3">
                        <Link
                            to="/login"
                            className="nav-link rounded-3 px-3 py-2 d-flex align-items-center text-white"
                            style={{
                                background: "rgba(255,255,255,0.07)",
                                transition: "all .15s",
                            }}
                        >
                            <span className="material-icons me-2" style={{ fontSize: 20 }}>
                                Đăng Xuất
                            </span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default StaffNavbar;