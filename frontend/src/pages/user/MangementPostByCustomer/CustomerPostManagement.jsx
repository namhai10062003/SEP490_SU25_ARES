import React, { useEffect, useState } from "react";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Header from "../../../../components/header.jsx";
import { useAuth } from "../../../../context/authContext.jsx";
import {
  createPayment,
  deletePost,
  getPostsByUser,
  updatePost,
} from "../../../service/postService.js";
const PAGE_SIZE = 5;

const CustomerPostManagement = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    month: "",
    status: "",
    type: "",
    postPackage: "",
  });

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
      const fetched = Array.isArray(response.data.data) ? response.data.data : [];

      // 🔽 Sort theo thời gian mới nhất
      const sortedPosts = fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPosts(sortedPosts);
    } catch (error) {
      console.error("❌ Lỗi khi fetch post:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    console.log("Dữ liệu type trong bài đăng:", posts.map(p => p.type));
    console.log("Filter đang chọn:", filters.type);
    console.log("So sánh sau normalize:", posts.map(p => normalize(p.type)));
  }, [posts, filters]);
  const normalize = (str) => str?.toLowerCase().replace(/\s/g, "_");

  const filteredPosts = posts.filter((post) => {
    const createdMonth = new Date(post.createdAt).getMonth() + 1;

    return (
      (filters.month === "" || createdMonth === Number(filters.month)) &&
      (filters.status === "" || post.status === filters.status) &&
      (filters.type === "" || normalize(post.type) === normalize(filters.type)) &&
      (filters.postPackage === "" || post.postPackage?._id === filters.postPackage)
    );
  });

  const paginatedPosts = filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    fetchPosts();
    // eslint-disable-next-line
  }, [user, authLoading]);

  // Handle delete post
  const handleDelete = async (postId) => {
    confirmAlert({
      title: 'Xác nhận xoá bài đăng',
      message: 'Bạn có chắc chắn muốn xóa bài đăng này?',
      buttons: [
        {
          label: '🗑️ Xoá',
          onClick: async () => {
            try {
              const response = await deletePost(postId);
              if (response.data.success) {
                // Cập nhật danh sách bài đăng
                setPosts((prev) => prev.filter((post) => post._id !== postId));
  
                // Hiển thị thông báo thành công
                toast.success(response.data.message || "Đã xoá bài đăng thành công!");
              }
            } catch (error) {
              toast.error("Không thể xoá bài đăng. Vui lòng thử lại!");
            }
          }
        },
        {
          label: 'Huỷ',
          onClick: () => {}
        }
      ]
    });
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
      postPackagename: post.postPackage?._id || "",
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
    // Kiểm tra lỗi từng trường
    if (!editForm.title) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    } else if (editForm.title.length > 200) {
      toast.error("Tiêu đề không được vượt quá 50 ký tự");
      return;
    }
  
    if (!editForm.description) {
      toast.error("Vui lòng nhập mô tả");
      return;
    } else if (editForm.description.trim().split(/\s+/).length > 200) {
      toast.error("Mô tả không được vượt quá 50 từ");
      return;
    }
  
    if (editForm.area === "" || editForm.area < 0) {
      toast.error("Diện tích không hợp lệ");
      return;
    }
  
    if (editForm.price === "" || editForm.price <= 0) {
      toast.error("Giá không hợp lệ, giá phải có một con số cụ thể");
      return;
    }
  
    if (!editForm.legalDocument && editForm.type !== "dich_vu") {
      toast.error("Vui lòng nhập giấy tờ pháp lý");
      return;
    }
  
    if (!editForm.interiorStatus && editForm.type !== "dich_vu") {
      toast.error("Vui lòng nhập tình trạng nội thất");
      return;
    }
  
    if (!editForm.amenities && editForm.type !== "dich_vu") {
      toast.error("Vui lòng nhập tiện ích");
      return;
    }
  
    if (!editForm.location) {
      toast.error("Vui lòng nhập địa chỉ cụ thể");
      return;
    }
  
    if (!editForm.property) {
      toast.error("Vui lòng chọn loại hình");
      return;
    }
  
    if (!editForm.postPackagename) {
      toast.error("Vui lòng chọn gói đăng tin");
      return;
    }
  
    // Không có lỗi thì gửi request update
    try {
      const response = await updatePost(editingPost._id, editForm);
      if (response.data.success) {
        toast.success("Cập nhật bài đăng thành công!");
        setShowEditModal(false);
        setEditingPost(null);
        fetchPosts();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật bài đăng");
    }
  };
  

  const handlePayment = async (postId) => {
    try {
      const response = await createPayment(postId);
      if (response.data.success && response.data.data.paymentUrl) {
        window.location.href = response.data.data.paymentUrl;
      }
    } catch (error) {
      // ignore
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

  // Pagination logic
  // const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  // const paginatedPosts = posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (authLoading || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary me-2"></div>
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={user?.username || user?.name || ""} logout={logout} />

      <div className="container py-4">
        <div className="card p-3 mb-4 rounded-4">
          <div className="row g-3 align-items-end">
            {/* Tháng */}
            <div className="col-md-3">
              <label className="form-label">Tháng đăng</label>
              <select
                className="form-select"
                value={filters.month}
                onChange={(e) => setFilters((prev) => ({ ...prev, month: e.target.value }))}
              >
                <option value="">Tất cả</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
            </div>

            {/* Trạng thái */}
            <div className="col-md-3">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
                <option value="deleted">Đã Xóa</option>
              </select>
            </div>

            {/* Loại bài đăng */}
            <div className="col-md-3">
              <label className="form-label">Loại bài</label>
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="">Tất cả</option>
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Gói đăng tin */}
            <div className="col-md-3">
              <label className="form-label">Gói đăng</label>
              <select
                className="form-select"
                value={filters.postPackage}
                onChange={(e) => setFilters((prev) => ({ ...prev, postPackage: e.target.value }))}
              >
                <option value="">Tất cả</option>
                {postPackage.map((pkg) => (
                  <option key={pkg.value} value={pkg.value}>{pkg.label}</option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-outline-secondary mt-3"
              onClick={() => setFilters({ month: "", status: "", type: "", postPackage: "" })}
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
        <div className="bg-primary text-white rounded-4 p-3 mb-4 text-center">
          <h2 className="mb-0">
            <span className="material-symbols-rounded align-middle" style={{ fontSize: 32, verticalAlign: "middle" }}>library_books</span>
            <span className="ms-2">Bài Đăng Của Tôi</span>
          </h2>
        </div>

        {/* Post List */}
        <div className="row g-4">
          {(Array.isArray(paginatedPosts) ? paginatedPosts : []).map((post, index) => (
            <div key={post._id} className="col-12">
              <div className="card shadow-sm border-0 rounded-4 p-3">
                <div className="row g-3 align-items-center flex-column flex-md-row">
                  {/* Post Number */}
                  <div className="col-auto">
                    <span className="badge bg-secondary fs-6 px-3 py-2">{(currentPage - 1) * PAGE_SIZE + index + 1}</span>
                  </div>
                  {/* Post Image */}
                  <div className="col-auto">
                    {post.images && post.images[0] ? (
                      <img
                        src={post.images[0]}
                        alt="Post"
                        className="rounded-3 shadow-sm"
                        style={{ width: 80, height: 60, objectFit: "cover" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="bg-light border rounded d-flex align-items-center justify-content-center" style={{ width: 80, height: 60, fontSize: 12, color: "#666" }}>
                        No Image
                      </div>
                    )}
                  </div>
                  {/* Post Info */}
                  <div className="col">
                    <div className="fw-bold mb-1 d-flex align-items-center gap-2">
                      <span className="material-symbols-rounded text-primary" style={{ fontSize: 20 }}>
                        {post.type === "ban"
                          ? "sell"
                          : post.type === "dich_vu"
                            ? "handyman"
                            : post.type === "cho_thue"
                              ? "home_work"
                              : "article"}
                      </span>
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
                    <div className="text-muted small mb-1">
                      <span className="material-symbols-rounded align-middle" style={{ fontSize: 16, verticalAlign: "middle" }}>location_on</span>
                      {post.location} • {post.area}m² • {formatPrice(post.price)}{" "}
                      {post.type === "ban" ? "triệu" : "triệu/tháng"}
                    </div>
                    <div className="text-secondary small mb-1">
                      <span className="material-symbols-rounded align-middle" style={{ fontSize: 16, verticalAlign: "middle" }}>call</span>
                      Liên hệ: {post.contactInfo?.name} - {post.contactInfo?.phone}
                    </div>
                    <div className="small">
                      <span className="material-symbols-rounded align-middle" style={{ fontSize: 16, verticalAlign: "middle" }}>calendar_month</span>
                      Ngày đăng: {formatDate(post.createdAt)} •
                      <span className={`badge ms-2 px-2 py-1 rounded-pill fw-normal ${post.status === "pending" ? "bg-warning text-dark" : post.status === "approved" ? "bg-success" : "bg-danger"}`}>
                        {postStatusLabels[post.status] || post.status}
                      </span>
                      <span className={`badge ms-2 px-2 py-1 rounded-pill fw-normal ${post.paymentStatus === "unpaid" ? "bg-light text-danger border" : "bg-success"}`}>
                        {post.paymentStatus === "unpaid"
                          ? "Chưa thanh toán"
                          : "Đã thanh toán"}
                      </span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="col-auto d-flex flex-column gap-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className={`btn btn-success btn-sm rounded-pill d-flex align-items-center gap-1 ${!["pending", "rejected"].includes(post.status) ? "disabled" : ""}`}
                      disabled={!["pending", "rejected"].includes(post.status)}
                      title="Chỉnh sửa"
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>edit</span>
                      {post.status === "rejected"
                        ? "Bị từ chối"
                        : post.status === "pending"
                          ? "Chỉnh sửa"
                          : "Không thể sửa"}
                    </button>
                    {post.status !== "deleted" && (
  <button
    onClick={() => handleDelete(post._id)}
    className="btn btn-danger btn-sm rounded-pill d-flex align-items-center gap-1"
    title="Xóa"
  >
    <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
      delete
    </span>
    Xóa
  </button>
)}

                    <button
                      onClick={() => handlePayment(post._id)}
                      className={`btn btn-primary btn-sm rounded-pill d-flex align-items-center gap-1 ${post.paymentStatus !== "unpaid" || post.status !== "approved" ? "disabled" : ""}`}
                      disabled={post.paymentStatus !== "unpaid" || post.status !== "approved"}
                      title="Thanh toán"
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>payments</span>
                      {post.paymentStatus !== "unpaid"
                        ? "Đã thanh toán"
                        : post.status !== "approved"
                          ? "Chờ duyệt để thanh toán"
                          : "Thanh toán"}
                    </button>
                  </div>
                </div>
                {/* Lý do từ chối */}
                {post.status === "rejected" && post.reasonreject && (
                  <div className="alert alert-danger mt-3 mb-0 py-2 px-3 d-flex align-items-center gap-2">
                    <span className="material-symbols-rounded" style={{ fontSize: 20 }}>error</span>
                    <div>
                      <strong>Lý do từ chối:</strong> {post.reasonreject}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-4">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>chevron_left</span>
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>chevron_right</span>
                </button>
              </li>
            </ul>
          </nav>
        )}

        {posts.length === 0 && (
          <div className="text-center p-5 bg-white rounded-4 mt-4">
            <p className="mb-3">Bạn chưa có bài đăng nào</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/dichvu/dangtin")}
            >
              <span className="material-symbols-rounded align-middle" style={{ fontSize: 20 }}>add_circle</span>
              <span className="ms-1">Tạo bài đăng đầu tiên</span>
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Chỉnh sửa bài đăng</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Loại Bài Đăng</label>
                    <select
                      name="type"
                      value={editForm.type}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {typeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tiêu đề:</label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả:</label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="3"
                    />
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Địa chỉ cụ thể</label>
                      <input
                        type="text"
                        name="location"
                        value={editForm.location}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Loại hình</label>
                      <select
                        name="property"
                        value={editForm.property}
                        onChange={handleInputChange}
                        className="form-select"
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
                  <div className="row g-3 mt-2">
                    <div className="col-md-6">
                      <label className="form-label">Diện tích (m²):</label>
                      <input
                        type="number"
                        name="area"
                        value={editForm.area}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Giá (triệu VND):</label>
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
                      <div className="mb-3 mt-2">
                        <label className="form-label">Giấy tờ pháp lý:</label>
                        <input
                          type="text"
                          name="legalDocument"
                          value={editForm.legalDocument}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Tình trạng nội thất:</label>
                        <input
                          type="text"
                          name="interiorStatus"
                          value={editForm.interiorStatus}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Tiện ích (cách nhau bằng dấu phẩy):</label>
                        <input
                          type="text"
                          name="amenities"
                          value={editForm.amenities}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Ví dụ: Hồ bơi, Gym, Gần trường học"
                        />
                      </div>
                    </>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Gói đăng tin:</label>
                    <select
                      name="postPackagename"
                      value={editForm.postPackagename}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {postPackage.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Hủy
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveEdit}>
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPostManagement;