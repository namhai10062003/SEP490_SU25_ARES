import React, { useEffect, useState } from "react";
import { getAllFees } from "../../../service/feePayment.js";
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

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const PAGE_SIZE = 5;

const RevenueApartment = () => {
    const [fees, setFees] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString("vi-VN") : "Chưa thanh toán";
    const formatPrice = (p) =>
        new Intl.NumberFormat("vi-VN").format(p || 0) + " VND";

    const sortFeesByMonth = (data) => {
    return [...data].sort((a, b) => {
        const parseMonth = (monthStr) => {
            if (!monthStr) return { year: 0, month: 0 };

            if (monthStr.includes("-")) {
                // YYYY-MM
                const [y, m] = monthStr.split("-");
                return { year: Number(y), month: Number(m) };
            } else {
                // MM/YYYY
                const [m, y] = monthStr.split("/");
                return { year: Number(y), month: Number(m) };
            }
        };

        const dateA = parseMonth(a.month);
        const dateB = parseMonth(b.month);

        // Sắp xếp mới nhất lên trước
        if (dateA.year !== dateB.year) return dateB.year - dateA.year;
        return dateB.month - dateA.month;
    });
};

    const filteredFees = fees.filter((f) => {
        const matchDate = !selectedMonth || (() => {
            if (!f.month || f.month === "---") return false;
        
            const [year, month] = selectedMonth.split("-");
            const selectedMonthFormatted = `${month.padStart(2, "0")}/${year}`;
        
            let feeMonthFormatted;
            if (f.month.includes("-")) {
                // Nếu dạng YYYY-MM
                const [y, m] = f.month.split("-");
                feeMonthFormatted = `${m.padStart(2, "0")}/${y}`;
            } else {
                // Nếu dạng MM/YYYY
                feeMonthFormatted = f.month;
            }
        
            return feeMonthFormatted === selectedMonthFormatted;
        })();                

        const matchStatus =
            statusFilter === "all" ||
            (statusFilter === "paid" && f.paymentStatus === "paid") ||
            (statusFilter === "unpaid" && f.paymentStatus === "unpaid");

        const lowerSearch = searchText.toLowerCase();
        const matchSearch =
            !searchText ||
            f.apartmentCode?.toLowerCase().includes(lowerSearch) ||
            f.ownerName?.toLowerCase().includes(lowerSearch) ||
            f.orderCode?.toLowerCase().includes(lowerSearch) ||
            f.managementFee?.toString().includes(lowerSearch) ||
            f.waterFee?.toString().includes(lowerSearch) ||
            f.parkingFee?.toString().includes(lowerSearch) ||
            f.total?.toString().includes(lowerSearch);

        return matchDate && matchStatus && matchSearch;
    });


    const filteredRevenue = filteredFees
        .filter(f => f.paymentStatus === "paid")
        .reduce((sum, f) => sum + (f.total || 0), 0);

    const paginatedFees = filteredFees.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

useEffect(() => {
    getAllFees()
        .then((res) => {
            const sortedData = sortFeesByMonth(res.data?.data || []);
            setFees(sortedData);
        })
        .catch(console.error);
}, []);

    useEffect(() => {
        const newTotalPages = Math.max(
            1,
            Math.ceil(filteredFees.length / PAGE_SIZE)
        );
        setTotalPages(newTotalPages);
        if (page > newTotalPages) setPage(1);
    }, [fees, selectedMonth, statusFilter, searchText]);


    const exportToExcel = () => {
        const data = filteredFees.map((f) => ({
            "Mã căn hộ": f.apartmentCode,
            "Chủ sở hữu": f.ownerName,
            "Tháng": f.month,
            "Ngày thanh toán": formatDate(f.paymentDate),
            "Phí quản lý": f.managementFee,
            "Phí nước": f.waterFee,
            "Phí gửi xe": f.parkingFee,
            "Tổng tiền": f.total,
            "Mã giao dịch": f.orderCode || "N/A",
            "Thanh toán": f.paymentStatus,
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DoanhThuCanHo");
        XLSX.writeFile(wb, "DoanhThuCanHo.xlsx");
    };

    const getMonthlyStats = () => {
        const stats = {};
        fees.forEach((f) => {
            if (!f.paymentDate) return;
            const d = new Date(f.paymentDate);
            const key = `${d.getFullYear()}-${(d.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;
            stats[key] = (stats[key] || 0) + (f.total || 0);
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
                    <h2 className="mb-0">Thống Kê Doanh Thu Căn Hộ</h2>
                </div>

                <div className="row g-3 align-items-end mb-3">
                    {/* Chọn tháng */}
                    <div className="col-md-2">
                        <label className="form-label fw-semibold">Chọn tháng</label>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="form-control"
                        />
                    </div>

                    {/* Trạng thái */}
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Trạng thái</label>
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="unpaid">Chưa thanh toán</option>
                        </select>
                    </div>

                    {/* Tìm kiếm */}
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Tìm kiếm</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm thông tin..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    {/* Nút Xóa bộ lọc */}
                    <div className="col-md-2 d-grid">
                        <button
                            className="btn btn-secondary fw-semibold"
                            onClick={() => {
                                setSelectedMonth("");
                                setStatusFilter("all");
                                setSearchText("");
                            }}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>

                    {/* Nút Xuất Excel – nằm sát phải */}
                    <div className="col-md-2 ms-auto d-grid">
                        <button className="btn btn-success fw-semibold" onClick={exportToExcel}>
                            Xuất Excel
                        </button>
                    </div>
                </div>


                {/* Tổng doanh thu */}
                <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
                    <h5 className="mb-0">
                        Tổng doanh thu:{" "}
                        <span className="text-success fw-bold">
                            {formatPrice(filteredRevenue)}
                        </span>
                    </h5>
                </div>


                <div className="table-responsive mb-3">
                    <table className="table table-bordered align-middle table-striped">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Mã căn hộ</th>
                                <th>Chủ sở hữu</th>
                                <th>Tháng</th>
                                <th>Ngày thanh toán</th>
                                <th>Phí quản lý</th>
                                <th>Phí nước</th>
                                <th>Phí gửi xe</th>
                                <th>Tổng tiền</th>
                                <th>Mã GD</th>
                                <th>Thanh toán</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedFees.map((f, idx) => (
                                <tr key={f._id}>
                                    <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                    <td>{f.apartmentCode}</td>
                                    <td>{f.ownerName}</td>
                                    <td>{f.month && f.month.includes("-") ? f.month.split("-").reverse().join("/") : f.month}</td>
                                    <td>{formatDate(f.paymentDate)}</td>
                                    <td>{formatPrice(f.managementFee)}</td>
                                    <td>{formatPrice(f.waterFee)}</td>
                                    <td>{formatPrice(f.parkingFee)}</td>
                                    <td>{formatPrice(f.total)}</td>
                                    <td>{f.orderCode || "N/A"}</td>
                                    <td>
                                        {f.paymentStatus === "paid" ? (
                                            <span className="text-success">✔️ Đã thanh toán</span>
                                        ) : (
                                            <span className="text-danger">❌ Chưa thanh toán</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {paginatedFees.length === 0 && (
                                <tr>
                                    <td colSpan="11" className="text-center text-muted py-4">
                                        Không có dữ liệu.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

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

                <div className="mt-5">
                    <h5>📅 Thống kê theo tháng</h5>
                    <Bar data={monthlyChartData} />
                </div>
            </div>
        </AdminDashboard>
    );
};

export default RevenueApartment;
