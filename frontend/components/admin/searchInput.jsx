// src/components/admin/SearchInput.jsx
import React from "react";
import { FiSearch } from "react-icons/fi";

const SearchInput = ({
    value,
    onChange,
    onSearch, // gọi khi Enter hoặc click search icon
    onClear,
    placeholder = "Tìm theo email", // default value
    width = 300 // default width
}) => {
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            onSearch && onSearch();
        }
    };

    return (
        <div className="input-group" style={{ width }}>
            <input
                type="text"
                className="form-control"
                placeholder={placeholder}
                aria-label="Search"
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

export default SearchInput;
