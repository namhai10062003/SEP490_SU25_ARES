import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminDashboard from "../adminDashboard";
import StatusFilter from "../../../../components/admin/statusFilter.jsx";
import Pagination from "../../../../components/Pagination.jsx";
import ReuseableModal from "../../../../components/ReusableModal.jsx";
import { useSearchParams } from "react-router-dom";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const AdminContactPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalContacts, setTotalContacts] = useState(0);

    // Helper to render user's name as a link to their detail page (by user id)
    // Helper to render contact's name as a link to their detail page (by contact id)
    const renderNameLink = (contact) => {
        return (
            <a
                href={`/admin-dashboard/manage-user/${contact._id}`}
                style={{ color: "#007bff", textDecoration: "underline" }}
                title={`Xem chi tiết liên hệ: ${contact.name}`}
            >
                {contact.name}
            </a>
        );
    };
    // Use URL search params for search, filter, pagination (like manage-user)
    const [searchParams, setSearchParams] = useSearchParams();

    // Derive state from URL
    const searchText = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "";
    const currentPage = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || PAGE_SIZE_OPTIONS[0];

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // "delete"
    const [selectedContact, setSelectedContact] = useState(null);

    // Helper to update query params (merge, like manage-user)
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

    // Handlers for filter/search/pagination that update URL params
    const handleStatusFilterChange = (value) => {
        updateQuery({ status: value, page: 1 });
    };

    const handleSearchTextChange = (e) => {
        updateQuery({ search: e.target.value, page: 1 });
    };

    const handlePageChange = (page) => {
        updateQuery({ page });
    };

    const handlePageSizeChange = (size) => {
        updateQuery({ pageSize: size, page: 1 });
    };

    // Fetch contacts with filter, search, pagination
    const loadContacts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contact/list`);
            let data = res.data.data || [];

            // StatusFilter by status
            if (statusFilter) {
                data = data.filter((c) => c.status === statusFilter);
            }

            // StatusFilter by search text
            if (searchText.trim()) {
                const keyword = searchText.toLowerCase();
                data = data.filter((c) =>
                    [c.name, c.email, c.message].some((field) =>
                        field?.toLowerCase().includes(keyword)
                    )
                );
            }

            setTotalContacts(data.length);

            // Pagination
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

    // Modal handlers
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
        if (!selectedContact) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/contact/list/${selectedContact._id}`);
            toast.success("🗑️ Đã xoá liên hệ!");
            closeModal();
            loadContacts();
        } catch (err) {
            console.error("❌ Xoá thất bại:", err);
            toast.error("❌ Xoá liên hệ thất bại!");
        }
    };

    const handleMarkReviewed = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/contact/list/${id}/status`, {
                status: "reviewed",
            });
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
                <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
                    <h2 className="fw-bold mb-0">Quản lý Liên hệ</h2>
                </div>

                {/* StatusFilter & Search */}
                <div className="mb-3 d-flex justify-content-end align-items-center gap-3 flex-wrap">
                    <StatusFilter
                        type="report"
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        label="Trạng thái"
                        className="w-auto"
                    />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm..."
                        style={{ maxWidth: 200 }}
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
                                            <td>{renderNameLink(c)}</td>
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
                                                            className="btn btn-sm btn-success me-2"
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

                {/* ReuseableModal for delete confirmation */}
                <ReuseableModal
                    show={modalOpen && modalType === "delete"}
                    title="Xác nhận xóa liên hệ"
                    onClose={closeModal}
                    onConfirm={handleDelete}
                    confirmText="Xoá"
                    cancelText="Huỷ"
                >
                    <div>Bạn có chắc muốn xoá liên hệ này?</div>
                    {selectedContact && (
                        <div className="mt-2 small text-muted">
                            <div><b>Họ tên:</b> {selectedContact.name}</div>
                            <div><b>Email:</b> {selectedContact.email}</div>
                            <div><b>Nội dung:</b> {selectedContact.message}</div>
                        </div>
                    )}
                </ReuseableModal>
            </div>
        </AdminDashboard>
    );
};

export default AdminContactPage;
