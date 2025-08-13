import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import SignaturePopup from "../../../../components/SignaturePopup";
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
  const [showSignature, setShowSignature] = useState(false); // mở popup
  const [signaturePartyBUrl, setsignaturePartyBUrl] = useState(true); // lưu chữ ký base64
  // const [contract, setContract] = useState(null); // hoặc từ props, hoặc từ fetch
  const [post, setPost] = useState(null);
  const [form, setForm] = useState({
    // startDate: "",
    // endDate: "",
    agreed: false,
  });
  const [showPreview, setShowPreview] = useState(false);

  const todayStr = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  useEffect(() => {
    console.log("🌀 useEffect chạy với postId:", postId); // Kiểm tra postId có tồn tại không
  
    const fetchPost = async () => {
      try {
        const res = await getPostById(postId);
        console.log("✅ Dữ liệu trả về từ API:", res.data);
        setPost(res.data.data);
        
      } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err);
      }
    };
  
    if (postId) {
      fetchPost();
    } else {
      console.warn("⚠️ postId chưa có giá trị!");
    }
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

  // useEffect(() => {
  //   if (contract && contract._id) {
  //     setShowSignature(true); // chỉ mở popup khi contract đã sẵn sàng
  //   }
  // }, [contract]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // if (!form.startDate || !form.endDate) {
    //   return toast.error("Vui lòng chọn đầy đủ ngày thuê");
    // }
    // if (!form.agreed) {
    //   return toast.error("Bạn cần đồng ý với điều khoản");
    // }

    // open modal to preview
    setShowPreview(true);
  };

  // const createContract = async () => {
  //   try {
  //     const res = await axios.post("/api/contracts/create", { /* dữ liệu */ });
  //     const newContract = res.data.data;

  //     setContract(newContract); // Gán hợp đồng mới vào state

  //     // ✅ Sau khi có contract._id thì mới mở popup
  //     setShowSignature(true);
  //   } catch (err) {
  //     console.error("Lỗi tạo hợp đồng:", err);
  //   }
  // };
// thực hiện hàm lấy 2 type cho_thue vs ban

  const confirmBooking = async () => {
    
const contractTerms =
post.type === "cho_thue"
  ? "Các điều khoản hợp đồng cho thuê căn hộ..."
  : post.type === "ban"
  ? "Các điều khoản hợp đồng mua bán căn hộ..."
  : "Các điều khoản đã đính kèm trong hợp đồng.";
  
    if (
      !signaturePartyBUrl ||
      typeof signaturePartyBUrl !== "string" ||
      !signaturePartyBUrl.startsWith("data:image")
    ) {
      toast.warning("⚠️ Vui lòng ký tên trước khi xác nhận đặt cọc!");
      return;
    }
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
      contractTerms,
      status: "pending",
    };

    try {
      // 1. Gửi API tạo hợp đồng

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/contracts`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const contractId = res.data?.data?._id;
      console.log(contractId);
      if (!contractId) {
        throw new Error("Không nhận được ID hợp đồng từ server");
      }

      // 2. Nếu đã ký, thì upload chữ ký
      if (signaturePartyBUrl && signaturePartyBUrl.startsWith("data:image")) {
        const blob = await (await fetch(signaturePartyBUrl)).blob();
        const file = new File([blob], "signaturePartyBUrl.png", { type: "image/png" });

        const formData = new FormData();
        formData.append("signaturePartyBUrl", file); // ✅ đúng tên key backend mong muốn
        formData.append("contractId", contractId);

        console.log("⬇️ FormData đang gửi:");
for (let pair of formData.entries()) {
  if (pair[1] instanceof File) {
    console.log(`${pair[0]}:`, pair[1].name, pair[1].type, pair[1].size + " bytes");
  } else {
    console.log(`${pair[0]}:`, pair[1]);
  }
}

        console.log("📤 Đang upload chữ ký với các thông tin:");
        console.log("contractId:", contractId);
        console.log("side:", "B");
        console.log("file:", file);

        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/contracts/upload-signature`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      toast.success("✅ Đã gửi yêu cầu đặt cọc!");
      navigate("/my-contracts");
    } catch (error) {
      console.error(error);
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
          {post.type === "cho_thue" && (
  <p>
    Giá thuê: <strong>{post.price?.toLocaleString("vi-VN")} VNĐ/tháng</strong>
  </p>
)}

{post.type === "ban" && (
  <p>
    Giá bán: <strong>{post.price?.toLocaleString("vi-VN")} VNĐ</strong>
  </p>
)}


          <form onSubmit={handleSubmit}>
            {/* <div className="row mb-3">
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
            </div> */}

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

            {/* <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
              />
              <label className="form-check-label">
                Tôi đồng ý với các điều khoản hợp đồng
              </label>
            </div> */}

            <div className="text-center">
              <button type="submit" className="btn btn-success px-4">
                GỬI YÊU CẦU ĐẶT CỌC
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal xem trước hợp đồng */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Xem trước hợp đồng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ContractForm
            contractData={{
              // startDate: form.startDate,
              // endDate: form.endDate,
              depositAmount: Math.floor(post.price * (post.type === "ban" ? 0.01 : 0.1)),
              terms:
      post.type === "cho_thue"
        ? "Các điều khoản hợp đồng cho thuê căn hộ..."
        : post.type === "ban"
        ? "Các điều khoản hợp đồng mua bán căn hộ..."
        : "Các điều khoản đã đính kèm trong hợp đồng.",

              signaturePartyBUrl: signaturePartyBUrl, // chữ ký
            }}
            post={post}
            user={user}
            landlord={post.contactInfo}
            signaturePartyBUrl={signaturePartyBUrl}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={() => setShowSignature(true)}>
            Ký hợp đồng
          </Button>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={confirmBooking}>
            Xác nhận gửi yêu cầu
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Popup ký chữ ký */}
      {(
        <SignaturePopup
          show={showSignature}
          onClose={() => setShowSignature(false)}
          onSave={(base64Signature) => {
            setsignaturePartyBUrl(base64Signature); // lưu base64 local
            setShowSignature(false);
          }}
          side="B"
        />
      )}
    </div>
  );
};

export default BookingForm;
