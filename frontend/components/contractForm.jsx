import React, { useEffect } from "react";

const ContractForm = ({
  contractData,
  post,
  user,
  landlord,
  readOnly = false,
  headerDate,
  signaturePartyBUrl,
  signaturePartyAUrl,
}) => {
  console.log("formProps signaturePartyAUrl:", signaturePartyAUrl); //

  useEffect(() => {
    console.log("🧾 All props in ContractForm:", {
      signaturePartyAUrl,
      signaturePartyBUrl,
      contractData,
    });
  }, []);

  const getAutoEndDateVN = (startDate, plusDays = 7) => {
    if (!startDate) return "....../....../......";
    const d = new Date(startDate);
    d.setDate(d.getDate() + plusDays);
    return formatVNDate(d.toISOString());
  };

  const formatVNDate = (dateStr) => {
    if (!dateStr) return "....../....../......";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
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
    )} tháng ${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )} năm ${d.getFullYear()}`;
  };
  
  const startDate = contractData?.startDate || "";
  const depositAmount =
    contractData?.depositAmount || Math.floor((post?.price || 0) * 0.1);
  const terms =
    contractData?.terms || "Các điều khoản đã đính kèm trong hợp đồng.";
  const landlordInfo = landlord || post?.contactInfo || {};

  return (
    <div className="container py-4">
      {!readOnly && (
        <div className="mb-2">
          <span className="badge bg-warning text-dark">Đang xem trước</span>
        </div>
      )}

      <div className="card shadow p-3">
        <div className="text-center mb-4">
          <h5 className="fw-bold text-uppercase">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </h5>
          <div className="fst-italic text-muted">
            Độc lập - Tự do - Hạnh phúc
          </div>
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

        {/* Thông tin 2 bên */}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-light fw-bold">
                BÊN A (Chủ nhà)
              </div>
              <div className="card-body small">
                <p>
                  <strong>Họ tên:</strong>{" "}
                  {readOnly ? contractData?.fullNameA : landlordInfo.name}
                </p>
                <p>
                  <strong>CMND/CCCD:</strong>{" "}
                  {readOnly ? contractData?.cmndA : landlordInfo.identityNumber}
                </p>
                <p>
                  <strong>Địa chỉ:</strong>{" "}
                  {readOnly ? contractData?.addressA : landlordInfo.address}
                </p>
                <p>
                  <strong>Số điện thoại:</strong>{" "}
                  {readOnly ? contractData?.phoneA : landlordInfo.phone}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {readOnly ? contractData?.emailA : landlordInfo.email}
                </p>

              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-light fw-bold">
                BÊN B (Khách hàng)
              </div>
              <div className="card-body small">
                <p>
                  <strong>Họ tên:</strong>{" "}
                  {readOnly ? contractData?.fullNameB : user?.name}
                </p>
                <p>
                  <strong>CMND/CCCD:</strong>{" "}
                  {readOnly ? contractData?.cmndB : user?.identityNumber}
                </p>
                <p>
                  <strong>Địa chỉ:</strong>{" "}
                  {readOnly ? contractData?.addressB : user?.address}
                </p>
                <p>
                  <strong>Số điện thoại:</strong>{" "}
                  {readOnly ? contractData?.phoneB : user?.phone}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {readOnly ? contractData?.emailB : user?.email}
                </p>

              </div>
            </div>
          </div>
        </div>

        {/* Thông tin bất động sản */}
        <div className="card my-3 shadow-sm">
          <div className="card-header bg-light fw-bold">
            THÔNG TIN BẤT ĐỘNG SẢN
          </div>
          <div className="card-body small row g-3">
            <div className="col-md-6">
              <p>
                <strong>Mã căn hộ:</strong> {post?.apartmentCode}
              </p>
              <p>
                <strong>Vị trí:</strong> {post?.location}
              </p>
              <p>
                <strong>Diện tích:</strong> {post?.area} m²
              </p>
              <p>
                <strong>Giá thuê/bán:</strong>{" "}
                {post?.price?.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>Dự án:</strong> {post?.property}
              </p>
              <p>
                <strong>Pháp lý:</strong> {post?.legalDocument}
              </p>
              <p>
                <strong>Nội thất:</strong> {post?.interiorStatus}
              </p>
              <p>
                <strong>Tiện ích:</strong> {post?.amenities?.join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Thời gian và tiền */}
        <div className="mt-3">
          <h6>
            <strong>Thời hạn giữ chỗ:</strong> từ ngày{" "}
            <strong>{formatVNDate(startDate)}</strong>
            đến ngày <strong>{getAutoEndDateVN(startDate)}</strong>
          </h6>
          <h6>
            <strong>Tiền đặt cọc:</strong>{" "}
            {depositAmount.toLocaleString("vi-VN")} VNĐ
          </h6>
          <h6>
            <li className="list-group-item">
              <strong>Mã đơn hàng:</strong> {contractData?.orderCode || "Chưa có"}
            </li>
            <li className="list-group-item">
              <strong>Trạng thái thanh toán:</strong>{" "}
              {contractData?.paymentStatus === "paid"
                ? "✅ Đã thanh toán"
                : contractData?.paymentStatus === "pending"
                  ? "⏳ Chờ thanh toán"
                  : "❌ Chưa thanh toán"}
            </li>
          </h6>

        </div>

        {/* Điều khoản */}
        <h3 className="contract-subtitle mt-4">ĐIỀU KHOẢN HỢP ĐỒNG</h3>
        <div className="contract-terms">
          <p>
            <strong>1. Đối tượng hợp đồng:</strong>
          </p>
          <p>
            Cho thuê căn hộ tại địa chỉ:{" "}
            <strong>{post?.location || "..."}</strong>
          </p>
          <ul>
            <li>
              Diện tích: <strong>{post?.area || "..."}</strong> m²
            </li>
            <li>
              Giá thuê:{" "}
              <strong>
                {post?.price?.toLocaleString("vi-VN") || "..."} VNĐ/tháng
              </strong>
            </li>
            <li>
              Thuộc dự án: <strong>{post?.property || "..."}</strong>
            </li>
            <li>
              Pháp lý: <strong>{post?.legalDocument || "..."}</strong>
            </li>
            <li>
              Nội thất: <strong>{post?.interiorStatus || "..."}</strong>
            </li>
            <li>
              Tiện ích: <strong>{post?.amenities?.join(", ") || "..."}</strong>
            </li>
          </ul>

          <p>
            <strong>2. Mục đích và nội dung đặt cọc:</strong>
          </p>
          <ul>
            <li>
              Bên B đồng ý đặt cọc để giữ chỗ cho việc mua bán / cho thuê bất
              động sản được nêu tại Điều 1.
            </li>
            <li>
              Tiền đặt cọc:{" "}
              <strong>{depositAmount.toLocaleString("vi-VN")} VNĐ</strong>
            </li>
          </ul>

          <p>
            <strong>3. Cam kết và nghĩa vụ:</strong>
          </p>


          <p><strong>3.1. Cam kết của Bên A:</strong></p>
          <ul>
            <li>Giữ chỗ cho Bên B trong thời gian đặt cọc nêu trên.</li>
            <li>Cung cấp đầy đủ và minh bạch thông tin liên quan đến bất động sản.</li>
            <li>Thông báo và mời Bên B ký hợp đồng mua bán / thuê chính thức trong thời hạn giữ chỗ.</li>
            <li>Hoàn lại toàn bộ tiền cọc nếu không thể thực hiện giao dịch do lỗi của Bên A.</li>
          </ul>

          <p><strong>Nghĩa vụ của Bên A:</strong></p>
          <ul>
            <li>Hỗ trợ Bên B hoàn tất các thủ tục pháp lý liên quan đến giao dịch.</li>
            <li>Chịu trách nhiệm về tính pháp lý của bất động sản trong giao dịch.</li>
            <li>Bàn giao tài sản đúng thời hạn và tình trạng như đã cam kết.</li>
          </ul>

          <p><strong>3.2. Cam kết của Bên B:</strong></p>
          <ul>
            <li>Thanh toán đầy đủ và đúng hạn số tiền đặt cọc đã thỏa thuận.</li>
            <li>Tiến hành ký hợp đồng mua bán / thuê chính thức đúng thời hạn nếu còn nhu cầu.</li>
            <li>Chấp nhận mất toàn bộ tiền cọc nếu tự ý từ chối giao dịch mà không có lý do chính đáng.</li>
          </ul>

          <p><strong>Nghĩa vụ của Bên B:</strong></p>
          <ul>
            <li>Cung cấp đầy đủ thông tin cá nhân, giấy tờ cần thiết phục vụ giao dịch.</li>
            <li>Thực hiện đầy đủ các cam kết tài chính theo hợp đồng đặt cọc.</li>
            <li>Phối hợp với Bên A để hoàn tất thủ tục ký hợp đồng mua bán / thuê chính thức.</li>
          </ul>


          <p>
            <strong>4. Điều khoản chung:</strong>
          </p>
          <ul>
            <li>
              Hai bên cam kết thực hiện nghiêm túc các điều khoản của hợp đồng
              đặt cọc.
            </li>
            <li>
              Mọi tranh chấp phát sinh sẽ được giải quyết trước hết bằng thương
              lượng, nếu không được sẽ đưa ra Tòa án.
            </li>
            <li>
              Hợp đồng có hiệu lực kể từ ngày ký và được lập thành 02 bản gốc,
              mỗi bên giữ 01 bản, có giá trị pháp lý như nhau.
            </li>
          </ul>
        </div>

        {/* Ký tên */}
        <div className="row text-center mt-5 mb-5">
        <div className="row text-center mt-5 mb-5">
  {/* Bên A */}
  <div className="col d-flex flex-column align-items-center">
    <strong>BÊN A</strong>
    <div>(Ký và ghi rõ họ tên)</div>

    {typeof signaturePartyAUrl === 'string' && signaturePartyAUrl.trim() !== '' && (
      <img
        src={signaturePartyAUrl}
        alt="Chữ ký Bên A"
        style={{
          width: "120px",
          height: "auto",
          marginTop: "10px",
          borderBottom: "1px dotted #ccc",
        }}
      />
    )}

    <div
      className="border-bottom mt-3"
      style={{ width: "60%", height: "1px", backgroundColor: "#ccc" }}
    ></div>
  </div>

  {/* Bên B */}
  <div className="col d-flex flex-column align-items-center">
    <strong>BÊN B</strong>
    <div>(Ký và ghi rõ họ tên)</div>

    {typeof signaturePartyBUrl === 'string' && signaturePartyBUrl.trim() !== '' && (
      <img
        src={signaturePartyBUrl}
        alt="Chữ ký Bên B"
        style={{
          width: "120px",
          height: "auto",
          marginTop: "10px",
          borderBottom: "1px dotted #ccc",
        }}
      />
    )}

    <div
      className="border-bottom mt-3"
      style={{ width: "60%", height: "1px", backgroundColor: "#ccc" }}
    ></div>
  </div>
</div>
        </div>
      </div>
    </div>
  );
};

export default ContractForm;
