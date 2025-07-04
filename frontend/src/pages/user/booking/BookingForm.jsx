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
      <h3 className="contract-title">HỢP ĐỒNG THUÊ CĂN HỘ CHUNG CƯ</h3>
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

          <p><strong>4. Đặt cọc:</strong> {post?.price ? `${(post.price * 0.1).toLocaleString("vi-VN")} VNĐ` : "..."}</p>
          <p><strong>5. Quyền và nghĩa vụ:</strong></p>
          <ul>
            <li>Bên A bàn giao đúng hạn, đúng hiện trạng.</li>
            <li>Bên B không tự ý chuyển nhượng, sửa chữa căn hộ.</li>
          </ul>

          <p><strong>6. Chấm dứt hợp đồng:</strong> Khi hết hạn hoặc hai bên thỏa thuận.</p>
          <p><strong>7. Cam kết:</strong> Hợp đồng có hiệu lực từ ngày ký, lập thành 02 bản, mỗi bên giữ 01 bản.</p>
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
