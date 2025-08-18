import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const StaffNavbar = ({ children }) => {
  const location = useLocation();
  
  // khai bao quan li cu dan
  const isResidentActive =
    location.pathname === "/staff-resident-register" ||
    location.pathname === "/staff-resident-verification" ||
    location.pathname === "/staff-resident/history";
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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: 0,
          boxShadow: '0 6px 24px 0 rgba(33,40,50,0.18)',
          minWidth: 240,
          maxWidth: 240,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          padding: '1rem 0.75rem',
          borderBottom: '2px solid #ffc107',
          background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
        }}>
          <h2 style={{
            fontWeight: 'bold',
            marginBottom: 0,
            color: '#ffc107',
            textAlign: 'center',
            letterSpacing: 1
          }}>
            BẢN QUẢN LÝ
          </h2>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul style={{
            listStyle: 'none',
            padding: '0.75rem 0.5rem',
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <li>
              <Link
                to="/staff-dashboard"
                style={{
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  background: location.pathname === "/staff-dashboard" ? "white" : "transparent",
                  color: location.pathname === "/staff-dashboard" ? "#007bff" : "white",
                  fontWeight: location.pathname === "/staff-dashboard" ? 'bold' : 'normal',
                  boxShadow: location.pathname === "/staff-dashboard" ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Dashboard
              </Link>
            </li>

            {/* Dropdown bãi đỗ xe */}
            <li>
              <div
                style={{
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  border: 'none',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: isParkingActive ? "white" : "transparent",
                  color: isParkingActive ? "#007bff" : "white",
                  fontWeight: isParkingActive ? 600 : 400,
                  boxShadow: isParkingActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
                onClick={() => setShowParkingSub((v) => !v)}
              >
                <span>Quản Lý Bãi Đỗ Xe</span>
                <span style={{ marginLeft: 'auto' }}>{showParkingSub ? "▲" : "▼"}</span>
              </div>
              <div
                style={{
                  display: showParkingSub ? 'block' : 'none',
                  marginLeft: '0.5rem',
                  borderLeft: '2px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.2s'
                }}
              >
                <ul style={{
                  listStyle: 'none',
                  padding: '0.25rem 0 0 0.75rem',
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <li>
                    <Link
                      to="/staff-parkinglot-list"
                      style={{
                        textDecoration: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        background: location.pathname === "/staff-parkinglot-list" ? "white" : "transparent",
                        color: location.pathname === "/staff-parkinglot-list" ? "#007bff" : "white",
                        fontWeight: location.pathname === "/staff-parkinglot-list" ? 'bold' : 'normal',
                        boxShadow: location.pathname === "/staff-parkinglot-list" ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Danh Sách Bãi Đỗ Xe
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/staff-manage-parkinglot"
                      style={{
                        textDecoration: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        background: location.pathname === "/staff-manage-parkinglot" ? "white" : "transparent",
                        color: location.pathname === "/staff-manage-parkinglot" ? "#007bff" : "white",
                        fontWeight: location.pathname === "/staff-manage-parkinglot" ? 'bold' : 'normal',
                        boxShadow: location.pathname === "/staff-manage-parkinglot" ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Quản Lý Yêu Cầu Gửi Xe
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            {/* Dropdown chi phí */}
            <li>
              <div
                style={{
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  border: 'none',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: isExpenseActive ? "white" : "transparent",
                  color: isExpenseActive ? "#007bff" : "white",
                  fontWeight: isExpenseActive ? 600 : 400,
                  boxShadow: isExpenseActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
                onClick={() => setShowExpenseSub((v) => !v)}
              >
                <span>Quản Lý Chi Phí</span>
                <span style={{ marginLeft: 'auto' }}>{showExpenseSub ? "▲" : "▼"}</span>
              </div>
              <div
                style={{
                  display: showExpenseSub ? 'block' : 'none',
                  marginLeft: '0.5rem',
                  borderLeft: '2px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.2s'
                }}
              >
                <ul style={{
                  listStyle: 'none',
                  padding: '0.25rem 0 0 0.75rem',
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <li>
                    <Link
                      to="/staff-expenses"
                      style={{
                        textDecoration: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        background: location.pathname === "/staff-expenses" ? "white" : "transparent",
                        color: location.pathname === "/staff-expenses" ? "#007bff" : "white",
                        fontWeight: location.pathname === "/staff-expenses" ? 'bold' : 'normal',
                        boxShadow: location.pathname === "/staff-expenses" ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Tổng Hợp Chi Phí
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/staff-water-data-upload"
                      style={{
                        textDecoration: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        background: location.pathname === "/staff-water-data-upload" ? "white" : "transparent",
                        color: location.pathname === "/staff-water-data-upload" ? "#007bff" : "white",
                        fontWeight: location.pathname === "/staff-water-data-upload" ? 'bold' : 'normal',
                        boxShadow: location.pathname === "/staff-water-data-upload" ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Quản Lý Chi Phí Nước
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            {/* Other menu items */}
            <li>
              <Link
                to="/staff-resident-verify"
                style={{
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  background: location.pathname === "/staff-resident-verify" ? "white" : "transparent",
                  color: location.pathname === "/staff-resident-verify" ? "#007bff" : "white",
                  fontWeight: location.pathname === "/staff-resident-verify" ? 'bold' : 'normal',
                  boxShadow: location.pathname === "/staff-resident-verify" ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Quản Lý Nhân Khẩu
              </Link>
            </li>

            <li>
              <Link
                to="/staff-residence-decration"
                style={{
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  background: location.pathname === "/staff-residence-decration" ? "white" : "transparent",
                  color: location.pathname === "/staff-residence-decration" ? "#007bff" : "white",
                  fontWeight: location.pathname === "/staff-residence-decration" ? 'bold' : 'normal',
                  boxShadow: location.pathname === "/staff-residence-decration" ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Quản Lý Tạm Trú Tạm Vắng
              </Link>
            </li>

            {/* Dropdown cư dân */}
            <li>
              <div
                style={{
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  border: 'none',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: isResidentActive ? "white" : "transparent",
                  color: isResidentActive ? "#007bff" : "white",
                  fontWeight: isResidentActive ? 600 : 400,
                  boxShadow: isResidentActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
                onClick={() => setShowResidentSub((v) => !v)}
              >
                <span>Quản Lý Cư Dân</span>
                <span style={{ marginLeft: 'auto' }}>{showResidentSub ? "▲" : "▼"}</span>
              </div>
              <div
                style={{
                  display: showResidentSub ? 'block' : 'none',
                  marginLeft: '0.5rem',
                  borderLeft: '2px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.2s'
                }}
              >
                <ul style={{
                  listStyle: 'none',
                  padding: '0.25rem 0 0 0.75rem',
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <li>
                    <Link
                      to="/staff-resident-register"
                      style={{
                        textDecoration: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        background: location.pathname === "/staff-resident-register" ? "white" : "transparent",
                        color: location.pathname === "/staff-resident-register" ? "#007bff" : "white",
                        fontWeight: location.pathname === "/staff-resident-register" ? 'bold' : 'normal',
                        boxShadow: location.pathname === "/staff-resident-register" ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Xác Nhận Cư Dân
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/staff-resident-verification"
                      style={{
                        textDecoration: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        background: location.pathname === "/staff-resident-verification" ? "white" : "transparent",
                        color: location.pathname === "/staff-resident-verification" ? "#007bff" : "white",
                        fontWeight: location.pathname === "/staff-resident-verification" ? 'bold' : 'normal',
                        boxShadow: location.pathname === "/staff-resident-verification" ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Quản Lý Danh Sách Cư Dân
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/staff-resident/history"
                      style={{
                        textDecoration: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        background: location.pathname === "/staff-resident/history" ? "white" : "transparent",
                        color: location.pathname === "/staff-resident/history" ? "#007bff" : "white",
                        fontWeight: location.pathname === "/staff-resident/history" ? 'bold' : 'normal',
                        boxShadow: location.pathname === "/staff-resident/history" ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Lịch Sử Xác Nhận Cư Dân
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li style={{ marginTop: '1rem' }}>
              <Link
                to="/staff-changePassWord"
                style={{
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'white',
                  background: 'rgba(255,255,255,0.04)',
                  transition: 'all 0.15s',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <span>•</span>
                <span style={{ marginLeft: '0.5rem' }}>Đổi Mật Khẩu</span>
              </Link>
            </li>

            <li style={{ marginTop: '0.75rem' }}>
              <button
                style={{
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'white',
                  background: 'rgba(255,255,255,0.07)',
                  transition: 'all 0.15s',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%'
                }}
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
              >
                <span>Đăng Xuất</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
      }}>
        {children}
      </main>
    </div>
  );
};

export default StaffNavbar;