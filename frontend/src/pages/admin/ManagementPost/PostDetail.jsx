import React, { useEffect, useState } from "react";
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaCheck,
    FaEnvelope,
    FaMapMarkerAlt,
    FaPhone,
    FaRulerCombined,
    FaStar,
    FaTimes,
    FaTrash,
    FaUser,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import EditHistoryModal from "../../../../components/showHistory.jsx";
import { useAuth } from "../../../../context/authContext.jsx";
import { formatCurrency } from "../../../../utils/format.jsx";
import {
    deletePostByAdmin,
    getPostByIdForAdmin,
    getPostHistoryByPostId,
    rejectPostByAdmin,
    verifyPostByAdmin
} from "../../../service/postService.js";
import AdminDashboard from "../adminDashboard.jsx";

// Simple Modal 
const SimpleModal = ({
    show,
    onHide,
    title,
    children,
    size = "md",
    backdrop = true,
    keyboard = true,
}) => {
    // Prevent background scroll when modal is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [show]);

    if (!show) return null;

    let maxWidth = 600;
    if (size === "sm") maxWidth = 400;
    else if (size === "lg") maxWidth = 900;
    else if (size === "xl") maxWidth = 1140;

    const handleBackdropClick = (e) => {
        if (backdrop && e.target.classList.contains("simple-modal-backdrop")) {
            if (keyboard) onHide();
        }
    };

    return (
        <div
            className="simple-modal-backdrop"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 1050,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            onClick={handleBackdropClick}
        >
            <div
                className="modal-dialog"
                style={{
                    maxWidth,
                    width: "100%",
                }}
            >
                <div
                    className="modal-content"
                    style={{
                        borderRadius: 16,
                        background: "#fff",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                        padding: 0,
                        border: "none",
                        minWidth: 0,
                    }}
                >
                    <div
                        className="modal-header"
                        style={{
                            borderBottom: "1px solid #f0f0f0",
                            padding: "20px 24px 12px 24px",
                            background: "#f8f9fa",
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                        }}
                    >
                        <h5 className="modal-title" style={{ fontWeight: 600 }}>{title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={onHide}
                            style={{ outline: "none", boxShadow: "none" }}
                        ></button>
                    </div>
                    <div style={{ padding: "24px" }}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminPostDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(null);
    const [history, setHistory] = useState([]);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const isApproveDisabled =
    post?.isEditing ||
    post?.status === "deleted" ||
    ["approved", "rejected"].includes(post?.status);
  
  const isRejectDisabled =
    post?.isEditing ||
    post?.status === "deleted" ||
    ["approved", "rejected"].includes(post?.status);
  
  const isDeleteDisabled =
    post?.isEditing || post?.status === "deleted";
    useEffect(() => {
        const fetchPostAndHistory = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục.");
                    return navigate("/login");
                }
    
                // Lấy bài đăng
                const res = await getPostByIdForAdmin(id);
                if (!res?.data?.success || !res.data.data) {
                    toast.error("❌ Không tìm thấy bài đăng.");
                    return navigate(-1);
                }
                setPost(res.data.data);
                setMainImage(res.data.data.images?.[0]);
    
                // Lấy lịch sử chỉnh sửa
                const historyRes = await getPostHistoryByPostId(id); 
                // historyRes ở đây đã là response.data trả từ axios
                if (historyRes?.success && historyRes.data) {
                    setHistory(historyRes.data);
                } else {
                    toast.error("⚠️ Không thể lấy lịch sử chỉnh sửa");
                }
                  
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                toast.error("❌ Lỗi khi tải bài đăng.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
    
        if (id) fetchPostAndHistory();
    }, [id, navigate]);
    

    const handleApprove = async () => {
        try {
            await verifyPostByAdmin(id);
            toast.success("✅ Đã duyệt bài đăng.");
            navigate(-1);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || "❌ Lỗi duyệt bài đăng.";
            toast.error(errorMessage);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error("❌ Vui lòng nhập lý do từ chối.");
            return;
        }

        try {
            await rejectPostByAdmin(id, { status: "rejected", reasonreject: rejectReason });
            toast.success("🚫 Đã từ chối bài đăng.");
            setShowRejectModal(false);
            setRejectReason("");
            navigate(-1);
        } catch {
            toast.error("❌ Lỗi từ chối.");
        }
    };

    const handleDelete = async () => {
        try {
            await deletePostByAdmin(id, { status: "deleted" });
            toast.success("🗑️ Đã xoá bài đăng.");
            setShowDeleteModal(false);
            navigate(-1);
        } catch {
            toast.error("❌ Lỗi xoá bài đăng.");
        }
    };

    if (loading) {
        return (
            <AdminDashboard>
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">🔄 Đang tải...</p>
                </div>
            </AdminDashboard>
        );
    }

    if (!post) return null;

    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        post.location
    )}`;

    return (
        <AdminDashboard>
            <div className="container-fluid py-4">
                {/* Back Button */}
                <button
                    type="button"
                    className="btn btn-light mb-4 d-flex align-items-center gap-2"
                    onClick={() => navigate(-1)}
                    style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '8px 16px'
                    }}
                >
                    <FaArrowLeft /> Quay lại
                </button>

                <div className="row g-4">
                    {/* Left Column - Media and Contact Info */}
                    <div className="col-lg-8">
                        {/* Main Image Section */}
                        <div className="card shadow-sm mb-4" style={{ borderRadius: '12px', border: 'none' }}>
                            <div className="position-relative">
                                <img
                                    src={mainImage || "https://via.placeholder.com/600x400"}
                                    alt="main"
                                    className="w-100"
                                    style={{
                                        height: "400px",
                                        objectFit: "cover",
                                        borderTopLeftRadius: '12px',
                                        borderTopRightRadius: '12px'
                                    }}
                                />
                            </div>

                            {/* Thumbnail Gallery */}
                            {post.images && post.images.length > 1 && (
                                <div className="p-3">
                                    <div className="d-flex gap-2 overflow-auto">
                                        {post.images?.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`thumb-${idx}`}
                                                className={`img-thumbnail ${img === mainImage ? "border-primary" : ""}`}
                                                style={{
                                                    width: 80,
                                                    height: 60,
                                                    cursor: "pointer",
                                                    borderRadius: '6px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => setMainImage(img)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Edit History Link */}
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <EditHistoryModal history={history} />
                        </div>

                        {/* Contact Information */}
                        <div className="card shadow-sm mb-4" style={{ borderRadius: '12px', border: 'none' }}>
                            <div className="card-body">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <FaUser className="text-primary" /> Thông tin liên hệ
                                </h6>
                                <div className="row">
                                    <div className="col-md-6">
                                        <p className="mb-2 d-flex align-items-center gap-2">
                                            <FaUser className="text-muted" style={{ width: '16px' }} />
                                            <span className="fw-medium">{post.contactInfo?.name}</span>
                                        </p>
                                        <p className="mb-2 d-flex align-items-center gap-2">
                                            <FaPhone className="text-muted" style={{ width: '16px' }} />
                                            <span>{post.contactInfo?.phone}</span>
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="mb-2 d-flex align-items-center gap-2">
                                            <FaEnvelope className="text-muted" style={{ width: '16px' }} />
                                            <span>{post.contactInfo?.email}</span>
                                        </p>
                                        <p className="mb-2 d-flex align-items-center gap-2">
                                            <FaMapMarkerAlt className="text-muted" style={{ width: '16px' }} />
                                            <span>{post.contactInfo?.address}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-3 justify-content-center">
                        <button
  className="btn btn-success px-4 py-2 d-flex align-items-center gap-2"
  onClick={handleApprove}
  style={{
    borderRadius: '8px',
    fontWeight: '500',
    minWidth: '120px'
  }}
  disabled={isApproveDisabled}
>
  <FaCheck /> {post?.status === "approved" ? "Đã duyệt" : "Duyệt"}
</button>

<button
  className="btn btn-warning px-4 py-2 d-flex align-items-center gap-2"
  onClick={() => setShowRejectModal(true)}
  style={{
    borderRadius: '8px',
    fontWeight: '500',
    minWidth: '120px'
  }}
  disabled={isRejectDisabled}
>
  <FaTimes /> {post?.status === "rejected" ? "Đã từ chối" : "Từ chối"}
</button>

<button
  className="btn btn-danger px-4 py-2 d-flex align-items-center gap-2"
  onClick={() => setShowDeleteModal(true)}
  style={{
    borderRadius: '8px',
    fontWeight: '500',
    minWidth: '120px'
  }}
  disabled={isDeleteDisabled}
>
  <FaTrash /> {post?.status === "deleted" ? "Đã xoá" : "Xoá"}
</button>
                        </div>
                    </div>

                    {/* Right Column - Property Details */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm" style={{ borderRadius: '12px', border: 'none' }}>
                            <div className="card-body">
                                <h4 className="card-title text-primary mb-3">{post.title}</h4>

                                {/* Price */}
                                <div className="mb-4">
                                    <div className="text-muted small mb-1">Giá</div>
                                    <h3 className="text-danger fw-bold mb-0">
                                        {formatCurrency(post.price)}
                                    </h3>
                                </div>

                                {/* Property Details */}
                                <div className="space-y-3">
                                    <div className="d-flex align-items-center gap-3 py-2">
                                        <FaRulerCombined className="text-muted" style={{ width: '16px' }} />
                                        <div>
                                            <div className="fw-medium">Diện tích</div>
                                            <div className="text-muted">{post.area} m²</div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-3 py-2">
                                        <FaMapMarkerAlt className="text-muted" style={{ width: '16px' }} />
                                        <div>
                                            <div className="fw-medium">Vị trí</div>
                                            <div className="text-muted">{post.location}</div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-3 py-2">
                                        <FaCalendarAlt className="text-muted" style={{ width: '16px' }} />
                                        <div>
                                            <div className="fw-medium">Ngày đăng</div>
                                            <div className="text-muted">
                                                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-3 py-2">
                                        <FaStar className="text-muted" style={{ width: '16px' }} />
                                        <div>
                                            <div className="fw-medium">Gói VIP</div>
                                            <div className="text-muted">
                                                ({formatCurrency(post.postPackage?.price)})
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-3 py-2">
                                        <div className="text-muted" style={{ width: '16px' }}></div>
                                        <div>
                                            <div className="fw-medium">Loại tin</div>
                                            <div className="text-muted">{post.type || '-'}</div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-3 py-2">
                                        <div className="text-muted" style={{ width: '16px' }}></div>
                                        <div>
                                            <div className="fw-medium">Property</div>
                                            <div className="text-muted">{post.property}</div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-3 py-2">
                                        <div className="text-muted" style={{ width: '16px' }}></div>
                                        <div>
                                            <div className="fw-medium">Mã căn hộ</div>
                                            <div className="text-muted">{post.apartmentCode || '-'}</div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-3 py-2">
                                        <div className="text-muted" style={{ width: '16px' }}></div>
                                        <div>
                                            <div className="fw-medium">Pháp lý</div>
                                            <div className="text-muted">{post.legalDocument}</div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-3 py-2">
                                        <div className="text-muted" style={{ width: '16px' }}></div>
                                        <div>
                                            <div className="fw-medium">Nội thất</div>
                                            <div className="text-muted">{post.interiorStatus}</div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-3 py-2">
                                        <div className="text-muted" style={{ width: '16px' }}></div>
                                        <div>
                                            <div className="fw-medium">Trạng thái</div>
                                            <span
                                                className={`badge ${post.status === "approved"
                                                    ? "bg-success"
                                                    : post.status === "pending"
                                                        ? "bg-warning text-dark"
                                                        : "bg-danger"
                                                    }`}
                                                style={{ borderRadius: '20px', padding: '6px 12px' }}
                                            >
                                                {post.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <hr className="my-4" />
                                <div>
  <h6 className="fw-bold mb-3">📄 Mô tả</h6>
  <p className="text-muted" style={{
      whiteSpace: "pre-line",
      lineHeight: '1.6',
      fontSize: '14px'
  }}>
    {post.description
      ? post.description.replace(/<[^>]*>/g, '')  // Loại bỏ hết thẻ HTML
      : 'Không có mô tả'}
  </p>
</div>


                                {post.isEditing && (
                                    <div className="alert alert-warning mt-3" role="alert">
                                        <strong>⚠️ Lưu ý:</strong> Người dùng đang chỉnh sửa bài viết này!
                                        Không thể duyệt cho đến khi họ hoàn tất.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            <SimpleModal
                show={showRejectModal}
                onHide={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                }}
                title="Từ chối bài đăng"
                size="md"
                backdrop={true}
                keyboard={true}
            >
                <div>
                    <p className="text-muted mb-3">
                        Vui lòng nhập lý do từ chối bài đăng này:
                    </p>
                    <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Nhập lý do từ chối..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        style={{ resize: 'vertical' }}
                    />
                    <div
                        className="d-flex justify-content-end gap-2 mt-4"
                    >
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowRejectModal(false);
                                setRejectReason("");
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            className="btn btn-warning"
                            onClick={handleReject}
                        >
                            Từ chối
                        </button>
                    </div>
                </div>
            </SimpleModal>

            {/* Delete Confirmation Modal */}
            <SimpleModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                title="Xác nhận xóa"
                size="sm"
                backdrop={true}
                keyboard={true}
            >
                <div>
                    <p className="text-danger mb-0">
                        <strong>⚠️ Cảnh báo:</strong> Bạn có muốn xóa bài post này không?
                        Hành động này không thể hoàn tác.
                    </p>
                    <div
                        className="d-flex justify-content-end gap-2 mt-4"
                    >
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Không
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDelete}
                        >
                            Có, xóa
                        </button>
                    </div>
                </div>
            </SimpleModal>

        </AdminDashboard>
    );
};

export default AdminPostDetail;