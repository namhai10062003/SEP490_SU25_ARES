import React from "react";

const UniversalFilter = ({ filters, setFilters, onFilter, onReset, fields = [] }) => {
    const handleChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="row g-2 mb-3 align-items-end">
            {fields.map((field, idx) => {
                const { name, type, options, placeholder } = field;
                const value = filters[name] || "";

                if (type === "select") {
                    return (
                        <div className="col-md-3" key={idx}>
                            <select
                                className="form-select"
                                value={value}
                                onChange={(e) => handleChange(name, e.target.value)}
                            >
                                {options.map((opt, i) => (
                                    <option key={i} value={opt === "Tất cả" ? "" : opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                }

                return (
                    <div className="col-md-3" key={idx}>
                        <input
                            type={type}
                            className="form-control"
                            placeholder={placeholder || ""}
                            value={value}
                            onChange={(e) => handleChange(name, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onFilter();
                            }}
                        />
                    </div>
                );
            })}

            <div className="col-md-2 d-flex gap-2 ms-auto">
                <button className="btn btn-secondary flex-fill" onClick={onFilter}>
                    Lọc
                </button>
                <button className="btn btn-outline-danger" onClick={onReset}>
                    Xóa bộ lọc
                </button>
            </div>
        </div>
    );
};

export default UniversalFilter;
