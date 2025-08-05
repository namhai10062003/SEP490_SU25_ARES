import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import AdminDashboard from "./adminDashboard";
import { getAllPosts } from "../../service/postService";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

// const PACKAGE_PRICES = {
//   VIP1: 10000,
//   VIP2: 20000,
//   VIP3: 30000,
//   normal: 0,
// };

export default function DashboardHome() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [stats, setStats] = useState({
    customers: 0,
    staffs: 0,
    apartments: 0,
    posts: 0,
    residentVerifications: 0,
    withdrawRequests: 0,
    reports: 0,
    contacts: 0,
    profiles: 0,
  });

  // const [revenueStats, setRevenueStats] = useState({
  //   postRevenue: 0,
  //   postRevenueYesterday: 0,
  //   apartmentRevenue: 0,
  //   contractRevenue: 0,
  //   totalRevenue: 0,
  //   totalRevenueYesterday: 0,
  // });

  // const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userChartData, setUserChartData] = useState(null);
  const [staffChartData, setStaffChartData] = useState(null);
  const [apartmentChartData, setApartmentChartData] = useState(null);
  const [postChartData, setPostChartData] = useState(null);
  const [residentVerificationChartData, setResidentVerificationChartData] = useState(null);
  const [withdrawRequestChartData, setWithdrawRequestChartData] = useState(null);
  const [reportChartData, setReportChartData] = useState(null);
  const [contactChartData, setContactChartData] = useState(null);
  const [profileChartData, setProfileChartData] = useState(null);

  const renderChange = (today, yesterday) => {
    const diff = today - yesterday;
    const percent = yesterday === 0 ? 100 : Math.round((diff / yesterday) * 100);
    if (diff > 0) {
      return <span className="text-success ms-2">▲ {percent}%</span>;
    } else if (diff < 0) {
      return <span className="text-danger ms-2">▼ {Math.abs(percent)}%</span>;
    } else {
      return <span className="text-muted ms-2">— 0%</span>;
    }
  };

  const [statsYesterday, setStatsYesterday] = useState({
    customers: 0,
    staffs: 0,
    apartments: 0,
    posts: 0,
    residentVerifications: 0,
    withdrawRequests: 0,
    reports: 0,
    contacts: 0,
    profile: 0,
  });

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;

    const getMonthlyCountStats = (dataList, getDateField) => {
      const stats = {};
      dataList.forEach((item) => {
        const date = getDateField(item);
        if (!date) return;
        const d = new Date(date);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        stats[key] = (stats[key] || 0) + 1;
      });
      return stats;
    };

    const createMonthlyChartData = (monthlyStats, labelName) => {
      const labels = Object.keys(monthlyStats).sort();
      return {
        labels,
        datasets: [
          {
            label: labelName,
            data: labels.map((key) => monthlyStats[key]),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      };
    };

    const fetchAllData = async () => {
      try {
        const urls = [
          "UsersList",
          "StaffsList",
          "ApartmentsList",
          "PostsList",
          "ResidentVerificationsList",
          "WithdrawRequestsList",
          "ReportsList",
          "ContactsList",
          "ProfilesList",
        ];

        const fetchCommonStats = await Promise.all(
          urls.map((url) => fetch(`${API_URL}/api/admin-dashboard/stats/${url}`).then((res) => res.json()))
        );

        setStats({
          customers: fetchCommonStats[0].total || 0,
          staffs: fetchCommonStats[1].total || 0,
          apartments: fetchCommonStats[2].total || 0,
          posts: fetchCommonStats[3].total || 0,
          residentVerifications: fetchCommonStats[4].total || 0,
          withdrawRequests: fetchCommonStats[5].total || 0,
          reports: fetchCommonStats[6].total || 0,
          contacts: fetchCommonStats[7].total || 0,
          profiles: fetchCommonStats[8].total || 0,
        });

        // const revenueSummaryRes = await fetch(`${API_URL}/api/admin-dashboard/stats/revenue-summary`);
        // const revenueSummaryData = await revenueSummaryRes.json();

        // setRevenueStats({
        //   postRevenue: revenueSummaryData.postRevenue || 0,
        //   apartmentRevenue: revenueSummaryData.apartmentRevenue || 0,
        //   contractRevenue: revenueSummaryData.contractRevenue || 0,
        //   totalRevenue: revenueSummaryData.totalRevenue || 0,
        //   postRevenueYesterday: revenueSummaryData.postRevenueYesterday || 0,
        //   totalRevenueYesterday: revenueSummaryData.totalRevenueYesterday || 0,
        // });

        // const revenueRes = await fetch(`${API_URL}/api/admin-dashboard/stats/RevenueMonthly?year=${selectedYear}`);
        // const revenueData = await revenueRes.json();
        // setMonthlyRevenue(revenueData.monthlyData || []);

        const postRes = await getAllPosts();
        const allPosts = postRes.data.data || [];
        // const paidPosts = allPosts.filter((p) => p.paymentStatus === "paid" && p.paymentDate);

        // const totalPostRevenue = paidPosts.reduce((sum, p) => sum + (PACKAGE_PRICES[p.postPackage?.type] || 0), 0);

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

        // const calcRevenue = (filterFn) =>
        //   paidPosts
        //     .filter((p) => filterFn(new Date(p.paymentDate)))
        //     .reduce((sum, p) => sum + (PACKAGE_PRICES[p.postPackage?.type] || 0), 0);

        // const apartmentRevenueToday = calcRevenue(
        //   (d) => isSameDay(d, today) && p.postPackage?.type === "VIP2"
        // );
        // const apartmentRevenueYesterday = calcRevenue(
        //   (d) => isSameDay(d, yesterday) && p.postPackage?.type === "VIP2"
        // );

        // const contractRevenueToday = calcRevenue(
        //   (d) => isSameDay(d, today) && p.postPackage?.type === "VIP3"
        // );
        // const contractRevenueYesterday = calcRevenue(
        //   (d) => isSameDay(d, yesterday) && p.postPackage?.type === "VIP3"
        // );


        // const todayRevenue = calcRevenue((d) => isSameDay(d, today));
        // const yesterdayRevenue = calcRevenue((d) => isSameDay(d, yesterday));

        // const apartmentRevenue = paidPosts
        //   .filter((p) => p.postPackage?.type === "VIP2")
        //   .reduce((sum, p) => sum + (PACKAGE_PRICES[p.postPackage?.type] || 0), 0);

        // const contractRevenue = paidPosts
        //   .filter((p) => p.postPackage?.type === "VIP3")
        //   .reduce((sum, p) => sum + (PACKAGE_PRICES[p.postPackage?.type] || 0), 0);

        // setRevenueStats((prev) => ({
        //   ...prev,
        //   postRevenue: totalPostRevenue,
        //   apartmentRevenue,
        //   contractRevenue,
        //   postRevenueYesterday: yesterdayRevenue,
        //   apartmentRevenueYesterday,
        //   contractRevenueYesterday,
        //   todayRevenue,
        //   yesterdayRevenue,
        //   totalRevenue: totalPostRevenue,
        //   totalRevenueYesterday: yesterdayRevenue,
        // }));


        const [staffsRes, apartmentsRes, residentRes, withdrawRes, reportsRes, contactsRes, profilesRes] = await Promise.all([
          fetch(`${API_URL}/api/admin-dashboard/get-all-staffs`).then((res) => res.json()),
          fetch(`${API_URL}/api/admin-dashboard/get-all-apartments`).then((res) => res.json()),
          fetch(`${API_URL}/api/admin-dashboard/get-all-resident-verifications`).then((res) => res.json()),
          fetch(`${API_URL}/api/admin-dashboard/get-all-withdraw-requests`).then((res) => res.json()),
          fetch(`${API_URL}/api/admin-dashboard/get-all-reports`).then((res) => res.json()),
          fetch(`${API_URL}/api/admin-dashboard/get-all-contacts`).then((res) => res.json()),
          fetch(`${API_URL}/api/admin-dashboard/get-all-profiles`).then((res) => res.json()),
        ]);

        setUserChartData(createMonthlyChartData(getMonthlyCountStats(allPosts, (u) => u.createdAt), "User mới"));
        setStaffChartData(createMonthlyChartData(getMonthlyCountStats(staffsRes.data || [], (s) => s.createdAt), "Staff mới"));
        setApartmentChartData(createMonthlyChartData(getMonthlyCountStats(apartmentsRes.data || [], (a) => a.createdAt), "Căn hộ mới"));
        setPostChartData(createMonthlyChartData(getMonthlyCountStats(allPosts, (p) => p.createdAt), "Bài đăng mới"));
        setResidentVerificationChartData(createMonthlyChartData(getMonthlyCountStats(residentRes.data || [], (r) => r.createdAt), "Xác nhận cư dân mới"));
        setWithdrawRequestChartData(createMonthlyChartData(getMonthlyCountStats(withdrawRes.data || [], (w) => w.createdAt), "Đơn rút tiền mới"));
        setReportChartData(createMonthlyChartData(getMonthlyCountStats(reportsRes.data || [], (r) => r.createdAt), "Báo cáo mới"));
        setContactChartData(createMonthlyChartData(getMonthlyCountStats(contactsRes.data || [], (c) => c.createdAt), "Liên hệ mới"));
        setProfileChartData(createMonthlyChartData(getMonthlyCountStats(profilesRes.data || [], (c) => c.createdAt), "Profile mới"));

        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi fetch dữ liệu:", err);
      }
    };

    fetchAllData();
  }, [selectedYear]);

  return (
    <AdminDashboard>
      <div className="container-fluid px-0">
        <h3 className="mb-4 fw-bold">Dashboard tổng hợp</h3>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          {/* Apartments */}
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">🏢 Tổng Apartment</h6>
                <div className="fs-2 fw-bold text-primary">
                  {stats.apartments}
                  {renderChange(stats.apartments, statsYesterday.apartments)}
                </div>
              </div>
            </div>
          </div>

          {/* Users */}
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">👥 Tổng User</h6>
                <div className="fs-2 fw-bold text-primary">
                  {stats.customers}
                  {renderChange(stats.customers, statsYesterday.customers)}
                </div>
              </div>
            </div>
          </div>

          {/* Staffs */}
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">🧑‍💼 Tổng Staff</h6>
                <div className="fs-2 fw-bold text-primary">
                  {stats.staffs}
                  {renderChange(stats.staffs, statsYesterday.staffs)}
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">📝 Tổng Bài Post</h6>
                <div className="fs-2 fw-bold text-primary">
                  {stats.posts}
                  {renderChange(stats.posts, statsYesterday.posts)}
                </div>
              </div>
            </div>
          </div>

          {/* Resident Verifications */}
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">✅ Đơn Xác Nhận Cư Dân</h6>
                <div className="fs-2 fw-bold text-primary">
                  {stats.residentVerifications}
                  {renderChange(stats.residentVerifications, statsYesterday.residentVerifications)}
                </div>
              </div>
            </div>
          </div>

          {/* Withdraw Requests */}
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">💸 Đơn Rút Tiền</h6>
                <div className="fs-2 fw-bold text-primary">
                  {stats.withdrawRequests}
                  {renderChange(stats.withdrawRequests, statsYesterday.withdrawRequests)}
                </div>
              </div>
            </div>
          </div>

          {/* Reports & Contacts */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">📣 Tổng Phản Hồi</h6>
                <div>
                  📝 Báo cáo: <span className="fw-bold text-primary">{stats.reports}</span>
                  {renderChange(stats.reports, statsYesterday.reports)}
                </div>
                <div>
                  📩 Liên hệ: <span className="fw-bold text-primary">{stats.contacts}</span>
                  {renderChange(stats.contacts, statsYesterday.contacts)}
                </div>
                <div>
                👥 Update Profile: <span className="fw-bold text-primary">{stats.profiles}</span>
                  {renderChange(stats.profiles, statsYesterday.profiles)}
                </div>
              </div>
            </div>
          </div>



          {/* <div className="col-12">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">💰 Doanh Thu Hiện Tại ($)</h6>
                <div className="row">
                  <div className="col-md-4">
                    Bài Post: <span className="fw-bold text-primary">{(revenueStats.postRevenue ?? 0).toLocaleString()}</span>
                    {renderChange(revenueStats.postRevenue ?? 0, revenueStats.postRevenueYesterday ?? 0)}
                  </div>
                  <div className="col-md-4">
                    Quản lý Căn hộ: <span className="fw-bold text-primary">{(revenueStats.apartmentRevenue ?? 0).toLocaleString()}</span>
                    {renderChange(revenueStats.apartmentRevenue ?? 0, revenueStats.apartmentRevenueYesterday ?? 0)}
                  </div>
                  <div className="col-md-4">
                    Hợp đồng: <span className="fw-bold text-primary">{(revenueStats.contractRevenue ?? 0).toLocaleString()}</span>
                    {renderChange(revenueStats.contractRevenue ?? 0, revenueStats.contractRevenueYesterday ?? 0)}
                  </div>
                </div>
                <hr />
                <div className="fs-5">
                  Tổng doanh thu: <span className="fw-bold text-success">{(revenueStats.totalRevenue ?? 0).toLocaleString()}</span>
                  {renderChange(revenueStats.totalRevenue ?? 0, revenueStats.totalRevenueYesterday ?? 0)}

                </div>
              </div>
            </div>
          </div> */}
        </div>

        <div className="row g-4 mt-4">
          {/* User theo tháng */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">👥 Thống kê User theo tháng</h6>
                {userChartData ? <Bar data={userChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>

          {/* Staff theo tháng */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">🧑‍💼 Thống kê Staff theo tháng</h6>
                {staffChartData ? <Bar data={staffChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>

          {/* Apartment theo tháng */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">🏢 Thống kê Apartment theo tháng</h6>
                {apartmentChartData ? <Bar data={apartmentChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>

          {/* Post theo tháng */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">📝 Thống kê Post theo tháng</h6>
                {postChartData ? <Bar data={postChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>

          {/* Đơn xác nhận cư dân theo tháng */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">✅ Đơn xác nhận cư dân theo tháng</h6>
                {residentVerificationChartData ? <Bar data={residentVerificationChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>

          {/* Đơn rút tiền theo tháng */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">💸 Đơn rút tiền theo tháng</h6>
                {withdrawRequestChartData ? <Bar data={withdrawRequestChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>

          {/* Báo cáo theo tháng */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">📝 Báo cáo theo tháng</h6>
                {reportChartData ? <Bar data={reportChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>

          {/* Liên hệ theo tháng */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">📩 Liên hệ theo tháng</h6>
                {contactChartData ? <Bar data={contactChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>

        {/* Update Profile theo tháng */}
        <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">👥 Update Profile theo tháng</h6>
                {profileChartData ? <Bar data={profileChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminDashboard>
  );
}