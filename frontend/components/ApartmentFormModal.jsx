import React from "react";
import { useState } from "react";

const ApartmentFormModal = ({ show, onClose, onSubmit, form, setForm, isEdit }) => {
    if (!show) return null;
    const [errors, setErrors] = useState({});

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        const newForm = { ...form, [field]: value };
        let newErrors = { ...errors };
    
        // Validate các trường số dương
        if (["bedrooms", "floor", "area"].includes(field)) {
            // Nếu không phải số, bỏ qua
            if (!/^\d*$/.test(value)) return;
    
            const numericValue = parseInt(value);
    
            if (value === "0") {
                newErrors[field] = `${
                    field === "bedrooms" ? "Số phòng ngủ" : field === "floor" ? "Tầng" : "Diện tích"
                } phải lớn hơn 0`;
                setErrors(newErrors);
                return; // Không cập nhật form nếu nhập 0
            } else {
                delete newErrors[field];
            }
    
            setErrors(newErrors);
            setForm(newForm);
            return;
        }
    
        // Mã căn hộ tự động set building và floor
        if (field === "apartmentCode") {
            const codeRegex = /^P(\d+)-(\d+)\.\d+$/;
            const match = value.match(codeRegex);
    
            if (match) {
                const plaza = match[1];
                const floor = match[2];
                setForm({
                    ...form,
                    apartmentCode: value,
                    floor,
                    building: `Plaza ${plaza}`,
                });
            } else {
                setForm({
                    ...form,
                    apartmentCode: value,
                    floor: "",
                    building: "",
                });
            }
            return;
        }
    
        setForm(newForm);
    };    

    return (
        <div
            className="modal fade show"
            style={{ display: "block", background: "rgba(0,0,0,0.3)" }}
            tabIndex="-1"
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <form onSubmit={onSubmit}>
                        <div className="container py-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="fw-bold text-primary m-0">
                                    {isEdit ? "Chỉnh sửa Căn Hộ" : "Tạo Căn Hộ"}
                                </h4>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={onClose}
                                ></button>
                            </div>

                            <div className="row g-3">
                                {/* Mã căn hộ */}
                                <div className="col-md-6">
                                    <label className="form-label">Mã Căn hộ</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ví dụ: P2-18.01"
                                        value={form.apartmentCode}
                                        onChange={handleChange("apartmentCode")}
                                        disabled={isEdit}
                                    />
                                </div>

                                {/* Số phòng ngủ */}
                                <div className="col-md-6">
                                    <label className="form-label">Số phòng ngủ</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.bedrooms}
                                        onChange={handleChange("bedrooms")}
                                    />
                                    {errors.bedrooms && <small className="text-danger">{errors.bedrooms}</small>}
                                </div>

                                {/* Tầng */}
                                <div className="col-md-6">
                                    <label className="form-label">Tầng</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.floor}
                                        onChange={handleChange("floor")}
                                        readOnly
                                    />
                                </div>

                                {/* Nội thất */}
                                <div className="col-md-6">
                                    <label className="form-label">Nội thất</label>
                                    <select
                                        className="form-select"
                                        value={form.furniture}
                                        onChange={handleChange("furniture")}
                                    >
                                        <option value="">-- Chọn --</option>
                                        <option value="Đầy đủ">Đầy đủ</option>
                                        <option value="Cơ bản">Cơ bản</option>
                                        <option value="Không có">Không có</option>
                                    </select>
                                </div>

                                {/* Diện tích */}
                                <div className="col-md-6">
                                    <label className="form-label">Diện tích (m²)</label>
                                    <input
                                        type="text"
                                        name="area"
                                        value={form.area}
                                        onChange={handleChange("area")}
                                        className="form-control"
                                    />
                                    {errors.area && <small className="text-danger">{errors.area}</small>}

                                </div>

                                {/* Hướng */}
                                <div className="col-md-6">
                                    <label className="form-label">Hướng</label>
                                    <select
                                        className="form-select"
                                        value={form.direction}
                                        onChange={handleChange("direction")}
                                    >
                                        <option value="">-- Chọn --</option>
                                        <option value="Đông">Đông</option>
                                        <option value="Tây">Tây</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Bắc">Bắc</option>
                                    </select>
                                </div>

                                {/* Trạng thái */}
                                <div className="col-md-6">
                                    <label className="form-label">Trạng thái</label>
                                    <select
                                        className="form-select"
                                        value={form.status}
                                        onChange={handleChange("status")}
                                        disabled={isEdit}
                                    >
                                        <option value="">-- Chọn --</option>
                                        <option value="đang ở">Đang ở</option>
                                        <option value="đang cho thuê">Đang cho thuê</option>
                                        <option value="chưa có chủ sở hữu">Chưa có chủ sở hữu</option>
                                    </select>
                                </div>

                                {/* Tòa nhà */}
                                <div className="col-md-6">
                                    <label className="form-label">Tòa nhà</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.building}
                                        onChange={handleChange("building")}
                                        readOnly
                                    />
                                </div>

                                {/* Chủ sở hữu */}
                                <div className="col-md-6">
                                    <label className="form-label">Chủ sở hữu</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Không bắt buộc"
                                        value={form.ownerName}
                                        onChange={handleChange("ownerName")}
                                        disabled={isEdit}
                                    />
                                </div>

                                {/* Tài liệu pháp lý */}
                                <div className="col-md-6">
                                    <label className="form-label">Tài liệu pháp lý</label>
                                    <select
                                        className="form-select"
                                        value={form.legalDocuments}
                                        onChange={handleChange("legalDocuments")}
                                    >
                                        <option value="">-- Chọn --</option>
                                        <option value="sổ hồng">Sổ hồng</option>
                                        <option value="chưa có sổ">Chưa có sổ</option>
                                    </select>
                                </div>

                                {/* Số điện thoại */}
                                <div className="col-md-6">
                                    <label className="form-label">Số điện thoại</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Không bắt buộc"
                                        value={form.ownerPhone}
                                        onChange={handleChange("ownerPhone")}
                                        disabled={isEdit}
                                    />
                                </div>
                            </div>

                            {/* Nút hành động */}
                            <div className="d-flex justify-content-end mt-4 gap-2">
                                <button className="btn btn-primary" type="submit">
                                    Xác nhận
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ApartmentFormModal;
