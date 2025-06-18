import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";
import AdminDashboard from "./adminDashboard";
// import "./adminDashboard.css"; // dùng chung CSS với admin layout

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
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res1 = await fetch("http://localhost:4000/api/admin-dashboard/stats/UsersList");
        const res2 = await fetch("http://localhost:4000/api/admin-dashboard/stats/StaffsList");
        const res3 = await fetch("http://localhost:4000/api/admin-dashboard/stats/ApartmentsList");

        const data1 = await res1.json();
        const data2 = await res2.json();
        const data3 = await res3.json();

        setStats({
          customers: data1.total,
          staffs: data2.total,
          apartments: data3.total,
        });
      } catch (err) {
        console.error("Lỗi khi fetch dữ liệu:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminDashboard>
      <div className="adminx-main">
        <h3>Dashboard tổng hợp</h3>

        <div className="adminx-stats">
          <div className="adminx-card">
            <h6>🔢 Tổng Apartment</h6>
            <p className="adminx-stat-value">{stats.apartments}</p>
          </div>
          <div className="adminx-card">
            <h6>👥 Tổng User</h6>
            <p className="adminx-stat-value">{stats.customers}</p>
          </div>
          <div className="adminx-card">
            <h6>🧑‍💼 Tổng Staff</h6>
            <p className="adminx-stat-value">{stats.staffs}</p>
          </div>
        </div>

        <div className="adminx-dashboard-sections">
          <div className="adminx-revenue">
            <div className="adminx-filter">
              <h6>📊 Thống kê doanh thu</h6>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
            <table className="table table-dark table-striped">
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

          <div className="adminx-chart">
            <h6>📈 Biểu đồ doanh thu</h6>
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
    </AdminDashboard>
  );
}
