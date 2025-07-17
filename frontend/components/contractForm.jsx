import React from "react";

const ContractForm = ({
    contractData,
    post,
    user,
    landlord,
    readOnly = false,
    headerDate,
}) => {

    const formatVNDate = (dateStr) => {
        if (!dateStr) return "....../....../......";
        const d = new Date(dateStr);
        return `${String(d.getDate()).padStart(2, "0")}/${String(
            d.getMonth() + 1
        )}/${d.getFullYear()}`;
    };

    const formatVNDayOfWeek = (dateStr) => {
        if (!dateStr) return "....../....../......";
        const d = new Date(dateStr);
        const days = [
            "Chủ nhật",
            "Thứ 2",
            "Thứ 3",
            "Thứ 4",
            "Thứ 5",
            "Thứ 6",
            "Thứ 7",
        ];
        return `${days[d.getDay()]}, ngày ${String(d.getDate()).padStart(
            2,
            "0"
        )} tháng ${String(d.getMonth() + 1).padStart(2, "0")} năm ${d.getFullYear()}`;
    };

    const startDate = contractData?.startDate || "";
    const endDate = contractData?.endDate || "";
    const depositAmount =
        contractData?.depositAmount || Math.floor((post?.price || 0) * 0.1);
    const terms =
        contractData?.terms || "Các điều khoản đã đính kèm trong hợp đồng.";

    const landlordInfo = landlord || post?.contactInfo || {};

    return (
        <div className="container py-4">
            {readOnly === false && (
                <div className=" mb-2">
                    <span className="badge bg-warning text-dark">Đang xem trước</span>
                </div>
            )}

            <div className="card shadow p-3">
                <div className="text-center mb-4">
                    <h5 className="fw-bold text-uppercase">
                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </h5>
                    <div className="fst-italic text-muted">Độc lập - Tự do - Hạnh phúc</div>
                    <div
                        className="border-top border-dark my-1 mx-auto"
                        style={{ width: "150px" }}
                    ></div>
                    <h6 className="fw-bold text-primary mt-3">
                        HỢP ĐỒNG ĐẶT CỌC GIỮ CHỖ CĂN HỘ
                    </h6>
                    <small className="text-muted d-block text-end">
                        {formatVNDayOfWeek(headerDate || new Date())}
                    </small>
                </div>

                {/* Parties */}
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-light fw-bold">BÊN A (Chủ nhà)</div>
                            <div className="card-body small">
                                <p><strong>Họ tên:</strong> {landlordInfo.name}</p>
                                <p><strong>CMND/CCCD:</strong> {landlordInfo.identityNumber}</p>
                                <p><strong>Địa chỉ:</strong> {landlordInfo.address}</p>
                                <p><strong>Số điện thoại:</strong> {landlordInfo.phone}</p>
                                <p><strong>Email:</strong> {landlordInfo.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-light fw-bold">BÊN B (Khách hàng)</div>
                            <div className="card-body small">
                                <p><strong>Họ tên:</strong> {user?.name}</p>
                                <p><strong>CMND/CCCD:</strong> {user?.identityNumber}</p>
                                <p><strong>Địa chỉ:</strong> {user?.address}</p>
                                <p><strong>Số điện thoại:</strong> {user?.phone}</p>
                                <p><strong>Email:</strong> {user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bất động sản */}
                <div className="card my-3 shadow-sm">
                    <div className="card-header bg-light fw-bold">📌 THÔNG TIN BẤT ĐỘNG SẢN</div>
                    <div className="card-body small row g-3">
                        <div className="col-md-6">
                            <p><strong>Mã căn hộ:</strong> {post?.apartmentCode}</p>
                            <p><strong>Vị trí:</strong> {post?.location}</p>
                            <p><strong>Diện tích:</strong> {post?.area} m²</p>
                            <p><strong>Giá thuê/bán:</strong> {post?.price?.toLocaleString("vi-VN")} VNĐ</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Dự án:</strong> {post?.property}</p>
                            <p><strong>Pháp lý:</strong> {post?.legalDocument}</p>
                            <p><strong>Nội thất:</strong> {post?.interiorStatus}</p>
                            <p><strong>Tiện ích:</strong> {post?.amenities?.join(", ")}</p>
                        </div>
                    </div>
                </div>

                {/* Thời gian + tiền */}
                <div className="mt-3">
                    <h6><strong>Thời gian:</strong> {formatVNDate(startDate)} → {formatVNDate(endDate)}</h6>
                    <h6><strong>Tiền đặt cọc:</strong> {depositAmount.toLocaleString("vi-VN")} VNĐ</h6>
                </div>

                {/* only show this if readOnly */}
                {readOnly && (
                    <div className="mt-3">
                        <p><strong>Trạng thái thanh toán:</strong> {post?.paymentStatus === "paid" ? "✅ Đã thanh toán" : "⏳ Chưa thanh toán"}</p>
                        <p><strong>Mã thanh toán:</strong> {post?.orderCode}</p>
                    </div>
                )}

                {/* Điều khoản */}
                <div className="mt-4">
                    <h6 className="fw-bold text-decoration-underline mb-2">
                        📄 ĐIỀU KHOẢN
                    </h6>
                    <p>{terms}</p>
                    <p>- Hai bên cam kết thực hiện đúng điều khoản trong hợp đồng.</p>
                    <p>- Mọi tranh chấp sẽ được giải quyết theo pháp luật.</p>
                    <p>- Hợp đồng có hiệu lực từ ngày ký.</p>
                </div>

                {/* Ký tên */}
                <div className="row text-center mt-5 mb-5">
                    <div className="col">
                        <strong>BÊN A</strong>
                        <div>(Ký và ghi rõ họ tên)</div>
                        <div className="border-bottom mt-5 mx-auto" style={{ width: "60%" }}></div>
                    </div>
                    <div className="col">
                        <strong>BÊN B</strong>
                        <div>(Ký và ghi rõ họ tên)</div>
                        <div className="border-bottom mt-5 mx-auto" style={{ width: "60%" }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractForm;
