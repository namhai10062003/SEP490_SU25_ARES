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
import { formatSmartDate } from "../../../utils/format.jsx";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

// const PACKAGE_PRICES = {
//   VIP1: 10000,
//   VIP2: 20000,
//   VIP3: 30000,
//   normal: 0,
// };

export default function DashboardHome() {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
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

  const [apartmentChartData, setApartmentChartData] = useState(null);
  const [postChartData, setPostChartData] = useState(null);
  const [residentVerificationChartData, setResidentVerificationChartData] = useState(null);
  const [withdrawRequestChartData, setWithdrawRequestChartData] = useState(null);
  const [reportChartData, setReportChartData] = useState(null);
  const [contactChartData, setContactChartData] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  // const [profileChartData, setProfileChartData] = useState(null);

  const renderChange = (today, yesterday) => {
    const change = today - yesterday;
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

    const getDailyCountStatsForSelectedMonth = (dataList, getDateField) => {
      const countsByDay = {};
      dataList.forEach((item) => {
        const date = getDateField(item);
        if (!date) return;
        const d = new Date(date);
        if (d.getFullYear() !== currentYear) return; // implicit current year
        if (d.getMonth() + 1 !== selectedMonth) return;
        const day = d.getDate();
        countsByDay[day] = (countsByDay[day] || 0) + 1;
      });
      return countsByDay;
    };

    const createDailyChartData = (countsByDay, labelName) => {
      const daysInMonth = new Date(currentYear, selectedMonth, 0).getDate();
      const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0"));
      return {
        labels,
        datasets: [
          {
            label: labelName,
            data: labels.map((dd) => countsByDay[parseInt(dd, 10)] || 0),
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
          fetch(`${API_URL}/api/report/get-recent-pending-reports`).then((res) =>
            res.json()
          ),
          fetch(`${API_URL}/api/contact/get-recent-pending-contacts`).then((res) =>
            res.json()
          ),
          fetch(`${API_URL}/api/admin-dashboard/get-all-profiles`).then((res) =>
            res.json()
          ),
        ]);

        // Removed low-value user/staff charts to declutter UI
        setApartmentChartData(
          createDailyChartData(
            getDailyCountStatsForSelectedMonth(apartmentsRes.data || [], (a) => a.createdAt),
            "Căn hộ mới"
          )
        );
        setPostChartData(
          createDailyChartData(
            getDailyCountStatsForSelectedMonth(allPosts, (p) => p.createdAt),
            "Bài đăng mới"
          )
        );
        setResidentVerificationChartData(
          createDailyChartData(
            getDailyCountStatsForSelectedMonth(residentRes.data || [], (r) => r.createdAt),
            "Xác nhận cư dân mới"
          )
        );
        setWithdrawRequestChartData(
          createDailyChartData(
            getDailyCountStatsForSelectedMonth(withdrawRes.data || [], (w) => w.createdAt),
            "Đơn rút tiền mới"
          )
        );
        setReportChartData(
          createDailyChartData(
            getDailyCountStatsForSelectedMonth(reportsRes.data || [], (r) => r.createdAt),
            "Báo cáo mới"
          )
        );
        setContactChartData(
          createDailyChartData(
            getDailyCountStatsForSelectedMonth(contactsRes.data || [], (c) => c.createdAt),
            "Liên hệ mới"
          )
        );
        // Recent lists
        const sortByDateDesc = (arr) =>
          [...(arr || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentReports(sortByDateDesc(reportsRes.data).slice(0, 5));
        setRecentContacts(sortByDateDesc(contactsRes.data).slice(0, 5));
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
  }, [selectedMonth]);

  return (
    <AdminDashboard>
      <div className="container-fluid px-0">
        {/* Header + Month Filter */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <h3 className="fw-bold mb-0">Tổng quan hệ thống</h3>
          <div className="d-flex align-items-center gap-2">
            <label className="text-muted me-2">Tháng:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="form-select form-select-sm"
              style={{ width: 140 }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{`Tháng ${m}`}</option>
              ))}
            </select>
          </div>
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

          {/* Recent Activity */}
          <div className="row g-4 mt-1">
            <div className="col-12 col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">📝 Báo cáo cần duyệt</h6>
                    <Link to="/admin-dashboard/report" className="small">Xem tất cả</Link>
                  </div>
                  {recentReports && recentReports.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {recentReports.map((r) => (
                        <li key={r._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <span className="text-truncate" style={{ maxWidth: "70%" }}>{r.title || r.reason || `Report ${r._id?.slice(-5)}`}</span>
                          <span className="text-muted small">{formatSmartDate(r.createdAt)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted">Không có báo cáo</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">📩 Liên hệ mới nhất cần trả lời</h6>
                    <Link to="/admin-dashboard/contact" className="small">Xem tất cả</Link>
                  </div>
                  {recentContacts && recentContacts.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {recentContacts.map((c) => (
                        <li key={c._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <span className="text-truncate" style={{ maxWidth: "70%" }}>{c.subject || c.message?.slice(0, 40) || `Contact ${c._id?.slice(-5)}`}</span>
                          <span className="text-muted small">{formatSmartDate(c.createdAt)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted">Không có liên hệ</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reports & Contacts */}
          {/* <div className="col-12 col-md-6">
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
          </div> */}

        </div>


        <div className="row g-4 mt-4">
          {/* Apartment theo tháng */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">🏢 Apartment theo ngày (Tháng {selectedMonth})</h6>
                {apartmentChartData ? <Bar data={apartmentChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>

          {/* Post theo tháng */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">📝 Post theo ngày (Tháng {selectedMonth})</h6>
                {postChartData ? <Bar data={postChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>

          {/* Đơn xác nhận cư dân theo tháng */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">✅ Xác nhận cư dân mới theo ngày (Tháng {selectedMonth})</h6>
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
                <h6 className="mb-3 text-center">📝 Báo cáo theo ngày (Tháng {selectedMonth})</h6>
                {reportChartData ? <Bar data={reportChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>

          {/* Liên hệ theo tháng */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="mb-3 text-center">📩 Liên hệ theo ngày (Tháng {selectedMonth})</h6>
                {contactChartData ? <Bar data={contactChartData} /> : <div className="text-muted text-center">Đang tải...</div>}
              </div>
            </div>
          </div>
        </div>



      </div>
    </AdminDashboard>
  );
}