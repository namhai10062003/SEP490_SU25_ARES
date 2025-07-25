import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis,
  YAxis
} from 'recharts';
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

  const token = localStorage.getItem('token');
  let userName = 'Người dùng';
  if (token) {
    try {
      userName = jwtDecode(token)?.name || userName;
    } catch (e) {
      console.error('Invalid token', e);
    }
  }

  useEffect(() => {
    const fetchAllStats = async () => {
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
      <ToastContainer />
      <StaffNavbar />
      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Dashboard</h2>
          <div className="d-flex align-items-center gap-3">
            <input type="text" placeholder="Tìm kiếm..." className="form-control rounded-pill" style={{ width: 250 }} />
            <span className="fw-bold text-primary">{userName}</span>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {cards.map((c, i) => (
            <div key={i} className="col-12 col-md-6 col-lg-3">
              <div className={`card border-0 shadow h-100`}>
                <div className={`card-body text-center border-start border-5 border-${c.color}`}>
                  <div className="text-secondary mb-2">{c.title}</div>
                  <div className="text-start">
                    {c.lines.map((l, j) => (<div key={j}>{l}</div>))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row">
  <h4 className="fw-bold mb-3">Biểu đồ thống kê</h4>

  {/* Pie Chart: Đăng ký gửi xe */}
  <div className="col-md-6 col-lg-3 mb-4">
    <h6 className="text-center">Gửi xe</h6>
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={[
            { name: 'Đã duyệt', value: stats.parking.approved },
            { name: 'Chờ duyệt', value: stats.parking.pending },
            { name: 'Từ chối', value: stats.parking.rejected }
          ]}
          dataKey="value"
          outerRadius={80}
          label
        >
          <Cell fill="#00C49F" />
          <Cell fill="#FFBB28" />
          <Cell fill="#FF4D4F" />
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>

  {/* Pie Chart: Hóa đơn */}
  <div className="col-md-6 col-lg-3 mb-4">
    <h6 className="text-center">Hóa đơn</h6>
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={[
            { name: 'Đã thanh toán', value: stats.fees.paid },
            { name: 'Chưa thanh toán', value: stats.fees.unpaid }
          ]}
          dataKey="value"
          outerRadius={80}
          label
        >
          <Cell fill="#00C49F" />
          <Cell fill="#FF4D4F" />
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>

  {/* Pie Chart: Cư dân */}
  <div className="col-md-6 col-lg-3 mb-4">
    <h6 className="text-center">Cư dân</h6>
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={[
            { name: 'Đã xác minh', value: stats.residents.verifiedResidents },
            { name: 'Từ chối', value: stats.residents.rejectedResidents }
          ]}
          dataKey="value"
          outerRadius={80}
          label
        >
          <Cell fill="#00C49F" />
          <Cell fill="#FF4D4F" />
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>

  {/* Pie Chart: Xác minh cư dân */}
  <div className="col-md-6 col-lg-3 mb-4">
    <h6 className="text-center">Xác minh cư dân</h6>
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={[
            { name: 'Đã duyệt', value: stats.verifications.approved },
            { name: 'Chờ duyệt', value: stats.verifications.pending },
            { name: 'Từ chối', value: stats.verifications.rejected }
          ]}
          dataKey="value"
          outerRadius={80}
          label
        >
          <Cell fill="#00C49F" />
          <Cell fill="#FFBB28" />
          <Cell fill="#FF4D4F" />
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>
<div className="mt-5">
  <h4 className="fw-bold mb-3">Doanh thu theo tháng</h4>
  <ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={monthlyRevenue.map(item => ({
      month: item.month,
      revenue: item.paid + item.unpaid
    }))}
    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
  >
    <Tooltip />
    <Legend />
    <XAxis dataKey="month" />
    <YAxis />
    <Bar dataKey="revenue" fill="#007bff" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
</div>

      </main>
      
    </div>
  );
};

export default StaffDashboard;
