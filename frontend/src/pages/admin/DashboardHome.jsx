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
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res1 = await fetch(`${import.meta.env.VITE_API_URL}/api/admin-dashboard/stats/UsersList`);
        const res2 = await fetch(`${import.meta.env.VITE_API_URL}/api/admin-dashboard/stats/StaffsList`);
        const res3 = await fetch(`${import.meta.env.VITE_API_URL}/api/admin-dashboard/stats/ApartmentsList`);

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
      <div className="container-fluid px-0">
        <h3 className="mb-4 fw-bold">Dashboard tổng hợp</h3>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h6 className="mb-2">🔢 Tổng Apartment</h6>
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