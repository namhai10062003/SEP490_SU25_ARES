import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { getAllPosts } from "../../service/postService";
import AdminDashboard from "./adminDashboard";
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
  // const [profileChartData, setProfileChartData] = useState(null);

  const renderChange = (today, yesterday) => {
    const change = today - yesterday;
    console.log(today, yesterday);
    if (change > 0) {
      return <span className="text-success ms-2">+{change}</span>;
    } else if (change < 0) {
      return <span className="text-danger ms-2">-{change}</span>; // vì change đã là số âm
    } else {
      return <span className="text-muted ms-2"></span>; //±0
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
    profiles: 0,
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

    const typeKeys = [
      "customers",
      "staffs",
      "apartments",
      "posts",
      "residentVerifications",
      "withdrawRequests",
      "reports",
      "contacts",
      "profiles",
    ];

    const statsResponses = await Promise.all(
      urls.map((url) =>
        fetch(`${API_URL}/api/admin-dashboard/stats/${url}`).then((res) =>
          res.json()
        )
      )
    );

    const totals = {};
    typeKeys.forEach((key, index) => {
      totals[key] = statsResponses[index].total || 0;
    });

    const fetchTodayAndYesterday = async (dataType) => {
      const res = await fetch(
        `${API_URL}/api/admin-dashboard/stats/${dataType}-today-and-yesterday`
      );
      return res.json();
    };

    const todayYesterdayStats = await Promise.all(
      typeKeys.map((key) =>
        fetchTodayAndYesterday(
          key === "customers" ? "users" : key // customers -> users
        ).then((data) => ({ key, data }))
      )
    );

    const fullStats = {};
    todayYesterdayStats.forEach(({ key, data }) => {
      const today = data.today || 0;
      const yesterday = data.yesterday || 0;
      let percentChange = 0;

      if (yesterday === 0 && today > 0) {
        percentChange = 100;
      } else if (yesterday > 0) {
        percentChange = ((today - yesterday) / yesterday) * 100;
      }

      fullStats[key] = {
        total: totals[key],
        today,
        yesterday,
        percentChange: Math.round(percentChange),
      };
    });

    setStats(fullStats);

    // Chart data
    const postRes = await getAllPosts();
    const allPosts = postRes.data.data || [];

    const [
      staffsRes,
      apartmentsRes,
      residentRes,
      withdrawRes,
      reportsRes,
      contactsRes,
      profilesRes,
    ] = await Promise.all([
      fetch(`${API_URL}/api/admin-dashboard/get-all-staffs`).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/api/admin-dashboard/get-all-apartments`).then((res) =>
        res.json()
      ),
      fetch(
        `${API_URL}/api/admin-dashboard/get-all-resident-verifications`
      ).then((res) => res.json()),
      fetch(`${API_URL}/api/admin-dashboard/get-all-withdraw-requests`).then(
        (res) => res.json()
      ),
      fetch(`${API_URL}/api/admin-dashboard/get-all-reports`).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/api/admin-dashboard/get-all-contacts`).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/api/admin-dashboard/get-all-profiles`).then((res) =>
        res.json()
      ),
    ]);

    setUserChartData(
      createMonthlyChartData(
        getMonthlyCountStats(allPosts, (u) => u.createdAt),
        "User mới"
      )
    );
    setStaffChartData(
      createMonthlyChartData(
        getMonthlyCountStats(staffsRes.data || [], (s) => s.createdAt),
        "Staff mới"
      )
    );
    setApartmentChartData(
      createMonthlyChartData(
        getMonthlyCountStats(apartmentsRes.data || [], (a) => a.createdAt),
        "Căn hộ mới"
      )
    );
    setPostChartData(
      createMonthlyChartData(
        getMonthlyCountStats(allPosts, (p) => p.createdAt),
        "Bài đăng mới"
      )
    );
    setResidentVerificationChartData(
      createMonthlyChartData(
        getMonthlyCountStats(residentRes.data || [], (r) => r.createdAt),
        "Xác nhận cư dân mới"
      )
    );
    setWithdrawRequestChartData(
      createMonthlyChartData(
        getMonthlyCountStats(withdrawRes.data || [], (w) => w.createdAt),
        "Đơn rút tiền mới"
      )
    );
    setReportChartData(
      createMonthlyChartData(
        getMonthlyCountStats(reportsRes.data || [], (r) => r.createdAt),
        "Báo cáo mới"
      )
    );
    setContactChartData(
      createMonthlyChartData(
        getMonthlyCountStats(contactsRes.data || [], (c) => c.createdAt),
        "Liên hệ mới"
      )
    );
    // Bỏ comment nếu cần:
    // setProfileChartData(
    //   createMonthlyChartData(
    //     getMonthlyCountStats(profilesRes.data || [], (p) => p.createdAt),
    //     "Profile mới"
    //   )
    // );

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
      <div className="d-flex justify-content-between align-items-center mb-4">
  <h3 className="fw-bold mb-0">Dashboard tổng hợp</h3>
  
  {/* Nút đổi mật khẩu */}
  <Link
    to="/admin-dashboard/changePassWord"
    className="btn btn-outline-primary fw-semibold px-4 py-2"
    style={{ borderRadius: "10px" }}
  >
    🔑 Đổi mật khẩu
  </Link>
</div>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          {/* Apartments */}
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">🏢 Tổng Apartment</h6>
                <div className="fs-2 fw-bold text-primary">
                  {stats.apartments.total}
                  {renderChange(stats.apartments.today, statsYesterday.apartments.yesterday)}
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
                  {stats.customers.total}
                  {renderChange(stats.customers.today, statsYesterday.customers.yesterday)}
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
                  {stats.staffs.total}
                  {renderChange(stats.staffs.today, statsYesterday.staffs.yesterday)}
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
                  {stats.posts.total}
                  {renderChange(stats.posts.today, statsYesterday.posts.yesterday)}
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
                  {stats.residentVerifications.total}
                  {renderChange(stats.residentVerifications.today, statsYesterday.residentVerifications.yesterday)}
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
                  {stats.withdrawRequests.total}
                  {renderChange(stats.withdrawRequests.today, statsYesterday.withdrawRequests.yesterday)}
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
                  📝 Báo cáo: <span className="fw-bold text-primary">{stats.reports.total}</span>
                  {renderChange(stats.reports.today, statsYesterday.reports.yesterday)}
                </div>
                <div>
                  📩 Liên hệ: <span className="fw-bold text-primary">{stats.contacts.total}</span>
                  {renderChange(stats.contacts.today, statsYesterday.contacts.yesterday)}
                </div>
                <div>
                  👥 Update Profile: <span className="fw-bold text-primary">{stats.profiles.total}</span>
                  {renderChange(stats.profiles.today, statsYesterday.profiles.yesterday)}
                </div>
              </div>
            </div>
          </div>

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
        </div>

      </div>
    </AdminDashboard>
  );
}