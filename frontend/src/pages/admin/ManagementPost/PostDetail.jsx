import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    FaCheck,
    FaTimes,
    FaTrash,
    FaRulerCombined,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaStar,
    FaUser,
    FaEnvelope,
    FaPhone,
} from "react-icons/fa";

import { useAuth } from "../../../../context/authContext.jsx";
import {
    getPostByIdForAdmin,
    updatePostStatus,
    deletePostByAdmin,
    rejectPostByAdmin,
    verifyPostByAdmin,
} from "../../../service/postService.js";
import AdminDashboard from "../adminDashboard.jsx";

const AdminPostDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await getPostByIdForAdmin(id);
                if (res.data.success) {
                    setPost(res.data.data);
                    setMainImage(res.data.data.images?.[0]);
                } else {
                    toast.error("❌ Không tìm thấy bài đăng.");
                    navigate(-1);
                }
            } catch {
                toast.error("❌ Lỗi khi tải bài đăng.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id, navigate]);

    const handleApprove = async () => {
        try {
            await verifyPostByAdmin(id, { status: "approved" });
            toast.success("✅ Đã duyệt bài đăng.");
            navigate(-1);
        } catch {
            toast.error("❌ Lỗi duyệt bài đăng.");
        }
    };

    const handleReject = async () => {
        const reason = prompt("📌 Nhập lý do từ chối:");
        if (!reason) return;
        try {
            await rejectPostByAdmin(id, { status: "rejected", reasonreject: reason });
            toast.success("🚫 Đã từ chối bài đăng.");
            navigate(-1);
        } catch {
            toast.error("❌ Lỗi từ chối.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Xác nhận xoá bài đăng?")) return;
        try {
            await deletePostByAdmin(id);
            toast.success("🗑️ Đã xoá bài đăng.");
            navigate(-1);
        } catch {
            toast.error("❌ Lỗi xoá bài đăng.");
        }
    };

    if (loading) {
        return (
            <AdminDashboard>
                <div className="container py-5 text-center">🔄 Đang tải...</div>
            </AdminDashboard>
        );
    }

    if (!post) return null;

    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        post.location
    )}`;

    return (
        <AdminDashboard>
            <div className="container py-4">
                <button
                    type="button"
                    className="btn btn-secondary mb-3"
                    onClick={() => navigate(-1)}
                >
                    ← Quay lại
                </button>

                <div className="row g-4">
                    {/* Images */}
                    <div className="col-md-6">
                        <div className="card shadow-sm">
                            <img
                                src={mainImage || "https://via.placeholder.com/400x300"}
                                alt="main"
                                className="card-img-top"
                                style={{ height: "300px", objectFit: "cover" }}
                            />
                            <div className="card-body">
                                <div className="d-flex flex-wrap gap-2">
                                    {post.images?.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`thumb-${idx}`}
                                            className={`img-thumbnail ${img === mainImage ? "border-primary" : ""}`}
                                            style={{ width: 80, height: 60, cursor: "pointer" }}
                                            onClick={() => setMainImage(img)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="card-footer text-muted ">

                                <h6 className="fw-bold">👤 Thông tin liên hệ</h6>
                                <p>
                                    <FaUser /> {post.contactInfo?.name} <br />
                                    <FaPhone /> {post.contactInfo?.phone} <br />
                                    <FaEnvelope /> {post.contactInfo?.email} <br />
                                    <FaMapMarkerAlt /> {post.contactInfo?.address}
                                </p>
                            </div>
                            <div className="card-footer d-flex justify-content-between">
                                <button
                                    className="btn btn-success"
                                    onClick={handleApprove}
                                    disabled={post.status !== "pending"}
                                >
                                    <FaCheck /> {post.status === "approved" ? "Đã duyệt" : "Duyệt"}
                                </button>

                                <button
                                    className="btn btn-warning"
                                    onClick={handleReject}
                                    disabled={post.status !== "pending"}
                                >
                                    <FaTimes /> {post.status === "rejected" ? "Đã từ chối" : "Từ chối"}
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    disabled={post.isActive && post.status !== "rejected"}
                                >
                                    <FaTrash /> {post.status == "deleted" ? "Đã xoá" : "Xoá"}
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="col-md-6">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title text-primary">{post.title}</h4>
                                <h5 className="text-danger fw-bold mb-3">
                                    {post.price.toLocaleString("vi-VN")} VND
                                </h5>

                                <p>
                                    <FaRulerCombined /> <strong>Diện tích:</strong> {post.area} m²
                                </p>
                                <p>
                                    <FaMapMarkerAlt />{" "}
                                    <strong>Vị trí:</strong>{" "}
                                    <a href={mapsLink} target="_blank" rel="noopener noreferrer">
                                        {post.location}
                                    </a>
                                </p>
                                <p>
                                    <FaCalendarAlt />{" "}
                                    <strong>Ngày đăng:</strong>{" "}
                                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                                </p>
                                <p>
                                    <FaStar /> <strong>Gói:</strong>{" "}
                                    {post.postPackage?.type || "Standard"} (
                                    {post.postPackage?.price?.toLocaleString("vi-VN")} VND)
                                </p>

                                <p>
                                    <strong>Loại:</strong> {post.type}
                                </p>
                                <p>
                                    <strong>Property:</strong> {post.property}
                                </p>
                                <p>
                                    <strong>Mã căn hộ:</strong> {post.apartmentCode || "-"}
                                </p>
                                <p>
                                    <strong>Pháp lý:</strong> {post.legalDocument}
                                </p>
                                <p>
                                    <strong>Nội thất:</strong> {post.interiorStatus}
                                </p>
                                <p>
                                    <strong>Trạng thái:</strong>{" "}
                                    <span
                                        className={`badge ${post.status === "approved"
                                            ? "bg-success"
                                            : post.status === "pending"
                                                ? "bg-warning text-dark"
                                                : "bg-danger"
                                            }`}
                                    >
                                        {post.status}
                                    </span>
                                </p>
                                {/* <p>
                                    <strong>Thanh toán:</strong>{" "}
                                    <span
                                        className={`badge ${post.paymentStatus === "paid"
                                            ? "bg-success"
                                            : "bg-danger"
                                            }`}
                                    >
                                        {post.paymentStatus}
                                    </span>
                                </p>
                                <p>
                                    <strong>Hoạt động:</strong>{" "}
                                    <span
                                        className={`badge ${post.isActive ? "bg-success" : "bg-secondary"
                                            }`}
                                    >
                                        {post.isActive ? "Active" : "Inactive"}
                                    </span>
                                </p> */}

                                <hr />

                                <h6 className="fw-bold">📄 Mô tả</h6>
                                <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                                    {post.description}
                                </p>


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminDashboard>
    );
};

export default AdminPostDetail;
