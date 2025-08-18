// src/components/admin/StatusFilter.jsx
import React from "react";

const statusOptions = {
    user: [
        { value: "", label: "Tất cả trạng thái" },
        { value: "1", label: "Active" },
        { value: "0", label: "Blocked (chặn đăng bài)" },
        { value: "2", label: "Locked (khóa hoàn toàn)" },
    ],
    staff: [
        { value: "", label: "Tất cả trạng thái" },
        { value: "1", label: "Active" },
        { value: "2", label: "Blocked" },
    ],
    form: [
        { value: "", label: "Tất cả trạng thái" },
        { value: "Chờ duyệt", label: "Chờ duyệt" },
        { value: "Đã duyệt", label: "Đã duyệt" },
        { value: "Đã từ chối", label: "Đã từ chối" },
    ],
    withdraw: [
        { value: "", label: "Tất cả trạng thái" },
        { value: "pending", label: "Chờ duyệt" },
        { value: "approved", label: "Đã duyệt" },
        { value: "rejected", label: "Từ chối" },
    ],
    apartment: [
        { value: "all", label: "Tất cả" },
        { value: "active", label: "Hoạt động" },
        { value: "deleted", label: "Đã xóa" },
    ],
    post: [
        { value: "all", label: "Tất cả" },
        { value: "pending", label: "Chờ duyệt" },
        { value: "approved", label: "Đã duyệt" },
        { value: "rejected", label: "Đã từ chối" },
        { value: "deleted", label: "Đã xóa" },
    ],
    report: [
        { value: "", label: "Tất cả" },
        { value: "pending", label: "Chưa xử lý" },
        { value: "reviewed", label: "Đã xử lý" },
        { value: "archived", label: "Đã xoá" },
    ],
    contract: [
        { value: "pending", label: "Chờ duyệt" },
        { value: "approved", label: "Đã duyệt" },
        { value: "rejected", label: "Đã từ chối" },
        { value: "expired", label: "Hết hạn" },
        { value: "cancelled", label: "Đã huỷ" },
    ],
    notification: [
        { value: "", label: "Tất cả" },
        { value: "false", label: "Chưa đọc" },
        { value: "true", label: "Đã đọc" },
    ],
    default: [
        { value: "", label: "Tất cả trạng thái" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
    ],
};

const StatusFilter = ({ value, onChange, type = "default" }) => {
    const options = statusOptions[type] || statusOptions.default;

    return (
        <select
            className="form-select w-auto"
            style={{ maxWidth: 220 }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};

export default StatusFilter;
