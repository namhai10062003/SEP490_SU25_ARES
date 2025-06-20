import React, { useState, useEffect } from "react";
import "./CustomerPostManagement.css";
import Header from "../../../components/header";
import { useAuth } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import {
  createPayment,
  deletePost,
  getPostsByUser,
  updatePost,
} from "../../service/postService.js";
const CustomerPostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    area: "",
    price: "",
    type: "",
    legalDocument: "",
    interiorStatus: "",
    amenities: "",
    postPackagename: "",
    property: "",
  });

  const postStatusLabels = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
  };

  const propertyOptions = [
    { value: "apartment", label: "Chung cư" },
    { value: "nha_can_ho", label: "Nhà/Căn hộ" },
  ];
  const propertyOptions1 = [
    { value: "sua_chua", label: "Sửa chữa" },
    { value: "ve_sinh", label: "Vệ sinh" },
    { value: "khac", label: "Khác" },
  ];

  const typeOptions = [
    { value: "dich_vu", label: "Dịch Vụ" },
    { value: "ban", label: "Bán" },
    { value: "cho_thue", label: "Cho Thuê" },
  ];

  const postPackage = [
    { value: "685039e4f8f1552c6378a7a5", label: "Vip1" },
    { value: "685174b550c6fbcbc4efbe87", label: "Vip2" },
    { value: "685174db50c6fbcbc4efbe88", label: "Vip3" },
  ];

  // Fetch posts của customer hiện tại
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await getPostsByUser();
      console.log(response);
      setPosts(response.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      alert("Có lỗi xảy ra khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle delete post
  const handleDelete = async (postId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) {
      try {
        const response = await deletePost(postId);

        if (response.data.success) {
          alert("Bài đăng đã được xóa!");
          setPosts(posts.filter((post) => post._id !== postId));
        } else {
          alert("Xóa bài đăng không thành công!");
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Có lỗi xảy ra khi xóa bài đăng!");
      }
    }
  };

  // Handle edit post
  const handleEdit = (post) => {
    if (post.status === "approved") {
      alert("Không thể chỉnh sửa bài đăng đã được duyệt!");
      return;
    }

    setEditingPost(post);
    setEditForm({
      title: post.title,
      description: post.description,
      location: post.location,
      area: post.area,
      price: post.price,
      type: post.type,
      legalDocument: post.legalDocument,
      interiorStatus: post.interiorStatus,
      amenities: post.amenities,
      property: post.property,
      postPackagename: post.postPackage._id,
    });
    setShowEditModal(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      console.log(editForm);
      const response = await updatePost(editingPost._id, editForm);
      if (response.data.success) {
        alert("Cập nhật bài đăng thành công!");
        setShowEditModal(false);
        setEditingPost(null);
        fetchPosts();
      } else {
        alert("Cập nhật bài đăng không thành công!");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Có lỗi xảy ra khi cập nhật bài đăng!");
    }
  };

  const handlePayment = async (postId) => {
    try {
      const response = await createPayment(postId);
      if (response.data.success) {
        if (response.data.data.paymentUrl) {
          window.location.href = response.data.data.paymentUrl;
        } else {
          alert("Thanh toán thất bại. Vui lòng thử lại.");
        }
      } else {
        alert("Cập nhật bài đăng không thành công!");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Có lỗi xảy ra khi cập nhật bài đăng!");
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
    <div className="customer-post-management">
      <Header user={user} name={name} logout={logout} />

      <div className="header2">
        <h2>Bài Đăng Của Tôi</h2>
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
                  {(post.type === "ban"
                    ? "Bán"
                    : post.type === "dich_vu"
                    ? "Dịch vụ"
                    : post.type === "cho_thue"
                    ? "Cho thuê"
                    : post.type) +
                    " - " +
                    post.title}
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
                    {postStatusLabels[post.status] || post.status}
                  </span>
                  <span className={`payment-badge ${post.paymentStatus}`}>
                    {post.paymentStatus === "unpaid"
                      ? "Chưa thanh toán"
                      : "Đã thanh toán"}
                  </span>
                </div>
              </div>
              {post.status === "rejected" && post.reasonreject && (
                <div className="rejected-reason">
                  <div className="rejected-icon">⚠️</div>
                  <div className="rejected-content">
                    <strong>Lý do từ chối:</strong>
                    <span>{post.reasonreject}</span>
                  </div>
                </div>
              )}
              {/* Action Buttons */}
              <div className="action-buttons">
                {/* Chỉ cho sửa nếu status === 'pending' */}
                <button
                  onClick={() => handleEdit(post)}
                  className={`btn btn-edit ${
                    post.status === "rejected"
                      ? "btn-delete"
                      : !["pending", "rejected"].includes(post.status)
                      ? "disabled"
                      : ""
                  }`}
                  disabled={!["pending", "rejected"].includes(post.status)}
                  title={
                    post.status === "pending"
                      ? "Chỉnh sửa bài đăng đang chờ duyệt"
                      : post.status === "rejected"
                      ? "Chỉnh sửa và gửi lại bài bị từ chối"
                      : "Chỉ có thể chỉnh sửa bài đang chờ duyệt hoặc bị từ chối"
                  }
                >
                  {post.status === "rejected"
                    ? "Bị từ chối"
                    : post.status === "pending"
                    ? "Chỉnh sửa"
                    : "Không thể sửa"}
                </button>

                {/* Xóa luôn được phép */}
                <button
                  onClick={() => handleDelete(post._id)}
                  className="btn btn-delete"
                >
                  Xóa
                </button>

                {/* Chỉ cho thanh toán nếu status === 'approved' và paymentStatus === 'unpaid' */}
                <button
                  onClick={() => handlePayment(post._id)}
                  className={`btn btn-payment ${
                    post.paymentStatus !== "unpaid" ||
                    post.status !== "approved"
                      ? "disabled"
                      : ""
                  }`}
                  disabled={
                    post.paymentStatus !== "unpaid" ||
                    post.status !== "approved"
                  }
                  title={
                    post.paymentStatus !== "unpaid"
                      ? "Bài đăng đã được thanh toán"
                      : post.status !== "approved"
                      ? "Chỉ có thể thanh toán bài đăng đã được duyệt"
                      : "Thanh toán ngay"
                  }
                >
                  {post.paymentStatus !== "unpaid"
                    ? "Đã thanh toán"
                    : post.status !== "approved"
                    ? "Chờ duyệt để thanh toán"
                    : "Thanh toán"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="no-posts">
          <p>Bạn chưa có bài đăng nào</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/create-post")}
          >
            Tạo bài đăng đầu tiên
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chỉnh sửa bài đăng</h3>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Loại Bài Đăng</label>
                <select
                  name="type"
                  value={editForm.type}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tiêu đề:</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Địa chỉ cụ thể</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Loại hình</label>
                  <select
                    name="property"
                    value={editForm.property}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    {(editForm.type === "dich_vu"
                      ? propertyOptions1
                      : propertyOptions
                    ).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Diện tích (m²):</label>
                  <input
                    type="number"
                    name="area"
                    value={editForm.area}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Giá (triệu VND):</label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
              </div>

              {editForm.type !== "dich_vu" && (
                <>
                  <div className="form-group">
                    <label>Giấy tờ pháp lý:</label>
                    <input
                      type="text"
                      name="legalDocument"
                      value={editForm.legalDocument}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tình trạng nội thất:</label>
                    <input
                      type="text"
                      name="interiorStatus"
                      value={editForm.interiorStatus}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tiện ích (cách nhau bằng dấu phẩy):</label>
                    <input
                      type="text"
                      value={editForm.amenities}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Ví dụ: Hồ bơi, Gym, Gần trường học"
                    />
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Gói đăng tin:</label>
                <select
                  name="postPackagename"
                  value={editForm.postPackagename}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  {postPackage.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn1 btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </button>
              <button className="btn1 btn-primary" onClick={handleSaveEdit}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPostManagement;
