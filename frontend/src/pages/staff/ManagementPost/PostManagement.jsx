import React, { useState, useEffect } from "react";
import "./PostManagement.css";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import {
  getAllPosts,
  updatePostStatus,
  deletePost,
} from "../../../service/postService";
import { Link } from "react-router-dom";
const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [updatingPostId, setUpdatingPostId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Mock data từ API response
  const postStatusOptions = [
    { value: "pending", label: "Chờ duyệt" },
    { value: "approved", label: "Duyệt" },
    { value: "rejected", label: "Từ chối" },
  ];
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await getAllPosts();
      setPosts(response.data.data); // <-- phải là JSON
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };
  // Simulate API call
  useEffect(() => {
    fetchPosts();
  }, []);

  const getOptionsByStatus = (currentStatus) => {
    if (currentStatus === "pending") return postStatusOptions; // hiện cả 3 lựa chọn
    return postStatusOptions.filter((opt) => opt.value !== "pending"); // không cho quay lại
  };

  // Thay thế handleStatusChange
  const handleStatusChange = async (postId, value) => {
    try {
      if (value === "rejected") {
        // Mở popup thay vì dùng prompt
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

  // Thêm function xử lý reject
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

  // Handle delete post
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

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="post-management">
      <div className="bg-info p-3 text-white" style={{ width: "250px", height: "100%" }}>
        <h5 className="fw-bold">ADMIN PANEL</h5>
        <ul className="list-unstyled mt-3">
          <li>
            <Link
              to="/admin/reports"
              className="text-white text-decoration-none d-block py-1"
            >
              • Quản lí bài Report
            </Link>
          </li>
          <li>
            <Link
              to="/admin/create-account"
              className="text-white text-decoration-none d-block py-1"
            >
              • Tạo tài khoản
            </Link>
          </li>
          <li>
            <Link
              to="/admin/posts"
              className="text-white text-decoration-none d-block py-1"
            >
              • Quản lí bài Post
            </Link>
          </li>
          <li>
            <Link
              to="/admin/revenue"
              className="text-white text-decoration-none d-block py-1"
            >
              • Phân tích doanh thu
            </Link>
          </li>
          <li>
            <Link
              to="/admin/notifications"
              className="text-white text-decoration-none d-block py-1"
            >
              • Gửi thông báo
            </Link>
          </li>
          <li>
            <Link
              to="/admin-dashboard/manage-user"
              className="text-white text-decoration-none d-block py-1"
            >
              • Quản lí User
            </Link>
          </li>
          <li>
            <Link
              to="/admin-dashboard/manage-staff"
              className="text-white text-decoration-none d-block py-1"
            >
              • Quản lí Staff
            </Link>
          </li>
          <li>
            <Link
              to="/admin-dashboard/manage-apartment"
              className="text-white text-decoration-none d-block py-1"
            >
              • Quản lí Căn hộ
            </Link>
          </li>
        </ul>
      </div>
      <div className="main-content">
        <div className="header2">
          <h2>Quản Lí Bài Đăng</h2>
        </div>

        {/* Post List */}
        <div className="post-list">
          {posts.map((post, index) => (
            <div key={post._id} className="post-item">
              <div className="post-content">
                {/* Post Number */}
                <div className="post-number">{index + 1}</div>

                {/* Post Image */}
                <div className="post-image">
                  {post.images && post.images[0] ? (
                    <img
                      src={post.images[0]}
                      alt="Post"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>

                {/* Post Info */}
                <div className="post-info">
                  <div className="post-title">
                    {post.type === "ban"
                      ? "Bán"
                      : post.type === "dich_vu"
                      ? "Cho thuê"
                      : post.type}{" "}
                    - {post.title}
                  </div>

                  <div className="post-details">
                    {post.location} • {post.area}m² • {formatPrice(post.price)}{" "}
                    {post.type === "ban" ? "triệu" : "triệu/tháng"}
                  </div>

                  <div className="post-contact">
                    Liên hệ: {post.contactInfo.name} - {post.contactInfo.phone}
                  </div>

                  <div className="post-meta">
                    Ngày đăng: {formatDate(post.createdAt)} •
                    <span className={`status-badge ${post.status}`}>
                      {post.status === "pending"
                        ? "Chờ duyệt"
                        : post.status === "approved"
                        ? "Đã duyệt"
                        : post.status === "rejected"
                        ? "Từ chối"
                        : post.status}
                    </span>
                    <span className={`payment-badge ${post.paymentStatus}`}>
                      {post.paymentStatus === "unpaid"
                        ? "Chưa thanh toán"
                        : "Đã thanh toán"}
                    </span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="action-buttons">
                  <select
                    value={post.status}
                    disabled={!["pending", "rejected"].includes(post.status)}
                    onChange={(e) =>
                      handleStatusChange(post._id, e.target.value)
                    }
                    className="status-select"
                  >
                    {getOptionsByStatus(post.status).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDelete(post._id)}
                    className="btn btn-delete"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {posts.length === 0 && (
        <div className="no-posts">Không có bài đăng nào</div>
      )}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Từ chối bài đăng</h3>
            </div>
            <div className="modal-body">
              <label htmlFor="rejectReason">Lý do từ chối:</label>
              <textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối bài đăng..."
                rows="4"
                className="reject-textarea"
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-cancel"
                onClick={handleRejectCancel}
                type="button"
              >
                Hủy
              </button>
              <button
                className="btn btn-confirm"
                onClick={handleRejectConfirm}
                type="button"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManagement;
