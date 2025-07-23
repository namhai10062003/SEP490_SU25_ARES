import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ContractForm from "../../../../components/contractForm";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import { getPostById } from "../../../service/postService";

const BookingForm = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const hasWarned = useRef(false);
  const [post, setPost] = useState(null);
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    agreed: false,
  });
  const [showPreview, setShowPreview] = useState(false);

  const todayStr = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchPost = async () => {
      const res = await getPostById(postId);
      setPost(res.data.data);
    };
    fetchPost();
  }, [postId]);
  //set ten
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  //kiểm tra xem thử có cccd hay ko
  useEffect(() => {
    if (user && Object.keys(user).length > 0 && !hasWarned.current) {
      if (!user.identityNumber || !user.address) {
        toast.error("❌ Bạn cần cập nhật CMND/CCCD và địa chỉ trước khi tạo hợp đồng");
        hasWarned.current = true;

        setTimeout(() => {
          navigate("/profile");
        }, 1000); // ⏱ Chờ 3 giây rồi mới chuyển trang
      }
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.startDate || !form.endDate) {
      return toast.error("Vui lòng chọn đầy đủ ngày thuê");
    }
    if (!form.agreed) {
      return toast.error("Bạn cần đồng ý với điều khoản");
    }

    // open modal to preview
    setShowPreview(true);
  };

  const confirmBooking = async () => {
    const payload = {
      ...form,
      postId,
      userId: user._id,
      landlordId: post.contactInfo._id,
      fullNameB: user.name,
      cmndB: user.identityNumber,
      addressB: user.address,
      phoneB: user.phone,
      emailB: user.email,
      fullNameA: post.contactInfo.name,
      cmndA: post.contactInfo.identityNumber,
      addressA: post.contactInfo.address,
      phoneA: post.contactInfo.phone,
      emailA: post.contactInfo.email,
      depositAmount: Math.floor(post.price * 0.1),
      apartmentCode: post.apartmentCode,
      contractTerms: "Các điều khoản đã đính kèm trong hợp đồng.",
      status: "pending",
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/contracts`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("✅ Đã gửi yêu cầu đặt cọc!");
      navigate("/my-contracts");
    } catch {
      toast.error("❌ Lỗi khi gửi yêu cầu");
    }
  };

  if (!post) return <div className="text-center py-4">🔄 Đang tải dữ liệu...</div>;
  if (user._id === post.contactInfo?._id) {
    const handleLogout = () => {
      localStorage.clear();
      window.location.href = "/login";
    };

    return (
      <div className="bg-light min-vh-100">
        <Header user={user} name={name} logout={handleLogout} />
        <div className="container py-5">
          <div className="card shadow-sm text-center p-4">
            <div className="text-danger fs-4 mb-3">
              ⚠️ Bạn không thể đặt hợp đồng cho bài đăng của chính mình.
            </div>
            <p className="text-muted">
              Vui lòng quay lại và chọn bài đăng của người khác để đặt cọc.
            </p>
            <button
              type="button"
              className="btn btn-secondary mt-3"
              onClick={() => navigate(-1)}
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} />
      <div className="container py-5 my-4">
        <button
          type="button"
          className="btn btn-secondary mb-3"
          onClick={() => navigate(-1)}
        >
          ← Quay lại
        </button>
        <h2 className="text-center mb-4">Đặt cọc giữ chỗ</h2>
        <div className="card shadow-sm p-4">
          <h4 className="fw-bold text-primary mb-3">
            Mã căn hộ: {post.apartmentCode} <br />
            Địa chỉ: {post.location}
          </h4>
          <p>
            Giá thuê: <strong>{post.price.toLocaleString("vi-VN")} VNĐ/tháng</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Ngày bắt đầu</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.startDate}
                  min={todayStr()}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ngày kết thúc</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.endDate}
                  min={form.startDate || todayStr()}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="border p-2">
                  <h6>Bên A (Chủ nhà)</h6>
                  <p><strong>Họ tên:</strong> {post.contactInfo.name}</p>
                  <p><strong>SĐT:</strong> {post.contactInfo.phone}</p>
                  <p><strong>Địa chỉ:</strong> {post.contactInfo.address}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border p-2">
                  <h6>Bên B (Bạn)</h6>
                  <p><strong>Họ tên:</strong> {user.name}</p>
                  <p><strong>SĐT:</strong> {user.phone}</p>
                  <p><strong>Địa chỉ:</strong> {user.address}</p>
                </div>
              </div>
            </div>

            <div className="alert alert-info">
              Tiền đặt cọc:{" "}
              <strong>{Math.floor(post.price * 0.1).toLocaleString("vi-VN")} VNĐ</strong>
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
              />
              <label className="form-check-label">
                Tôi đồng ý với các điều khoản hợp đồng
              </label>
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-success px-4">
                GỬI YÊU CẦU ĐẶT CỌC
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Xem trước hợp đồng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ContractForm
            contractData={{
              startDate: form.startDate,
              endDate: form.endDate,
              depositAmount: Math.floor(post.price * 0.1),
              terms: "Các điều khoản đã đính kèm trong hợp đồng.",
            }}
            post={post}
            user={user}
            landlord={post.contactInfo}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={confirmBooking}>
            Xác nhận gửi yêu cầu
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingForm;
