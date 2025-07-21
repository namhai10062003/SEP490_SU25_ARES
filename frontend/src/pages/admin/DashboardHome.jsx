import React, { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart } from "recharts";
import AdminDashboard from "./adminDashboard";

const data = [
  { name: "Tháng 1", value: 10000 },
  { name: "Tháng 2", value: 12500 },
  { name: "Tháng 3", value: 11200 },
  { name: "Tháng 4", value: 13800 },
  { name: "Tháng 5", value: 14300 },
];

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
    feedbacks: 0,
    revenue: 0,
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
          "ReportsAndContactsList",
          "Revenue",
        ];

        const [
          usersRes,
          staffsRes,
          apartmentsRes,
          postsRes,
          residentVerificationsRes,
          withdrawRequestsRes,
          feedbacksRes,
          revenueRes,
        ] = await Promise.all(
          urls.map((url) =>
            fetch(`${import.meta.env.VITE_API_URL}/api/admin-dashboard/stats/${url}`).then((res) => res.json())
          )
        );

        setStats({
          customers: usersRes.total || 0,
          staffs: staffsRes.total || 0,
          apartments: apartmentsRes.total || 0,
          posts: postsRes.total || 0,
          residentVerifications: residentVerificationsRes.total || 0,
          withdrawRequests: withdrawRequestsRes.total || 0,
          feedbacks: feedbacksRes.total || 0,
          revenue: revenueRes.total || 0,
        });
      } catch (err) {
        console.error("Lỗi khi fetch dữ liệu:", err);
      }
    };

    fetchStats();
  }, []);


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
        <h6 className="mb-2">📣 Tổng Phản Hồi (Báo cáo & Liên hệ)</h6>
        <div className="fs-2 fw-bold text-primary">{stats.feedbacks}</div>
      </div>
    </div>
  </div>

  <div className="col-12 col-md-6">
    <div className="card shadow-sm border-0 text-center h-100">
      <div className="card-body">
        <h6 className="mb-2">💰 Doanh Thu Hiện Tại ($)</h6>
        <div className="fs-2 fw-bold text-primary">{stats.revenue}</div>
      </div>
    </div>
  </div>
</div>


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
                <table className="table table-striped table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Tháng</th>
                      <th>Doanh thu ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body d-flex flex-column align-items-center">
                <h6 className="mb-3">📈 Biểu đồ doanh thu</h6>
                <PieChart width={300} height={300}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboard>
  );
}