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
  // console.log("formProps signaturePartyAUrl:", signaturePartyAUrl); //

  useEffect(() => {
    // console.log("🧾 All props in ContractForm:", {
    //   signaturePartyAUrl,
    //   signaturePartyBUrl,
    //   contractData,
    // });
  }, []);

  // Hàm format ngày Việt Nam dd/MM/yyyy
const formatVNDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

// Hàm tự cộng thêm 7 ngày
const getAutoEndDateVN = (start) => {
  const date = new Date(start);
  date.setDate(date.getDate() + 7);
  return date.toLocaleDateString("vi-VN");
};

const today = new Date(); // ngày hiện tại

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
  
  // const startDate = contractData?.startDate || "";
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
            HỢP ĐỒNG ĐẶT CỌC
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
  <strong>Thời hạn đặt cọc:</strong> từ ngày{" "}
  <strong>{formatVNDate(today)}</strong> đến ngày{" "}
  <strong>{getAutoEndDateVN(today)}</strong>
</h6>
          <h6>
            <strong>Tiền đặt cọc:</strong>{" "}
            {depositAmount.toLocaleString("vi-VN")} VNĐ
          </h6>
          {/* <h6>
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
          </h6> */}

        </div>

        {/* Điều khoản */}
        {/* Điều khoản */}
<h3 className="contract-subtitle mt-4">ĐIỀU KHOẢN HỢP ĐỒNG</h3>
<div className="contract-terms">
  <p>
    <strong>1. Đối tượng hợp đồng:</strong>
  </p>
 <p>
  {post?.type === "cho_thue" ? (
    <>Cho thuê căn hộ tại địa chỉ: <strong>{post?.location || "..."}</strong></>
  ) : post?.type === "ban" ? (
    <>Mua bán căn hộ tại địa chỉ: <strong>{post?.location || "..."}</strong></>
  ) : (
    <>Bất động sản tại địa chỉ: <strong>{post?.location || "..."}</strong></>
  )}
</p>

  <ul>
    <li>
      Diện tích: <strong>{post?.area || "..."}</strong> m²
    </li>
    <li>
  {post?.type === "cho_thue" ? (
    <>Giá thuê: <strong>{post?.price?.toLocaleString("vi-VN") || "..."} VNĐ/tháng</strong></>
  ) : post?.type === "ban" ? (
    <>Giá bán: <strong>{post?.price?.toLocaleString("vi-VN") || "..."} VNĐ</strong></>
  ) : (
    <>Giá: <strong>{post?.price?.toLocaleString("vi-VN") || "..."}</strong></>
  )}
</li>

    <li>Thuộc dự án: <strong>{post?.property || "..."}</strong></li>
    <li>Pháp lý: <strong>{post?.legalDocument || "..."}</strong></li>
    <li>Nội thất: <strong>{post?.interiorStatus || "..."}</strong></li>
    <li>Tiện ích: <strong>{post?.amenities?.join(", ") || "..."}</strong></li>
  </ul>

  <p>
    <strong>2. Mục đích và nội dung đặt cọc:</strong>
  </p>
  <ul>
  <li>
  Bên B đồng ý đặt cọc để giữ chỗ cho việc{" "}
  {post?.type === "cho_thue"
    ? "thuê"
    : post?.type === "ban"
    ? "mua bán"
    : "giao dịch"}{" "}
  bất động sản nêu tại Điều 1.
