// src/components/admin/SearchEmailInput.jsx
import React from "react";
import { FiSearch } from "react-icons/fi";

const SearchEmailInput = ({
    value,
    onChange,
    onSearch, // gọi khi Enter hoặc click search icon
    onClear
}) => {
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            onSearch && onSearch();
        }
    };

    return (
        <div className="input-group" style={{ maxWidth: 320 }}>
            <input
                type="text"
                className="form-control"
                placeholder="Tìm theo email"
                aria-label="Search by email"
                aria-describedby="search-addon"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onSearch}
            >
                <FiSearch />
            </button>
            {value && (
                <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={onClear}
                    title="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default SearchEmailInput;
