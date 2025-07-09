import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import "./contractDetail.css";

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [contract, setContract] = useState(null);
  const [post, setPost] = useState(null);
  const today = new Date();

  // hàm ngày trong post detail
const formatVNDate = (dateStr) => {
  if (!dateStr) return "....../....../......";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

// Tự động cộng thêm 7 ngày
const getAutoEndDateVN = (startDate, plusDays = 7) => {
  if (!startDate) return "....../....../......";
  const d = new Date(startDate);
  d.setDate(d.getDate() + plusDays);
  return formatVNDate(d.toISOString());
};
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
  
        // 👉 Gọi API lấy hợp đồng
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contracts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const contractData = res.data.data;
        setContract(contractData);
  
        // ✅ Gọi thêm thông tin bài đăng bằng postId (với API mới)
        if (contractData.postId) {
          const postRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/posts/postdetail/${contractData.postId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setPost(postRes.data.data);
        } else {
          console.warn("⚠️ Không có postId trong hợp đồng");
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải hợp đồng hoặc bài đăng:", err);
        alert("Không thể tải chi tiết hợp đồng hoặc bài đăng.");
        navigate("/my-contracts");
      }
    };
  
    fetchDetail();
  }, [id, navigate]);
  
  
  

  if (loading || !contract) return <p>🔄 Đang tải chi tiết...</p>;

  return (
    <div className="contract-detail-container">
      <Header user={user} name={user?.name} />

      <h2 className="contract-header">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
      <p className="contract-sub">Độc lập - Tự do - Hạnh phúc</p>
      <hr className="contract-line" />
      <h3 className="contract-title">HỢP ĐỒNG THUÊ CĂN HỘ CHUNG CƯ</h3>
      <p className="contract-date">
        Hôm nay, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()} tại TP. Đà Nẵng
      </p>

      <section className="party-section">
        <h4><strong>BÊN CHO THUÊ (Bên A)</strong></h4>
        <p>Họ và tên: {contract.fullNameA}</p>
        <p>CMND/CCCD: {contract.identityNumberA || "Chưa cập nhật"}</p>
        <p>Địa chỉ: {contract.addressA}</p>
        <p>Số điện thoại: {contract.phoneA}</p>
      </section>

      <section className="party-section">
        <h4><strong>BÊN THUÊ (Bên B)</strong></h4>
        <p>Họ và tên: {contract.fullNameB}</p>
        <p>CMND/CCCD: {contract.identityNumberB || "Chưa cập nhật"}</p>
        <p>Địa chỉ: {contract.addressB}</p>
        <p>Số điện thoại: {contract.phoneB}</p>
      </section>

      <section className="rental-dates">
        <h4><strong>THỜI GIAN THUÊ</strong></h4>
        <p>Từ ngày: {contract.startDate?.slice(0, 10)}</p>
        <p>Đến ngày: {contract.endDate?.slice(0, 10)}</p>
      </section>

      <h3 className="contract-subtitle">📌 ĐIỀU KHOẢN HỢP ĐỒNG</h3>
      <div className="contract-terms">
        <p><strong>1. Đối tượng hợp đồng:</strong></p>
        <p>Cho thuê căn hộ tại địa chỉ: <strong>{post?.location || "..."}</strong></p>
        <p>Mã căn hộ: <strong>{post?.apartmentCode || "..."}</strong></p>
        <ul>
  <li>Diện tích: <strong>{post?.area || "..."} m²</strong></li>
  <li>Giá thuê: <strong>{post?.price?.toLocaleString("vi-VN") || "..."} VNĐ/tháng</strong></li>
  <li>Thuộc dự án: <strong>{post?.property || "..."}</strong></li>
  <li>Pháp lý: <strong>{post?.legalDocument || "..."}</strong></li>
  <li>Nội thất: <strong>{post?.interiorStatus || "..."}</strong></li>
  <li>Tiện ích: <strong>{post?.amenities || "..."}</strong></li>
</ul>

<p><strong>2. Mục đích và nội dung đặt cọc:</strong></p>
<ul>
  <li>Bên B đồng ý đặt cọc để giữ chỗ cho việc mua bán / cho thuê bất động sản được nêu tại Điều 1.</li>
  <li>Số tiền đặt cọc: <strong>{post?.price ? `${(post.price * 0.1).toLocaleString("vi-VN")} VNĐ` : "..."}</strong></li>
  {/* <li>Hình thức thanh toán: [ ] Tiền mặt &nbsp;&nbsp; [ ] Chuyển khoản</li> */}
  <li>
  Thời hạn giữ chỗ: từ ngày <strong>{formatVNDate(contract.startDate)}</strong>
  &nbsp;đến ngày <strong>{getAutoEndDateVN(contract.startDate)}</strong>
</li>
</ul>

<p><strong>3. Cam kết và nghĩa vụ:</strong></p>

<p><strong>3.1. Cam kết của Bên A:</strong></p>
<ul>
  <li>Giữ chỗ cho Bên B trong thời gian đặt cọc nêu trên.</li>
  <li>Cung cấp đầy đủ và minh bạch thông tin liên quan đến bất động sản.</li>
  <li>Thông báo và mời Bên B ký hợp đồng mua bán / thuê chính thức trong thời hạn giữ chỗ.</li>
  <li>Hoàn lại toàn bộ tiền cọc nếu không thể thực hiện giao dịch do lỗi của Bên A.</li>
</ul>

<p><strong>3.2. Cam kết của Bên B:</strong></p>
<ul>
  <li>Thanh toán đầy đủ và đúng hạn số tiền đặt cọc đã thỏa thuận.</li>
  <li>Tiến hành ký hợp đồng mua bán / thuê chính thức đúng thời hạn nếu còn nhu cầu.</li>
  <li>Chấp nhận mất toàn bộ tiền cọc nếu tự ý từ chối giao dịch mà không có lý do chính đáng.</li>
</ul>

<p><strong>4. Điều khoản chung:</strong></p>
<ul>
  <li>Hai bên cam kết thực hiện nghiêm túc các điều khoản của hợp đồng đặt cọc.</li>
  <li>Mọi tranh chấp phát sinh sẽ được giải quyết trước hết bằng thương lượng, nếu không đạt thỏa thuận sẽ đưa ra Tòa án có thẩm quyền giải quyết.</li>
  <li>Hợp đồng có hiệu lực kể từ ngày ký và được lập thành 02 bản gốc, mỗi bên giữ 01 bản, có giá trị pháp lý như nhau.</li>
</ul>

        <p><strong>5. Ghi chú:</strong> {contract.contractTerms}</p>

        <p><strong>Trạng thái:</strong>{" "}
  {contract.status === "approved" ? "✅ Đã duyệt" :
   contract.status === "rejected" ? "❌ Đã từ chối" :
   contract.status === "expired" ? "⏰ Đã hết hạn" :
   "⏳ Chờ duyệt"}
</p>
      </div>

      <button onClick={() => navigate(-1)} className="back-btn">🔙 Quay lại</button>
    </div>
  );
};

export default ContractDetail;
