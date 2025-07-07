import React, { useEffect, useState } from "react";
import { getAllPosts } from "../../service/postService";
import AdminDashboard from "./adminDashboard";
import * as XLSX from "xlsx";
import { Bar } from "react-chartjs-2";
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

const PAGE_SIZE = 10;

// Hardcoded package prices
const PACKAGE_PRICES = {
    VIP1: 10000,
    VIP2: 20000,
    VIP3: 30000,
    normal: 0,
};

const RevenueManagement = () => {
    const [posts, setPosts] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        getAllPosts()
            .then((res) => {
                const paidPosts = (res.data.data || []).filter(
                    (p) => p.paymentStatus === "paid" && p.paymentDate
                );
                setPosts(paidPosts);
                setTotalPages(Math.ceil(paidPosts.length / PAGE_SIZE));
            })
            .catch(console.error);
    }, []);

    const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");
    const formatPrice = (p) => new Intl.NumberFormat("vi-VN").format(p) + " đ";

    const filteredPosts = posts.filter((p) => {
        const paid = new Date(p.paymentDate);
        if (startDate && paid < new Date(startDate)) return false;
        if (endDate && paid > new Date(endDate)) return false;
        return true;
    });

    const filteredRevenue = filteredPosts.reduce(
        (sum, p) => sum + (PACKAGE_PRICES[p.postPackage?.type] || 0),
        0
    );

    const paginatedPosts = filteredPosts.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    useEffect(() => {
        setPage(1);
        setTotalPages(Math.ceil(filteredPosts.length / PAGE_SIZE));
    }, [filteredPosts]);

    const exportToExcel = () => {
        const data = filteredPosts.map((p) => ({
            Tiêu_đề: p.title,
            Người_đăng: p.contactInfo?.name || "-",
            Ngày_thanh_toán: formatDate(p.paymentDate),
            Gói: p.postPackage?.type || "-",
            Số_tiền: PACKAGE_PRICES[p.postPackage?.type] || 0,
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DoanhThu");
        XLSX.writeFile(wb, "DoanhThu.xlsx");
    };

    const getMonthlyStats = () => {
        const stats = {};
        posts.forEach((p) => {
            const d = new Date(p.paymentDate);
            const key = `${d.getFullYear()}-${(d.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;
            stats[key] =
                (stats[key] || 0) + (PACKAGE_PRICES[p.postPackage?.type] || 0);
        });
        return stats;
    };

    const monthlyChartData = (() => {
        const stats = getMonthlyStats();
        const labels = Object.keys(stats).sort();
        return {
            labels,
            datasets: [
                {
                    label: "Doanh thu (VNĐ)",
                    data: labels.map((key) => stats[key]),
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
            ],
        };
    })();

    return (
        <AdminDashboard>
            <div className="container py-4">
                <div className="bg-primary text-white rounded-4 p-3 mb-4 text-center">
                    <h2 className="mb-0">Thống Kê Doanh Thu Bài Post</h2>
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-3">
                        <button
                            className="btn btn-secondary w-100"
                            onClick={() => {
                                setStartDate("");
                                setEndDate("");
                            }}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                    <div className="col-md-3">
                        <button className="btn btn-success w-100" onClick={exportToExcel}>
                            Xuất Excel
                        </button>
                    </div>
                </div>

                <h5 className="mb-3 text-end">
                    Tổng doanh thu:{" "}
                    <span className="text-success fw-bold">{formatPrice(filteredRevenue)}</span>
                </h5>

                <div className="table-responsive mb-3">
                    <table className="table table-bordered align-middle table-striped">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Tiêu đề</th>
                                <th>Người đăng</th>
                                <th>Ngày thanh toán</th>
                                <th>Gói</th>
                                <th>Số tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPosts.map((p, idx) => (
                                <tr key={p._id}>
                                    <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                    <td>{p.title}</td>
                                    <td>{p.contactInfo?.name || "-"}</td>
                                    <td>{formatDate(p.paymentDate)}</td>
                                    <td>{p.postPackage?.type || "-"}</td>
                                    <td>{formatPrice(PACKAGE_PRICES[p.postPackage?.type] || 0)}</td>
                                </tr>
                            ))}
                            {paginatedPosts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-4">
                                        Không có dữ liệu.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-center align-items-center mt-3">
                    <button
                        className="btn btn-outline-secondary mr-2"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                    >
                        &lt; Prev
                    </button>
                    <span style={{ minWidth: 90, textAlign: "center" }}>
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        className="btn btn-outline-secondary ml-2"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Next &gt;
                    </button>
                </div>

                {/* Chart */}
                <div className="mt-5">
                    <h5>📅 Thống kê theo tháng</h5>
                    <Bar data={monthlyChartData} />
                </div>
            </div>
        </AdminDashboard>
    );
};

export default RevenueManagement;
