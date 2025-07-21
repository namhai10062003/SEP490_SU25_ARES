import React, { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart } from "recharts";
import AdminDashboard from "./adminDashboard";

const COLORS = ["#4dabf7", "#ae3ec9", "#fd7e14", "#37b24d", "#fcc419"];

export default function DashboardHome() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [stats, setStats] = useState({
    customers: 0,
    staffs: 0,
    apartments: 0,
    posts: 0,
    residentVerifications: 0,
    withdrawRequests: 0,
    reports: 0,
    contacts: 0,
    revenue: 0,
  });

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  const [revenueStats, setRevenueStats] = useState({
    postRevenue: 0,
    apartmentRevenue: 0,
    contractRevenue: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
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
        ];

        const fetchCommonStats = await Promise.all(
          urls.map((url) =>
            fetch(`${import.meta.env.VITE_API_URL}/api/admin-dashboard/stats/${url}`).then((res) => res.json())
          )
        );

        const revenueRes = await fetch(`${import.meta.env.VITE_API_URL}/api/revenue/all`).then((res) => res.json());
        const monthlyRevenueRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin-dashboard/stats/RevenueMonthly?year=${selectedYear}`).then((res) => res.json());

        setStats({
          customers: fetchCommonStats[0].total || 0,
          staffs: fetchCommonStats[1].total || 0,
          apartments: fetchCommonStats[2].total || 0,
          posts: fetchCommonStats[3].total || 0,
          residentVerifications: fetchCommonStats[4].total || 0,
          withdrawRequests: fetchCommonStats[5].total || 0,
          reports: fetchCommonStats[6].total || 0,
          contacts: fetchCommonStats[7].total || 0,
        });

        setRevenueStats({
          postRevenue: revenueRes.postRevenue || 0,
          apartmentRevenue: revenueRes.apartmentRevenue || 0,
          contractRevenue: revenueRes.contractRevenue || 0,
          totalRevenue: revenueRes.totalRevenue || 0,
        });

        setMonthlyRevenue(monthlyRevenueRes.monthlyData || []);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi fetch dữ liệu:", err);
      }
    };

    fetchStats();
  }, [selectedYear]);



  return (
    <AdminDashboard>
      <div className="container-fluid px-0">
        <h3 className="mb-4 fw-bold">Dashboard tổng hợp</h3>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">🏢 Tổng Apartment</h6>
                <div className="fs-2 fw-bold text-primary">{stats.apartments}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">👥 Tổng User</h6>
                <div className="fs-2 fw-bold text-primary">{stats.customers}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">🧑‍💼 Tổng Staff</h6>
                <div className="fs-2 fw-bold text-primary">{stats.staffs}</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">📝 Tổng Bài Post</h6>
                <div className="fs-2 fw-bold text-primary">{stats.posts}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">✅ Đơn Xác Nhận Cư Dân</h6>
                <div className="fs-2 fw-bold text-primary">{stats.residentVerifications}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">💸 Đơn Rút Tiền</h6>
                <div className="fs-2 fw-bold text-primary">{stats.withdrawRequests}</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">📣 Tổng Phản Hồi</h6>
                <div>📝 Báo cáo: <span className="fw-bold text-primary">{stats.reports}</span></div>
                <div>📩 Liên hệ: <span className="fw-bold text-primary">{stats.contacts}</span></div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">💰 Doanh Thu Hiện Tại ($)</h6>
                <div className="row">
                  <div className="col-md-4">
                    Bài Post: <span className="fw-bold text-primary">{revenueStats.postRevenue.toLocaleString()}</span>
                  </div>
                  <div className="col-md-4">
                    Quản lý Căn hộ: <span className="fw-bold text-primary">{revenueStats.apartmentRevenue.toLocaleString()}</span>
                  </div>
                  <div className="col-md-4">
                    Hợp đồng: <span className="fw-bold text-primary">{revenueStats.contractRevenue.toLocaleString()}</span>
                  </div>
                </div>
                <hr />
                <div className="fs-5">
                  Tổng doanh thu: <span className="fw-bold text-success">{revenueStats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          </div>  {/* ✅ Đóng lại cho đúng */}


          {/* Revenue Table & Chart */}
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">📊 Thống kê doanh thu</h6>
                    <select
                      className="form-select w-auto"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </select>
                  </div>

                  {loading ? (
                    <div>Đang tải dữ liệu...</div>
                  ) : (
                    <table className="table table-striped table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Tháng</th>
                          <th>Doanh thu ($)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyRevenue.map((item, index) => (
                          <tr key={index}>
                            <td>{`Tháng ${item.month}`}</td>
                            <td>{item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex flex-column align-items-center">
                  <h6 className="mb-3">📈 Biểu đồ doanh thu</h6>
                  {loading ? (
                    <div>Đang tải biểu đồ...</div>
                  ) : (
                    <PieChart width={300} height={300}>
                      <Pie
                        data={monthlyRevenue.map((item) => ({ name: `Tháng ${item.month}`, value: item.total }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {monthlyRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    </AdminDashboard>
  );
}