import React from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
const Pagination = ({
    page,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
}) => {
    return (
        <div className="mt-4">
            {/* Top controls */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 px-2">
                <div className="d-flex align-items-center gap-2">
                    <label className="mb-0 text-secondary fw-semibold">Hiển thị:</label>
                    <select
                        className="form-select form-select-sm"
                        style={{ width: "100px" }}
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="text-muted small ms-auto">
                    Tổng <strong>{totalPages}</strong> trang
                </div>
            </div>

            {/* Bottom controls */}
            <div className="d-flex justify-content-center align-items-center gap-3">
                <button
                    className="btn btn-outline-secondary px-4 py-2"
                    style={{
                        border: page <= 1 ? "none" : "1px solid #dee2e6",
                        cursor: page <= 1 ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                    }}
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                >
                    <FiArrowLeft size={16} />
                </button>

                <span className="fw-medium text-dark small">
                    Trang <strong>{page}</strong> / {totalPages}
                </span>

                <button
                    className="btn btn-outline-secondary btn-sm px-4 py-2"
                    style={{
                        border: page >= totalPages ? "none" : "1px solid #dee2e6",
                        cursor: page >= totalPages ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                    }}
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                >
                    <FiArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
