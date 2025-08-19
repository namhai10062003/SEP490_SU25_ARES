import React, { useEffect, useState } from "react";
import AdminDashboard from "../adminDashboard";
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
import { fetchPaidContracts } from "../../../service/feePayment";
import { formatDate, formatPrice } from "../../../../utils/format";
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const PAGE_SIZE = 10;

const RevenueDeposit = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [paymentDate, setPaymentDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchText, setSearchText] = useState("");
    const [filteredPosts, setFilteredPosts] = useState([]);

    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const toInputDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        };

        setStartDate(toInputDate(firstDay));
        setEndDate(toInputDate(lastDay));
    }, []);

    useEffect(() => {
        const fetchContracts = async () => {
            setLoading(true);
            const data = await fetchPaidContracts();
            setContracts(data);
            setLoading(false);
        };
        fetchContracts();
    }, []);

    useEffect(() => {
        const lower = searchText.toLowerCase();
        const filtered = contracts.filter((c) => {
            const paidDate = new Date(c.paymentDate);
            const matchDate =
                (!startDate || paidDate >= new Date(startDate)) &&
                (!endDate || paidDate <= new Date(endDate)) &&
                (!paymentDate || new Date(c.paymentDate).toDateString() === new Date(paymentDate).toDateString());
            const matchText =
                !searchText ||
                (c.apartmentCode && c.apartmentCode.toLowerCase().includes(lower)) ||
                (c.fullNameA && c.fullNameA.toLowerCase().includes(lower)) ||
                (c.fullNameB && c.fullNameB.toLowerCase().includes(lower)) ||
                (c.orderCode && c.orderCode.toLowerCase().includes(lower)) ||
                (c.depositAmount && c.depositAmount.toString().includes(lower)) ||
                (c.commission && c.commission.toString().includes(lower));

            return matchDate && matchText;
        });
        setFilteredPosts(filtered);
        setPage(1);
    }, [contracts, searchText, startDate, endDate, paymentDate]);



    const paginatedContracts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);

    const totalRevenue = filteredPosts.reduce(
        (sum, c) => sum + Math.round(c.depositAmount * 0.1),
        0
    );

    const exportToExcel = () => {
        const data = filteredPosts.map((c) => ({
            "Mã căn hộ": c.apartmentCode,
            "Khách thuê": c.fullNameA,
            "Chủ nhà": c.fullNameB,
            "Ngày bắt đầu": formatDate(c.startDate),
            "Ngày kết thúc": formatDate(c.endDate),
            "Ngày thanh toán": formatDate(c.paymentDate),
            "Tiền cọc": formatPrice(c.depositAmount),
            "Hoa hồng (10%)": formatPrice(Math.round(c.depositAmount * 0.1)),
            "Mã giao dịch": c.orderCode,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DoanhThuCoc");
        XLSX.writeFile(wb, "DoanhThuTienCoc.xlsx");
    };

    const monthlyStats = () => {
        const stats = {};
        contracts.forEach((c) => {
            if (!c.paymentDate) return;
            const d = new Date(c.paymentDate);
            const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
            stats[key] = (stats[key] || 0) + Math.round(c.depositAmount * 0.1);
        });
        return stats;
    };

    const chartData = (() => {
        const stats = monthlyStats();
        const labels = Object.keys(stats).sort();
        return {
            labels,
            datasets: [
                {
                    label: "Doanh thu hoa hồng (VND)",
                    data: labels.map((k) => stats[k]),
                    backgroundColor: "rgba(153, 102, 255, 0.6)",
                },
            ],
        };
    })();

    const resetFilters = () => {
        setStartDate("");
        setEndDate("");
        setSearchText("");
    };

    return (
        <AdminDashboard>
            <div className="container py-4">
                <div className="bg-primary text-white rounded-4 p-3 mb-4 text-center">
                    <h2 className="mb-0">Thống Kê Doanh Thu Tiền Cọc</h2>
                </div>

                <div className="row g-3 align-items-end mb-3">
                    {/* Bộ lọc theo ngày */}
                    <div className="col-md-2">
                        <label className="form-label fw-semibold">Từ ngày</label>
                        <input
                            type="date"
                            value={startDate}
                            max={endDate || undefined}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-semibold">Đến ngày</label>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="form-control"
                        />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-semibold">Ngày thanh toán</label>
                        <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="form-control"
                        />
                    </div>

                    {/* Bộ lọc text tổng hợp */}
                    <div className="col-md-2">
                        <label className="form-label fw-semibold">Tìm kiếm thông tin</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    {/* Nút chức năng */}
                    <div className="col-md-2 d-grid">
                        <button
                            className="btn btn-secondary fw-semibold"
                            onClick={() => {
                                setStartDate("");
                                setEndDate("");
                                setSearchText("");
                                setPaymentDate("");
                            }}
                        >
                            Xóa lọc
                        </button>
                    </div>
                    <div className="col-md-2 d-grid">
                        <button
                            className="btn btn-success fw-semibold"
                            onClick={exportToExcel}
                        >
                            Xuất Excel
                        </button>
                    </div>
                </div>

                <h5 className="mb-3 text-end">
                    Tổng doanh thu hoa hồng:{" "}
                    <span className="text-success fw-bold">{formatPrice(totalRevenue)}</span>
                </h5>

                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Mã căn hộ</th>
                                    <th>Người đặt cọc</th>
                                    <th>Người nhận cọc</th>
                                    <th>Ngày tạo hợp đồng</th>
                                    <th>Ngày thanh toán</th>
                                    <th>Tiền cọc</th>
                                    <th>Hoa hồng (10%)</th>
                                    <th>Mã giao dịch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedContracts.map((c, idx) => (
                                    <tr key={c._id}>
                                        <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                        <td>{c.apartmentCode}</td>
                                        <td>{c.fullNameA}</td>
                                        <td>{c.fullNameB}</td>
                                        <td>{formatDate(c.createdAt)}</td>
                                        <td>{formatDate(c.paymentDate)}</td>
                                        <td>{formatPrice(c.depositAmount)}</td>
                                        <td className="text-success fw-bold">
                                            {formatPrice(Math.round(c.depositAmount * 0.1))}
                                        </td>
                                        <td>{c.orderCode}</td>
                                    </tr>
                                ))}
                                {paginatedContracts.length === 0 && (
                                    <tr>
                                        <td colSpan="10" className="text-center text-muted py-4">
                                            Không có hợp đồng đã thanh toán.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="d-flex justify-content-center align-items-center mt-3">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                    >
                        &lt; Prev
                    </button>
                    <span style={{ minWidth: 90, textAlign: "center" }}>
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Next &gt;
                    </button>
                </div>

                <div className="mt-5">
                    <h5>📊 Thống kê hoa hồng theo tháng</h5>
                    <Bar data={chartData} />
                </div>
            </div>
        </AdminDashboard>
    )
};

export default RevenueDeposit;
