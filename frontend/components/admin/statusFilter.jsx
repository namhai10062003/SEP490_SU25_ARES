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
        { value: "0", label: "Blocked" },
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
