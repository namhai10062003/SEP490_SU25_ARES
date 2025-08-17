import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "../../../../components/Pagination.jsx";
import ReusableModal from "../../../../components/ReusableModal.jsx";
import StatusFilter from "../../../../components/admin/statusFilter.jsx";
import AdminDashboard from "../adminDashboard";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const AdminContactPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalContacts, setTotalContacts] = useState(0);
    const token = localStorage.getItem("token");

    const [searchParams, setSearchParams] = useSearchParams();
    const searchText = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "pending";
    const currentPage = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || PAGE_SIZE_OPTIONS[0];

    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [selectedContact, setSelectedContact] = useState(null);

    // cập nhật query string
    const updateQuery = (next = {}) => {
        const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
        const keys = ["search", "status", "page", "pageSize"];
        keys.forEach((k) => {
            if (Object.prototype.hasOwnProperty.call(next, k)) {
                const v = next[k];
                if (v === "" || v === null || v === undefined) params.delete(k);
                else params.set(k, String(v));
            }
        });
        setSearchParams(params, { replace: true });
    };

    const handleStatusFilterChange = (value) => updateQuery({ status: value, page: 1 });
    const handleSearchTextChange = (e) => updateQuery({ search: e.target.value, page: 1 });
    const handlePageChange = (page) => updateQuery({ page });
    const handlePageSizeChange = (size) => updateQuery({ pageSize: size, page: 1 });

    const loadContacts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contact/admin`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let data = res.data.data || [];

            // filter theo trạng thái
            if (statusFilter) {
                if (statusFilter === "pending") {
                    // chỉ lấy chưa xoá
                    data = data.filter((c) => c.status === "pending" && !c.isDeleted);
                } else {
                    data = data.filter((c) => c.status === statusFilter);
                }
            }

            // filter theo từ khoá
            if (searchText.trim()) {
                const keyword = searchText.toLowerCase();
                data = data.filter((c) =>
                    [c.name, c.email, c.message].some((field) =>
                        field?.toLowerCase().includes(keyword)
                    )
                );
            }

            setTotalContacts(data.length);

            const startIdx = (currentPage - 1) * pageSize;
            const pagedData = data.slice(startIdx, startIdx + pageSize);

            setContacts(pagedData);
        } catch (err) {
            console.error("❌ Lỗi khi tải liên hệ:", err);
            toast.error("Không thể tải danh sách liên hệ!");
            setContacts([]);
            setTotalContacts(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
        // eslint-disable-next-line
    }, [statusFilter, searchText, currentPage, pageSize]);

    const openDeleteModal = (contact) => {
        setSelectedContact(contact);
        setModalType("delete");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalType("");
        setSelectedContact(null);
    };

    const handleDelete = async () => {
        if (!selectedContact?._id) {
            toast.error("❌ Không tìm thấy ID liên hệ!");
            return;
        }
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/contact/list/${selectedContact._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("🗑️ Đã xoá liên hệ!");
            closeModal();
            loadContacts();
        } catch (err) {
            console.error("❌ Xoá thất bại:", err.response || err);
            toast.error("❌ Xoá liên hệ thất bại!");
        }
    };

    const handleMarkReviewed = async (id) => {
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/contact/list/${id}/status`,
                { status: "reviewed" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("✅ Đã đánh dấu đã xử lý!");
            loadContacts();
        } catch (err) {
            console.error("❌ Lỗi khi cập nhật trạng thái:", err);
            toast.error("❌ Cập nhật trạng thái thất bại!");
        }
    };

    return (
        <AdminDashboard active="contact">
            <div className="container py-4">

                {/* Header */}
                <div className="bg-primary text-white rounded-4 p-3 mb-4 text-center">
                    <h2 className="mb-0">Quản lý Liên hệ</h2>
                </div>

                {/* Bộ lọc trạng thái + tìm kiếm */}
                <div className="mb-3 d-flex justify-content-end align-items-center gap-2 flex-wrap">
                    <StatusFilter
                        type="report"
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        label="Trạng thái"
                        className="form-select w-auto"
                        options={[
                            { value: "", label: "Tất cả" },
                            { value: "pending", label: "Chờ xử lý" },
                            { value: "reviewed", label: "Đã xem xét" },
                            { value: "archived", label: "Lưu trữ" },
                        ]}
                    />
                    <input
                        type="text"
                        className="form-control w-auto"
                        placeholder="Tìm kiếm..."
                        value={searchText}
                        onChange={handleSearchTextChange}
                    />
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary mb-2"></div>
                        <div>Đang tải dữ liệu...</div>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Họ và tên</th>
                                    <th>Email</th>
                                    <th>Nội dung</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            Không có liên hệ nào
                                        </td>
                                    </tr>
                                ) : (
                                    contacts.map((c) => (
                                        <tr key={c._id}>
                                            <td>{c.name}</td>
                                            <td>{c.email}</td>
                                            <td>{c.message}</td>
                                            <td>
                                                <span
                                                    className={`badge ${c.isDeleted
                                                        ? "bg-secondary"
                                                        : c.status === "reviewed"
                                                            ? "bg-success"
                                                            : "bg-warning text-dark"
                                                    }`}
                                                >
                                                    {c.isDeleted
                                                        ? "Đã xoá"
                                                        : c.status === "reviewed"
                                                            ? "Đã xử lý"
                                                            : "Chưa xử lý"}
                                                </span>
                                            </td>
                                            <td>
                                                {c.isDeleted ? (
                                                    <span className="text-muted fst-italic">Đã xoá</span>
                                                ) : c.status === "reviewed" ? (
                                                    <span className="text-muted fst-italic">Đã xử lý</span>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-success me-1"
                                                            onClick={() => handleMarkReviewed(c._id)}
                                                        >
                                                            ✅ Đã xử lý
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => openDeleteModal(c)}
                                                        >
                                                            🗑️ Xoá
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <Pagination
                            page={currentPage}
                            totalPages={Math.ceil(totalContacts / pageSize) || 1}
                            onPageChange={handlePageChange}
                            pageSize={pageSize}
                            onPageSizeChange={handlePageSizeChange}
                            pageSizeOptions={PAGE_SIZE_OPTIONS}
                        />
                    </div>
                )}

                {/* Modal xác nhận xoá */}
                <ReusableModal
                    show={modalOpen && modalType === "delete"}
                    title="Xác nhận xoá liên hệ"
                    onClose={closeModal}
                    body={<div>Bạn có chắc muốn xoá liên hệ này?</div>}
                    footerButtons={[
                        { label: "Huỷ", variant: "secondary", onClick: closeModal },
                        { label: "🗑️ Xoá", variant: "danger", onClick: handleDelete },
                    ]}
                />
            </div>
        </AdminDashboard>
    );
};

export default AdminContactPage;
