import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import { getPostById } from "../../../service/postService";
import "./bookingForm.css";
const BookingForm = () => {
  const { postId } = useParams();
  const { user, loading } = useAuth(); // ✅ Thêm loading
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    agreed: false,
  });
  
// Hàm lấy ngày hôm nay dạng yyyy-MM-dd (theo UTC)
const getToday = () => {
  const today = new Date();
  return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};
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
// hàm thay đổi ngày 
// useEffect(() => {
//   if (form.startDate) {
//     const autoEnd = getEndDateAuto(form.startDate, 3); // Có thể đổi thành 7 nếu bạn muốn
//     setForm((prev) => ({
//       ...prev,
//       endDate: autoEnd,
//     }));
//   }
// }, [form.startDate]);
useEffect(() => {
  // Nếu startDate sau endDate thì auto cập nhật endDate bằng startDate
  if (form.endDate < form.startDate) {
    setForm(prev => ({ ...prev, endDate: form.startDate }));
  }
}, [form.startDate]);
  useEffect(() => {
    const fetchPost = async () => {
      const res = await getPostById(postId);
      setPost(res.data.data);
    };
    fetchPost();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!form.startDate || !form.endDate || form.startDate > form.endDate) {
    //   return toast.error("❌ Vui lòng chọn ngày hợp lệ");
    // }
    if (!form.startDate || !form.endDate) {
      return toast.error("❌ Vui lòng chọn đầy đủ ngày thuê");
    }
    
    if (form.startDate >= form.endDate) {
      return toast.error("❌ Ngày kết thúc phải sau ngày bắt đầu ít nhất 1 ngày");
    }
    try {
      const deposit = Math.floor(post.price * 0.1);
  
      const payload = {
        ...form,
        postId,
        userId: user._id,
        landlordId: post.contactInfo?._id,
        fullNameB: user.name,
        cmndB: user.identityNumber,
        addressB: user.address,
        phoneB: user.phone,
        fullNameA: post.contactInfo?.name,
        cmndA: post.contactInfo?.identityNumber,
        addressA: post.contactInfo?.address,
        phoneA: post.contactInfo?.phone,
        contractTerms: "Các điều khoản đã đính kèm trong hợp đồng.",
        depositAmount: deposit,
        status: "pending", // ✅ Thêm trạng thái khởi tạo là chờ duyệt
      };
  
      await axios.post(`${import.meta.env.VITE_API_URL}/api/contracts`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      toast.success("✅ Đã tạo hợp đồng thành công!");
      navigate("/my-contracts");
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi tạo hợp đồng");
    }
   
  };
  

  // ✅ Nếu đang loading user hoặc post thì hiển thị chờ
  if (loading || !post) return <p>🔄 Đang tải dữ liệu...</p>;
// ❌ Nếu người dùng là chủ bài đăng → không cho booking
if (user._id === post.contactInfo?._id) {
    return (
      <div className="contract-container">
        <Header
          user={user}
          name={user?.name}
          logout={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        />
        <div className="error-message">
          ⚠️ Bạn không thể đặt hợp đồng cho bài đăng của chính mình.
        </div>
        <button
  type="button"
  className="back-btn"
  onClick={() => navigate(-1)} // 🔙 Quay lại trang trước
>
  ← Quay lại
</button>
      </div>
    );
  }
  const today = new Date();

  return (
    <div className="contract-container">
      <Header
        user={user}
        name={user?.name}
        logout={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      />
      <h2 className="contract-header">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
      <p className="contract-sub">Độc lập - Tự do - Hạnh phúc</p>
      <hr className="contract-line" />
      <h3 className="contract-title">HỢP ĐỒNG ĐẶT CỌC GIỮ CHỖ CĂN HỘ / BẤT ĐỘNG SẢN</h3>
      <p className="contract-date">
        Hôm nay, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()} tại TP. Đà Nẵng
      </p>

      <form onSubmit={handleSubmit}>
        {/* Bên A */}
        <section className="party-section">
          <h4><strong>BÊN CHO THUÊ (Bên A)</strong></h4>
          <div className="input-line"><label>Họ và tên:</label> <span>{post.contactInfo?.name || "..."}</span></div>
          <div className="input-line"><label>CMND/CCCD:</label> <span>{post.contactInfo?.identityNumber || "..."}</span></div>
          <div className="input-line"><label>Địa chỉ:</label> <span>{post.contactInfo?.address || "..."}</span></div>
          <div className="input-line"><label>Số điện thoại:</label> <span>{post.contactInfo?.phone || "..."}</span></div>
        </section>

        {/* Bên B */}
        <section className="party-section">
          <h4><strong>BÊN THUÊ (Bên B)</strong></h4>
          <div className="input-line"><label>Họ và tên:</label> <span>{user?.name || "..."}</span></div>
          <div className="input-line"><label>CMND/CCCD:</label> <span>{user?.identityNumber || "..."}</span></div>
          <div className="input-line"><label>Địa chỉ:</label> <span>{user?.address || "..."}</span></div>
          <div className="input-line"><label>Số điện thoại:</label> <span>{user?.phone || "..."}</span></div>
        </section>

        {/* Thời gian thuê */}
        <section className="rental-dates">
  <h4><strong>THỜI GIAN THUÊ</strong></h4>
  <div className="input-line">
    <label>Từ ngày:</label>
    <input
      type="date"
      value={form.startDate}
      min={getToday()}
      onChange={(e) =>
        setForm((prev) => ({ ...prev, startDate: e.target.value }))
      }
    />
  </div>
  <div className="input-line">
    <label>Đến ngày:</label>
    <input
      type="date"
      value={form.endDate}
      min={form.startDate}
      onChange={(e) =>
        setForm((prev) => ({ ...prev, endDate: e.target.value }))
      }
    />
  </div>
</section>

        {/* Điều khoản */}
        <h3 className="contract-subtitle">📌 ĐIỀU KHOẢN HỢP ĐỒNG</h3>
        <div className="contract-terms">
          <p><strong>1. Đối tượng hợp đồng:</strong></p>
          <p>Cho thuê căn hộ tại địa chỉ: <strong>{post?.location || "..."}</strong></p>
          <ul>
            <li>Diện tích: <strong>{post?.area || "..."}</strong> m²</li>
            <li>Giá thuê: <strong>{post?.price?.toLocaleString("vi-VN") || "..."} VNĐ/tháng</strong></li>
            <li>Thuộc dự án: <strong>{post?.property || "..."}</strong></li>
            <li>Pháp lý: <strong>{post?.legalDocument || "..."}</strong></li>
            <li>Nội thất: <strong>{post?.interiorStatus || "..."}</strong></li>
            <li>Phương hướng: <strong>{post?.amenities || "..."}</strong></li>
          </ul>

          <p><strong>2. Mục đích và nội dung đặt cọc:</strong></p>
<ul>
  <li>Bên B đồng ý đặt cọc để giữ chỗ cho việc mua bán / cho thuê bất động sản được nêu tại Điều 1.</li>
  <li>Số tiền đặt cọc: <strong>{post?.price ? `${(post.price * 0.1).toLocaleString("vi-VN")} VNĐ` : "..."}</strong></li>
  {/* <li>Hình thức thanh toán: [ ] Tiền mặt &nbsp;&nbsp; [ ] Chuyển khoản</li> */}
  <li>
  Thời hạn giữ chỗ: từ ngày <strong>{formatVNDate(form.startDate)}</strong> 
  đến ngày <strong>{getAutoEndDateVN(form.startDate)}</strong>
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
        </div>

        {/* Checkbox */}
        <div className="agreement">
          <input
            type="checkbox"
            checked={form.agreed}
            onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
          />
          <span>Tôi đồng ý với các điều khoản hợp đồng</span>
        </div>

        <button type="submit" className="submit-btn">TẠO HỢP ĐỒNG</button>
      </form>
    </div>
  );
};

export default BookingForm;