</li>

    <li>
      Tiền đặt cọc: <strong>{depositAmount.toLocaleString("vi-VN")} VNĐ</strong>
    </li>
  </ul>

  <p>
    <strong>3. Cam kết và nghĩa vụ:</strong>
  </p>

  {post?.type === "cho_thue" && (
   <>
   <p><strong>3.1. Cam kết của Bên A (Bên cho thuê):</strong></p>
   <ul>
     <li>Bên A cam kết giữ chỗ cho Bên B trong thời gian hợp đồng đặt cọc có hiệu lực.</li>
     <li>Cung cấp thông tin chính xác, đầy đủ, và trung thực về căn hộ cho thuê.</li>
     <li>Thông báo kịp thời cho Bên B để tiến hành ký hợp đồng thuê chính thức theo đúng thỏa thuận.</li>
     <li>Hoàn trả toàn bộ tiền đặt cọc cho Bên B trong trường hợp Bên A không thực hiện được việc cho thuê do lỗi của mình.</li>
   </ul>
 
   <p><strong>Nghĩa vụ của Bên A:</strong></p>
   <ul>
     <li>Hỗ trợ Bên B hoàn tất các thủ tục pháp lý liên quan đến việc thuê căn hộ.</li>
     <li>Đảm bảo căn hộ cho thuê đúng tình trạng và các điều kiện đã thỏa thuận trong hợp đồng.</li>
     <li>Chịu trách nhiệm pháp lý về quyền sở hữu và tính pháp lý của căn hộ cho thuê.</li>
     <li>Bàn giao căn hộ đúng thời hạn và tình trạng như cam kết.</li>
   </ul>
 
   <p><strong>3.2. Cam kết của Bên B (Bên thuê):</strong></p>
   <ul>
     <li>Thanh toán tiền đặt cọc và các khoản phí liên quan đúng hạn theo thỏa thuận trong hợp đồng đặt cọc.</li>
     <li>Tiến hành ký hợp đồng thuê chính thức trong thời gian đã thỏa thuận, nếu còn nhu cầu thuê.</li>
     <li>Chấp nhận mất tiền đặt cọc nếu tự ý hủy giao dịch hoặc không thực hiện hợp đồng mà không có lý do chính đáng.</li>
   </ul>
 
   <p><strong>Nghĩa vụ của Bên B:</strong></p>
   <ul>
     <li>Cung cấp đầy đủ giấy tờ cá nhân và các tài liệu cần thiết phục vụ cho việc ký hợp đồng thuê.</li>
     <li>Thực hiện đầy đủ các nghĩa vụ tài chính theo đúng hợp đồng đặt cọc và hợp đồng thuê chính thức.</li>
     <li>Phối hợp với Bên A trong việc hoàn tất các thủ tục ký kết hợp đồng thuê.</li>
   </ul>
 </>
 
  )}

  {post?.type === "ban" && (
    <>
    <p><strong>3.1. Cam kết của Bên A (Bên bán):</strong></p>
    <ul>
      <li>Bên A cam kết giữ chỗ cho Bên B trong thời gian hợp đồng đặt cọc có hiệu lực.</li>
      <li>Cung cấp thông tin chính xác, đầy đủ, trung thực về căn hộ bán.</li>
      <li>Thông báo kịp thời cho Bên B để tiến hành ký hợp đồng mua bán chính thức theo thỏa thuận.</li>
      <li>Hoàn trả toàn bộ tiền đặt cọc cho Bên B trong trường hợp Bên A không thực hiện được việc bán do lỗi của mình.</li>
    </ul>
  
    <p><strong>Nghĩa vụ của Bên A:</strong></p>
    <ul>
      <li>Hỗ trợ Bên B hoàn tất các thủ tục pháp lý liên quan đến việc mua bán căn hộ.</li>
      <li>Đảm bảo căn hộ bán đúng tình trạng và các điều kiện đã thỏa thuận trong hợp đồng.</li>
      <li>Chịu trách nhiệm pháp lý về quyền sở hữu và tính pháp lý của căn hộ bán.</li>
      <li>Bàn giao căn hộ đúng thời hạn và tình trạng như cam kết.</li>
    </ul>
  
    <p><strong>3.2. Cam kết của Bên B (Bên mua):</strong></p>
    <ul>
      <li>Thanh toán tiền đặt cọc và các khoản phí liên quan đúng hạn theo thỏa thuận trong hợp đồng đặt cọc.</li>
      <li>Tiến hành ký hợp đồng mua bán chính thức trong thời gian đã thỏa thuận nếu còn nhu cầu mua.</li>
      <li>Chấp nhận mất tiền đặt cọc nếu tự ý hủy giao dịch hoặc không thực hiện hợp đồng mà không có lý do chính đáng.</li>
    </ul>
  
    <p><strong>Nghĩa vụ của Bên B:</strong></p>
    <ul>
      <li>Cung cấp đầy đủ giấy tờ cá nhân và các tài liệu cần thiết phục vụ cho việc ký hợp đồng mua bán.</li>
      <li>Thực hiện đầy đủ các nghĩa vụ tài chính theo đúng hợp đồng đặt cọc và hợp đồng mua bán chính thức.</li>
      <li>Phối hợp với Bên A trong việc hoàn tất các thủ tục ký kết hợp đồng mua bán.</li>
    </ul>
  </>
  
  )}

  <p>
    <strong>4. Điều khoản chung:</strong>
  </p>
  <ul>
  <li>
    Hai bên cam kết thực hiện đầy đủ và nghiêm túc các điều khoản đã được quy định trong hợp đồng đặt cọc này.
  </li>
  <li>
    Mọi tranh chấp phát sinh liên quan đến hợp đồng sẽ được hai bên thương lượng, giải quyết trên tinh thần hợp tác và thiện chí. Trong trường hợp không thương lượng được, tranh chấp sẽ được giải quyết theo quy định pháp luật tại Tòa án có thẩm quyền.
  </li>
  <li>
    Hợp đồng đặt cọc này có hiệu lực kể từ ngày ký và được lập thành hai (02) bản gốc, mỗi bên giữ một (01) bản, đều có giá trị pháp lý như nhau.
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
