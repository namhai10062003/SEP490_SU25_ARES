import React, { useState, useEffect } from "react";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import {
  getAllPosts,
  updatePostStatus,
  deletePost,
} from "../../../service/postService";
import { Link } from "react-router-dom";
import AdminDashboard from "../adminDashboard.jsx";

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);

  const postStatusOptions = [
    { value: "pending", label: "Chờ duyệt" },
    { value: "approved", label: "Duyệt" },
    { value: "rejected", label: "Từ chối" },
  ];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await getAllPosts();
      setPosts(response.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const getOptionsByStatus = (currentStatus) => {
    if (currentStatus === "pending") return postStatusOptions;
    return postStatusOptions.filter((opt) => opt.value !== "pending");
  };

  const handleStatusChange = async (postId, value) => {
    try {
      if (value === "rejected") {
        setSelectedPostId(postId);
        setShowRejectModal(true);
        return;
      } else {
        const response = await updatePostStatus(postId, { status: value });
        if (response.data.success) {
          alert("Trạng thái đã được cập nhật");
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === postId ? { ...post, status: value } : post
            )
          );
        } else {
          alert("Cập nhật trạng thái không thành công!");
        }
      }
    } catch (error) {
      console.error("Error changing post status:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }
    try {
      const response = await updatePostStatus(selectedPostId, {
        status: "rejected",
        rejectReason: rejectReason.trim(),
      });
      if (response.data.success) {
        alert("Từ chối bài đăng thành công!");
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === selectedPostId
              ? {
                ...post,
                status: "rejected",
                rejectReason: rejectReason.trim(),
              }
              : post
          )
        );
        handleRejectCancel();
      } else {
        alert("Cập nhật trạng thái không thành công!");
      }
    } catch (error) {
      console.error("Error rejecting post:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectReason("");
    setSelectedPostId(null);
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) {
      try {
        const response = await deletePost(postId);
        if (response.data.success) {
          alert("Bài đăng đã được xóa!");
          setPosts(posts.filter((post) => post._id !== postId));
        } else {
          alert("Bài đăng xóa không thành công!");
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Có lỗi xảy ra khi xóa bài đăng!");
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <AdminDashboard>
      <div className="container py-4">
        <div className="bg-primary text-white rounded-4 p-3 mb-4 text-center">
          <h2 className="mb-0">Quản Lí Bài Đăng</h2>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2"></div>
            <div>Đang tải dữ liệu...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="alert alert-info text-center">Không có bài đăng nào</div>
        ) : (
          <div className="row g-4">
            {posts.map((post, index) => (
              <div className="col-12" key={post._id}>
                <div className="card shadow-sm rounded-4 border-0">
                  <div className="card-body d-flex flex-column flex-md-row align-items-md-center gap-3">
                    {/* Post Number */}
                    <div className="bg-light border rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, fontSize: 18 }}>
                      {index + 1}
                    </div>
                    {/* Post Image */}
                    <div className="me-3" style={{ width: 90, height: 70 }}>
                      {post.images && post.images[0] ? (
                        <img
                          src={post.images[0]}
                          alt="Post"
                          className="img-fluid rounded"
                          style={{ width: 90, height: 70, objectFit: "cover" }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="bg-secondary text-white d-flex align-items-center justify-content-center rounded" style={{ width: 90, height: 70, fontSize: 13 }}>
                          No Image
                        </div>
                      )}
                    </div>
                    {/* Post Info */}
                    <div className="flex-grow-1">
                      <div className="fw-bold mb-1">
                        {post.type === "ban"
                          ? "Bán"
                          : post.type === "dich_vu"
                            ? "Cho thuê"
                            : post.type}{" "}
                        - {post.title}
                      </div>
                      <div className="text-secondary mb-1" style={{ fontSize: 15 }}>
                        {post.location} • {post.area}m² • {formatPrice(post.price)}{" "}
                        {post.type === "ban" ? "triệu" : "triệu/tháng"}
                      </div>
                      <div className="small text-muted mb-1">
                        Liên hệ: {post.contactInfo?.name} - {post.contactInfo?.phone}
                      </div>
                      <div className="small text-muted mb-1">
                        Ngày đăng: {formatDate(post.createdAt)}
                      </div>
                      <div>
                        <span className={`badge me-2 ${post.status === "pending"
                          ? "bg-warning text-dark"
                          : post.status === "approved"
                            ? "bg-success"
                            : post.status === "rejected"
                              ? "bg-danger"
                              : "bg-secondary"
                          }`}>
                          {post.status === "pending"
                            ? "Chờ duyệt"
                            : post.status === "approved"
                              ? "Đã duyệt"
                              : post.status === "rejected"
                                ? "Từ chối"
                                : post.status}
                        </span>
                        <span className={`badge ${post.paymentStatus === "unpaid"
                          ? "bg-danger"
                          : "bg-success"
                          }`}>
                          {post.paymentStatus === "unpaid"
                            ? "Chưa thanh toán"
                            : "Đã thanh toán"}
                        </span>
                      </div>
                      {post.status === "rejected" && post.rejectReason && (
                        <div className="text-danger fst-italic mt-1 small">
                          📝 Lý do từ chối: {post.rejectReason}
                        </div>
                      )}
                    </div>
                    {/* Action Buttons */}
                    <div className="d-flex flex-column gap-2 align-items-end">
                      <select
                        value={post.status}
                        disabled={!["pending", "rejected"].includes(post.status)}
                        onChange={(e) =>
                          handleStatusChange(post._id, e.target.value)
                        }
                        className="form-select mb-2"
                        style={{ minWidth: 140 }}
                      >
                        {getOptionsByStatus(post.status).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="btn btn-danger"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
                {/* Modal từ chối */}
                {showRejectModal && selectedPostId === post._id && (
                  <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Từ chối bài đăng</h5>
                          <button type="button" className="btn-close" onClick={handleRejectCancel}></button>
                        </div>
                        <div className="modal-body">
                          <label htmlFor="rejectReason" className="form-label">Lý do từ chối:</label>
                          <textarea
                            id="rejectReason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do từ chối bài đăng..."
                            rows="4"
                            className="form-control"
                          />
                        </div>
                        <div className="modal-footer">
                          <button
                            className="btn btn-secondary"
                            onClick={handleRejectCancel}
                            type="button"
                          >
                            Hủy
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={handleRejectConfirm}
                            type="button"
                          >
                            Xác nhận từ chối
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminDashboard>
  );
};

export default PostManagement;