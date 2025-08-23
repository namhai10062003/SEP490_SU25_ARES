import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis,
  YAxis
} from 'recharts';
import LoadingModal from '../../../components/loadingModal';
import socket from '../../server/socket';
import StaffNavbar from './staffNavbar';
const StaffDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    parking: { total: 0, pending: 0, approved: 0, rejected: 0 },
    fees: { total: 0, paid: 0, unpaid: 0 },
    residents: { verifiedResidents: 0, rejectedResidents: 0 },
    verifications: { total: 0, pending: 0, approved: 0, rejected: 0 }
    
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation(); // 🔹 Lấy userName từ token
   // 🔹 Lấy userName từ token (an toàn)
   const token = localStorage.getItem("token");
   let userName = "Người dùng";
   if (token) {
     try {
       userName = jwtDecode(token)?.name || "Người dùng";
     } catch (err) {
       console.error("Invalid token:", err);
     }
   }
 
   // 🔹 Hiện toast nếu đăng nhập thành công
   useEffect(() => {
     if (location.state?.showToast) {
      //  toast.success("Đăng nhập thành công!");
       // Xóa state để tránh hiện lại khi F5
       navigate(location.pathname, { replace: true, state: {} });
     }
   }, [location, navigate]);

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoading(true);
      try {
        const [parkingRes, feesRes, residentsRes, verifsRes, revenueRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/staff-dashboard/staff/count-by-status`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/staff-dashboard/staff/fees/paid`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/staff-dashboard/staff/residents/status`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/staff-dashboard/staff/statistics`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/staff-dashboard/staff/revenue/monthly`)
        ]);

        // ✅ Lấy đúng data từ res.data.data
        const parkingData = parkingRes.data|| {};
        const feesData = feesRes.data?.data || {};
        const residentsData = residentsRes.data || {};
        const verifsData = verifsRes.data?.data || {};
        const revenueData = revenueRes.data?.data || [];
        setMonthlyRevenue(revenueData);
        console.log("🚗 Parking API:", parkingData);
        console.log("💰 Fees API:", feesData);
        console.log("🧑‍🤝‍🧑 Residents API:", residentsData);
        console.log("📋 Verifications API:", verifsData);

        setStats({
          parking: parkingData,
          fees: feesData,
          residents: residentsData,
          verifications: verifsData
        });
      } catch (err) {
        console.error('❌ Lỗi khi lấy thống kê:', err);
        toast.error('Không thể tải thống kê, vui lòng thử lại sau.');
      }
      setLoading(false);
    };

    fetchAllStats();
  }, []);

  useEffect(() => {
    socket.on('staff:new-parking-request', data => {
      const { apartmentCode, owner, licensePlate, vehicleType } = data.registration;
      toast.info(`📢 Yêu cầu gửi xe mới: ${apartmentCode} - ${owner} (${licensePlate}, ${vehicleType})`, {
        onClick: () => navigate('/manage-parkinglot')
      });
    });

    socket.on('new-resident-registered', resident => {
      toast.info(`📋 Nhân khẩu mới: ${resident.fullName} – Căn hộ ${resident.apartmentCode}`, {
        onClick: () => navigate('/resident-verify')
      });
    });

    return () => {
      socket.off('staff:new-parking-request');
      socket.off('new-resident-registered');
    };
  }, [navigate]);

  const cards = [
    {
      title: 'Đăng ký gửi xe',
      lines: [
        `Tổng: ${stats.parking.total}`,
        `Chờ duyệt: ${stats.parking.pending}`,
        `Đã duyệt: ${stats.parking.approved}`,
        `Từ chối: ${stats.parking.rejected}`
      ],
      color: 'warning'
    },
    {
      title: 'Hóa đơn phí',
      lines: [
        `Tổng: ${stats.fees.total}`,
        `Đã thanh toán: ${stats.fees.paid}`,
        `Chưa thanh toán: ${stats.fees.unpaid}`
      ],
      color: 'success'
    },
    {
      title: 'Cư dân',
      lines: [
        `Đã xác minh: ${stats.residents.verifiedResidents}`,
        `Bị từ chối: ${stats.residents.rejectedResidents}`
      ],
      color: 'info'
    },
    {
      title: 'Xác minh cư dân',
      lines: [
        `Tổng Yêu cầu: ${stats.verifications.total}`,
        `Chờ duyệt: ${stats.verifications.pending}`,
        `Đã duyệt: ${stats.verifications.approved}`,
        `Từ chối: ${stats.verifications.rejected}`
      ],
      color: 'primary'
    }
  ];

  return (
<div className="d-flex min-vh-100 bg-light">
  <StaffNavbar />

  <main className="flex-grow-1 p-4" style={{ minWidth: 0 }}>
    <div className="container-fluid">

      {/* Header */}
      <div className="row align-items-center mb-4 bg-white rounded-4 shadow-sm p-3 sticky-top" style={{ zIndex: 10 }}>
        <div className="col">
          <h2 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2">
            <i className="bi bi-bar-chart-line"></i> Dashboard
          </h2>
        </div>
        <div className="col-auto d-flex align-items-center gap-2">
          <i className="bi bi-person-circle fs-4 text-secondary"></i>
          <span className="fw-semibold">{userName}</span>
        </div>
      </div>

      {/* Cards Summary */}
      <div className="row g-4 mb-4">
        {cards.map((c, i) => (
          <div key={i} className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm h-100 p-4 d-flex flex-column justify-content-center"
              style={{
                transition: "all 0.3s ease",
                cursor: "pointer",
                background: "linear-gradient(135deg, #f9fafb, #ffffff)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 1rem 2rem rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "56px",
                    height: "56px",
                    background: `linear-gradient(135deg, var(--bs-${c.color}), rgba(var(--bs-${c.color}-rgb),0.7))`,
                    color: "white",
                    fontSize: "1.2rem",
                  }}
                >
                  <i className={`bi bi-${c.icon}`}></i>
                </div>
                <div>
                  <div className="fw-semibold small text-muted">{c.title}</div>
                  <div className="fw-bold fs-5 text-dark">{c.lines[0]}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <h5 className="fw-bold mb-3 text-primary">📊 Thống kê</h5>
      <div className="row g-4 mb-4">
        {[
          { title: "Gửi xe", data: [
              { name: "Đã duyệt", value: stats.parking.approved },
              { name: "Chờ duyệt", value: stats.parking.pending },
              { name: "Từ chối", value: stats.parking.rejected },
            ], colors: ["#22c55e", "#fbbf24", "#ef4444"] },
          { title: "Hóa đơn", data: [
              { name: "Đã thanh toán", value: stats.fees.paid },
              { name: "Chưa thanh toán", value: stats.fees.unpaid },
            ], colors: ["#3b82f6", "#ef4444"] },
          { title: "Cư dân", data: [
              { name: "Đã xác minh", value: stats.residents.verifiedResidents },
              { name: "Từ chối", value: stats.residents.rejectedResidents },
            ], colors: ["#06b6d4", "#ef4444"] },
          { title: "Xác minh cư dân", data: [
              { name: "Đã duyệt", value: stats.verifications.approved },
              { name: "Chờ duyệt", value: stats.verifications.pending },
              { name: "Từ chối", value: stats.verifications.rejected },
            ], colors: ["#22c55e", "#fbbf24", "#ef4444"] },
        ].map((chart, i) => (
          <div key={i} className="col-12 col-md-6">
            <div className="card border-0 rounded-4 shadow-sm p-4 h-100">
              <h6 className="fw-semibold mb-3">{chart.title}</h6>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chart.data}
                    dataKey="value"
                    innerRadius={45}
                    outerRadius={75}
                    label
                  >
                    {chart.colors.map((c, idx) => (
                      <Cell key={idx} fill={c} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue */}
      <div className="card border-0 rounded-4 shadow-sm p-4">
        <h5 className="fw-bold mb-3 text-primary">💰 Doanh thu theo tháng</h5>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={monthlyRevenue.map(item => ({
              month: item.month,
              revenue: item.paid + item.unpaid
            }))}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
          >
            <XAxis dataKey="month" />
            <YAxis
              domain={[0, (dataMax) => Math.ceil(dataMax / 100000) * 100000]} 
              tickCount={6}
              tickFormatter={(value) => (value >= 1_000 ? (value / 1_000) + "K" : value)}
            />
            <Tooltip formatter={(value) => `${value.toLocaleString("vi-VN")} VNĐ`} />
            <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </main>

  {/* Loading Modal */}
  {loading && <LoadingModal />}
</div>


  );
};

export default StaffDashboard;
