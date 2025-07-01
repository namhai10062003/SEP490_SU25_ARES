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

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
  
        // 👉 Gọi API lấy hợp đồng
        const res = await axios.get(`http://localhost:4000/api/contracts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const contractData = res.data.data;
        setContract(contractData);
  
        // ✅ Gọi thêm thông tin bài đăng bằng postId (với API mới)
        if (contractData.postId) {
          const postRes = await axios.get(
            `http://localhost:4000/api/posts/postdetail/${contractData.postId}`,
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
        <ul>
  <li>Diện tích: <strong>{post?.area || "..."} m²</strong></li>
  <li>Giá thuê: <strong>{post?.price?.toLocaleString("vi-VN") || "..."} VNĐ/tháng</strong></li>
  <li>Thuộc dự án: <strong>{post?.property || "..."}</strong></li>
  <li>Pháp lý: <strong>{post?.legalDocument || "..."}</strong></li>
  <li>Nội thất: <strong>{post?.interiorStatus || "..."}</strong></li>
  <li>Tiện ích: <strong>{post?.amenities || "..."}</strong></li>
</ul>

<p><strong>2. Quyền và nghĩa vụ:</strong></p>

<p><strong>ĐIỀU 1: QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</strong></p>
<p><strong>1.1. Quyền của Bên A:</strong></p>
<ul>
  <li>Nhận đúng và đầy đủ tiền thuê từ Bên B như quy định tại Điều 3 Hợp đồng.</li>
  <li>Yêu cầu Bên B sửa chữa các hư hỏng và bồi thường thiệt hại do lỗi của Bên B gây ra.</li>
  <li>Đơn phương chấm dứt hợp đồng nếu Bên B:
    <ul>
      <li>Không trả tiền thuê căn hộ liên tiếp trong 2 tháng trở lên;</li>
      <li>Sử dụng căn hộ sai mục đích thỏa thuận;</li>
      <li>Cố ý làm hư hỏng căn hộ hoặc tài sản;</li>
      <li>Cho thuê lại căn hộ khi chưa có sự đồng ý;</li>
      <li>Vi phạm nội quy chung cư hoặc các thỏa thuận khác.</li>
    </ul>
  </li>
  <li>Yêu cầu Bên B bàn giao căn hộ khi hợp đồng chấm dứt.</li>
  <li>Thông báo chấm dứt hợp đồng trước ít nhất 1 tháng.</li>
</ul>

<p><strong>1.2. Nghĩa vụ của Bên A:</strong></p>
<ul>
  <li>Bàn giao căn hộ và trang thiết bị đúng như thỏa thuận tại Điều 1.</li>
  <li>Bảo đảm cho Bên B sử dụng căn hộ ổn định trong thời gian thuê.</li>
  <li>Đóng các loại thuế theo quy định pháp luật.</li>
</ul>

<p><strong>ĐIỀU 2: QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</strong></p>
<p><strong>2.1. Quyền của Bên B:</strong></p>
<ul>
  <li>Nhận bàn giao căn hộ và thiết bị như đã thỏa thuận.</li>
  <li>Đơn phương chấm dứt hợp đồng nếu Bên A:
    <ul>
      <li>Tăng giá thuê bất hợp lý;</li>
      <li>Làm hạn chế quyền sử dụng căn hộ do người thứ ba.</li>
    </ul>
  </li>
  <li>Thông báo chấm dứt hợp đồng trước ít nhất 1 tháng.</li>
</ul>

<p><strong>2.2. Nghĩa vụ của Bên B:</strong></p>
<ul>
  <li>Trả đủ tiền thuê đúng hạn.</li>
  <li>Sử dụng căn hộ đúng mục đích, sửa chữa khi gây hư hỏng.</li>
  <li>Tuân thủ nội quy chung cư, quy định vệ sinh, an ninh trật tự.</li>
</ul>


          <p><strong>3. Thanh toán:</strong></p>
          <ul>
            <li>Chuyển khoản hoặc tiền mặt mỗi tháng.</li>
            <li>Phí thuê bao gồm: [ ] điện, [ ] nước, [ ] internet, [ ] dịch vụ</li>
          </ul>
        <ul>
          <li>Tiền thuê thanh toán hàng tháng.</li>
          <li>Tiền đặt cọc: <strong>{contract.depositAmount?.toLocaleString("vi-VN")} VNĐ</strong></li>
        </ul>

        <p><strong>4. Điều khoản chấm dứt hợp đồng:</strong> Khi hết hạn hoặc hai bên thỏa thuận chấm dứt trước thời hạn.</p>

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
