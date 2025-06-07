import React from "react";
import { Link } from "react-router-dom";

const stats = [
    { title: "Doanh thu hôm nay", value: "$65.4K", change: "▲ So với trước" },
    { title: "Tỉ lệ tăng trưởng", value: "78.4%", change: "▲ So với trước" },
    { title: "Người dùng đang hoạt động", value: "42.5K", change: "▲ So với trước" },
    { title: "Tổng số người dùng", value: "97.4K", change: "▼ So với trước" },
    { title: "Tổng lượt click", value: "82.7K", change: "▲ So với trước" },
];

export default function StatisticDashboard() {
    return (
        <>
            {/* Main content */}
            <div className="flex-grow-1 p-5 bg-light">
                <h2 className="fw-bold mb-4">Dashboard tổng hợp</h2>
                <div className="row g-4">
                    {stats.map((item, index) => (
                        <div key={index} className="col-md-4">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h6 className="card-title fw-bold">{item.title}</h6>
                                    <h4 className="text-primary">{item.value}</h4>
                                    <small className="text-muted">{item.change}</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div></>


    );
}
