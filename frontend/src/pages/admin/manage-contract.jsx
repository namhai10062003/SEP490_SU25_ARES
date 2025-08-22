import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "../../../components/Pagination.jsx";
import { getStatusLabel, formatDate } from "../../../utils/format.jsx";
import SearchInput from "../../../components/admin/searchInput.jsx";
import StatusFilter from "../../../components/admin/statusFilter.jsx";
import LoadingModal from "../../../components/loadingModal.jsx";
import AdminDashboard from "./adminDashboard.jsx";
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

// Use shared getStatusLabel for payment status as well

const ManageContract = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // UI/data state
    const [contractList, setContractList] = useState([]);
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // filter/search state - initialize from URL params
    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
    const [searchValue, setSearchValue] = useState(searchParams.get("search") || ""); // controlled input, only search on submit
    const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "");

    // pagination state - initialize from URL params
    const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
    const [limit, setLimit] = useState(parseInt(searchParams.get("limit")) || 10);

    // Update URL params when state changes
    const updateURLParams = useCallback((newParams) => {
        const currentParams = new URLSearchParams(searchParams);

        // Update with new params
        Object.entries(newParams).forEach(([key, value]) => {
            if (value && value !== "") {
                currentParams.set(key, value);
            } else {
                currentParams.delete(key);
            }
        });

        setSearchParams(currentParams);
    }, [searchParams, setSearchParams]);

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
        updateURLParams({ search: searchValue, page: 1 });
        // fetchContracts will be triggered by useEffect when searchInput changes
    };
    const clearSearch = () => {
        setSearchValue("");
        setSearchInput("");
        setPage(1);
        updateURLParams({ search: "", page: 1 });
    };

    // status filter handler
    const handleStatusChange = (val) => {
        setFilterStatus(val);
        setPage(1);
        updateURLParams({ status: val, page: 1 });
    };

    // pagination handlers
    const handlePageChange = (newPage) => {
        setPage(newPage);
        updateURLParams({ page: newPage });
    };

    const handlePageSizeChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1);
        updateURLParams({ limit: newLimit, page: 1 });
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
                                                        {c.landlordId ? (
                                                            <Link
                                                                to={`/admin-dashboard/manage-user/${c.landlordId._id}`}
                                                            >
                                                                {c.landlordId.fullName || c.landlordId.name || c.landlordId.email || "N/A"}
                                                            </Link>
                                                        ) : (
                                                            "N/A"
                                                        )}
                                                    </td>
                                                    <td>
                                                        {c.postSnapshot?.apartmentCode || "-"}
                                                    </td>
                                                    <td>

                                                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                                                    </td>
                                                    <td>
                                                        {c.paymentDate ? new Date(c.paymentDate).toLocaleDateString() : ""}
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
                                                        {(() => {
                                                            const payObj = getStatusLabel(c.paymentStatus);
                                                            return (
                                                                <span
                                                                    className={
                                                                        "badge " +
                                                                        (payObj.color ? `bg-${payObj.color}` : "bg-light text-dark")
                                                                    }
                                                                >
                                                                    {payObj.label}
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td>
                                                        {formatDate(c.createdAt)}
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
                    onPageChange={handlePageChange}
                    pageSize={limit}
                    onPageSizeChange={handlePageSizeChange}
                />

            </div>
        </AdminDashboard>
    );
};

export default ManageContract;
