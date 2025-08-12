import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import AdminDashboard from "./adminDashboard.jsx";
import StatusFilter from "../../../components/admin/statusFilter.jsx";
import Pagination from "../../../components/Pagination.jsx";
import { getStatusLabel } from "../../../utils/format.jsx";
import SearchInput from "../../../components/admin/searchInput.jsx";
import LoadingModal from "../../../components/loadingModal.jsx";
import { Link } from "react-router-dom";
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const paymentStatusMap = {
    unpaid: "Chưa thanh toán",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
};

const paymentStatusColor = {
    paid: "bg-success",
    unpaid: "bg-warning text-dark",
    failed: "bg-danger",
};

const ManageContract = () => {
    const navigate = useNavigate();

    // UI/data state
    const [contractList, setContractList] = useState([]);
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // filter/search state
    const [searchInput, setSearchInput] = useState("");
    const [searchValue, setSearchValue] = useState(""); // controlled input, only search on submit
    const [filterStatus, setFilterStatus] = useState("");

    // pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // axios with token
    const getAxios = () => {
        const token = localStorage.getItem("token");
        return axios.create({
            baseURL: API_BASE,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    };

    // fetch contracts from backend
    const fetchContracts = useCallback(async () => {
        setLoadingFetch(true);
        try {
            const params = {
                page,
                pageSize: limit,
                status: filterStatus,
                search: searchInput,
                sortBy: "createdAt",
                sortOrder: "desc",
            };
            // Remove empty params
            Object.keys(params).forEach((k) => {
                if (params[k] === "" || params[k] === null || params[k] === undefined) delete params[k];
            });

            const res = await getAxios().get(`/contracts`, { params });
            const data = res.data || {};
            setContractList(Array.isArray(data.data) ? data.data : []);
            setTotalPages(data.totalPages ?? Math.max(1, Math.ceil((data.total || 0) / limit)));
            setTotalItems(data.total ?? 0);
        } catch (err) {
            setContractList([]);
            setTotalPages(1);
            setTotalItems(0);
            toast.error("Không thể tải danh sách hợp đồng!");
        } finally {
            setLoadingFetch(false);
        }
    }, [page, limit, filterStatus, searchInput]);

    // fetch on filter/pagination/search change
    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    // search handlers
    const triggerSearch = (e) => {
        if (e) e.preventDefault();
        setSearchInput(searchValue);
        setPage(1);
        // fetchContracts will be triggered by useEffect when searchInput changes
    };
    const clearSearch = () => {
        setSearchValue("");
        setSearchInput("");
        setPage(1);
    };

    // status filter handler
    const handleStatusChange = (val) => {
        setFilterStatus(val);
        setPage(1);
    };

    return (
        <AdminDashboard>
            <div className="w-100 position-relative">
                {/* LoadingModal as overlay */}
                {loadingFetch && <LoadingModal />}
                <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
                    <h2 className="font-weight-bold mb-0">Quản lý hợp đồng</h2>
                    <div className="d-flex gap-3 align-items-center">
                        <form className="d-flex align-items-center" onSubmit={triggerSearch}>
                            <SearchInput
                                value={searchValue}
                                onChange={setSearchValue}
                                onSearch={triggerSearch}
                                onClear={clearSearch}
                                placeholder="Tìm theo email người thuê/chủ nhà..."
                                width={350}
                            />
                        </form>
                        <StatusFilter
                            value={filterStatus}
                            onChange={handleStatusChange}
                            type="contract"
                        />
                    </div>
                </div>
                <div className="mt-3 text-start text-muted py-2">
                    Tổng: <b>{totalItems}</b> hợp đồng
                </div>
                <div className="card w-100">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="thead-light">
                                    <tr>
                                        <th>STT</th>
                                        <th>Người thuê</th>
                                        <th>Chủ nhà</th>
                                        <th>Mã căn hộ</th>
                                        <th>Ngày bắt đầu</th>
                                        <th>Ngày kết thúc</th>
                                        <th>Trạng thái</th>
                                        <th>Thanh toán</th>
                                        <th>Ngày tạo</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!loadingFetch && contractList.length === 0) ? (
                                        <tr>
                                            <td colSpan={10} className="text-center text-muted py-4">
                                                Không có hợp đồng nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        contractList.map((c, idx) => {
                                            const statusObj = getStatusLabel(c.status);
                                            return (
                                                <tr key={c._id}>
                                                    <td>{(page - 1) * limit + idx + 1}</td>
                                                    <td>
                                                        {c.userId ? (
                                                            <Link
                                                                to={`/admin-dashboard/manage-user/${c.userId._id}`}
                                                            >
                                                                {c.userId.fullName || c.userId.name || c.userId.email || "N/A"}
                                                            </Link>
                                                        ) : (
                                                            "N/A"
                                                        )}
                                                    </td>
                                                    <td>
                                                        <Link
                                                            to={`/admin-dashboard/manage-user/${c.userId._id}`}
                                                        >
                                                            {c.landlordId?.fullName || c.landlordId?.name || c.landlordId?.email || "N/A"}
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        {c.postSnapshot?.apartmentCode || "-"}
                                                    </td>
                                                    <td>
                                                        {c.startDate ? new Date(c.startDate).toLocaleDateString() : ""}
                                                    </td>
                                                    <td>
                                                        {c.endDate ? new Date(c.endDate).toLocaleDateString() : ""}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={
                                                                "badge " +
                                                                (statusObj.color
                                                                    ? `bg-${statusObj.color}`
                                                                    : "bg-light text-dark")
                                                            }
                                                        >
                                                            {statusObj.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={
                                                                "badge " +
                                                                (paymentStatusColor[c.paymentStatus]
                                                                    ? paymentStatusColor[c.paymentStatus]
                                                                    : "bg-light text-dark")
                                                            }
                                                        >
                                                            {paymentStatusMap[c.paymentStatus] || c.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {c.createdAt
                                                            ? new Date(c.createdAt).toLocaleString()
                                                            : ""}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Xem chi tiết"
                                                            onClick={() => navigate(`/admin-dashboard/manage-contract/${c._id}`)}
                                                        >
                                                            <FaEye />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(p) => setPage(p)}
                    pageSize={limit}
                    onPageSizeChange={(s) => {
                        setLimit(s);
                        setPage(1);
                    }}
                />

            </div>
        </AdminDashboard>
    );
};

export default ManageContract;
