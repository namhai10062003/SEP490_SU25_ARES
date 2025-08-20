import axios from "axios";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../../components/header.jsx";
import { useAuth } from "../../../../context/authContext.jsx";
import {
  createPayment,
  deletePost,
  getPostsByUser,
  updatePost,
} from "../../../service/postService.js";

const PAGE_SIZE = 5;
const API_URL = import.meta.env.VITE_API_URL;

const CustomerPostManagement = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [filters, setFilters] = useState({
    month: "",
    status: "",
    type: "",
    postPackage: "",
  });
  const [originalPost, setOriginalPost] = useState(null);
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
    // postPackagename: "",
    packageId: "",
    property: "",
    status: null,
    images: [], // ảnh cũ
    oldImages: [], // ảnh cũ còn giữ lại
    newImages: []

  });

  const postStatusLabels = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
    expired: "Đã hết hạn",
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
    {
      _id: "685039e4f8f1552c6378a7a5",
      type: "VIP1",
      price: 10000,
      expireAt: 3,
    },
    {
      _id: "685174b550c6fbcbc4efbe87",
      type: "VIP2",
      price: 20000,
      expireAt: 5,
    },
    {
      _id: "685174db50c6fbcbc4efbe88",
      type: "VIP3",
      price: 30000,
      expireAt: 7,
    },
  ];

  // Fetch posts của customer hiện tại
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await getPostsByUser();
      const fetched = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      // 🔽 Sort theo thời gian mới nhất
      const sortedPosts = fetched.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setPosts(sortedPosts);
    } catch (error) {
      console.error("❌ Lỗi khi fetch post:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(
      "Dữ liệu type trong bài đăng:",
      posts.map((p) => p.type)
    );
    console.log("Filter đang chọn:", filters.type);
    console.log(
      "So sánh sau normalize:",
      posts.map((p) => normalize(p.type))
    );
  }, [posts, filters]);
  const normalize = (str) => str?.toLowerCase().replace(/\s/g, "_");

  const filteredPosts = posts.filter((post) => {
    const createdMonth = new Date(post.createdAt).getMonth() + 1;

    return (
      (filters.month === "" || createdMonth === Number(filters.month)) &&
      (filters.status === "" || post.status === filters.status) &&
      (filters.type === "" ||
        normalize(post.type) === normalize(filters.type)) &&
      (filters.postPackage === "" ||
        post.postPackage?._id === filters.postPackage)
    );
  });

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
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
      title: "Xác nhận xoá bài đăng",
      message: "Bạn có chắc chắn muốn xóa bài đăng này?",
      buttons: [
        {
          label: "🗑️ Xoá",
          onClick: async () => {
            try {
              const response = await deletePost(postId);
              if (response.data.success) {
                // Cập nhật danh sách bài đăng
                setPosts((prev) => prev.filter((post) => post._id !== postId));

                // Hiển thị thông báo thành công
                toast.success(
                  response.data.message || "Đã xoá bài đăng thành công!"
                );
              }
            } catch (error) {
              toast.error("Không thể xoá bài đăng. Vui lòng thử lại!");
            }
          },
        },
        {
          label: "Huỷ",
          onClick: () => { },
        },
      ],
    });
  };

  // Handle edit post

  const handleEdit = async (post) => {
    // ❌ Chặn chỉ khi status là approved
    // if (post.status === "approved") {
    //   toast.warning("Không thể chỉnh sửa bài đăng đã được duyệt!");
    //   return;
    // }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/posts/${post._id}/start-editing`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Lỗi khi bật isEditing:", err);
      toast.error("Có lỗi khi bật chế độ chỉnh sửa, vui lòng thử lại.");
      return;
    }

    // Lấy images từ post
    const updatedImages = Array.isArray(post.images) ? post.images : [];

    setEditingPost(post);
    setOriginalPost({
      ...post,
      postPackage: post.postPackage?._id || post.postPackage || "", // ép về id/string
      images: Array.isArray(post.images) ? post.images : [],
    });
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
      images: updatedImages,
      oldImages: updatedImages,
      newImages: [],
    });
    setShowEditModal(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "price" && value.length > 12) {
      return; // ❌ Không cho nhập quá 12 số
    }

    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    // ==== Validate dữ liệu ====
    if (!editForm.title) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    } else if (editForm.title.length > 200) {
      toast.error("Tiêu đề không được vượt quá 200 ký tự");
      return;
    }

    if (!editForm.description) {
      toast.error("Vui lòng nhập mô tả");
      return;
    } else if (editForm.description.trim().split(/\s+/).length > 200) {
      toast.error("Mô tả không được vượt quá 200 từ");
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

    // ==== Tạo formData để gửi lên server ====
    const formData = new FormData();


    // Thêm các trường text
    formData.append("title", editForm.title);
    formData.append("description", editForm.description);
    formData.append("area", editForm.area);
    formData.append("price", editForm.price);
    formData.append("legalDocument", editForm.legalDocument || "");
    formData.append("interiorStatus", editForm.interiorStatus || "");
    formData.append("amenities", editForm.amenities || "");
    formData.append("location", editForm.location);
    formData.append("property", editForm.property);
    formData.append("postPackage", editForm.postPackagename);

    // Nếu rejected hoặc expired thì đổi trạng thái
    // formData.append(
    //   "status",
    //   ["rejected", "expired"].includes(editingPost.status)
    //     ? "pending"
    //     : editingPost.status
    // );

    const isChanged =
      (editForm.title ?? "") !== (originalPost.title ?? "") ||
      (editForm.description ?? "") !== (originalPost.description ?? "") ||
      Number(editForm.area ?? 0) !== Number(originalPost.area ?? 0) ||
      Number(editForm.price ?? 0) !== Number(originalPost.price ?? 0) ||
      (editForm.legalDocument ?? "") !== (originalPost.legalDocument ?? "") ||
      (editForm.interiorStatus ?? "") !== (originalPost.interiorStatus ?? "") ||
      (editForm.amenities ?? "") !== (originalPost.amenities ?? "") ||
      (editForm.location ?? "") !== (originalPost.location ?? "") ||
      (editForm.property ?? "") !== (originalPost.property ?? "") ||
      (editForm.postPackagename ?? "") !== (originalPost.postPackage ?? "") ||
      JSON.stringify(editForm.oldImages ?? []) !== JSON.stringify(originalPost.images ?? []) ||
      (editForm.newImages?.length ?? 0) > 0;

    let newStatus = originalPost.status;
    let newPaymentStatus = originalPost.paymentStatus;

    if (isChanged) {
      if (["approved", "rejected", "expired"].includes(originalPost.status)) {
        newStatus = "pending";
      }

      if (newStatus === "pending") {
        if (originalPost.status === "expired") {
          newPaymentStatus = "unpaid";
        } else {
          newPaymentStatus = originalPost.paymentStatus; // giữ nguyên paid/unpaid
        }
      }
    }

    formData.append("status", newStatus);
    formData.append("paymentStatus", newPaymentStatus);

    console.log("🔍 Status hiện tại:", editForm.status);
    console.log(
      "🔍 Disabled?",
      editForm.status
        ? editForm.status.toLowerCase().trim() !== "expired"
        : false
    );

    if (editForm.oldImages?.length > 0) {
      formData.append("oldImages", JSON.stringify(editForm.oldImages));
    }

    (editForm.newImages || []).forEach((file) => {
      if (file instanceof File) {
        formData.append("images", file);
      }
    });

    try {
      const totalImages = editForm.oldImages.length + editForm.newImages.length;
      if (totalImages === 0) {
        toast.error("⚠️ Bắt buộc phải có ít nhất 1 ảnh!");
        return; // ❌ không cho submit
      }
      setIsSaving(true);
      const response = await updatePost(editingPost._id, formData, {});

      if (response.data.success) {
        toast.success("Cập nhật bài đăng thành công!");
        setShowEditModal(false);
        setEditingPost(null);
        fetchPosts();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật bài đăng");
    } finally {
      setIsSaving(false);
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
    console.log("Ngày raw nhận được:", dateString); // log dữ liệu đầu vào
    const date = new Date(dateString);
    console.log("Ngày sau khi parse:", date); // log đối tượng Date
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    const formatted = `${day}/${month}/${year}`;
    console.log("Ngày đã format:", formatted); // log kết quả trả về
    return formatted;
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
  const handleCancelEdit = async () => {
    if (editingPost) {
      try {
        await updatePost(editingPost._id, { isEditing: false });
      } catch (err) {
        console.error("❌ Lỗi khi huỷ chỉnh sửa:", err);
      }
    }
    setShowEditModal(false);
    setEditingPost(null);
  };
  // hàm chỉnh sửa up ảnh
  // Xóa ảnh cũ
  const handleRemoveOldImage = async (imageUrl) => {
    if (!editingPost || !editingPost._id) {
      console.error("❌ Không tìm thấy postId khi xóa ảnh!");
      return;
    }

    const postId = editingPost._id;

    try {
      console.log("🗑️ Gửi yêu cầu xóa ảnh:", { postId, imageUrl });
      await axios.delete(`${API_URL}/api/posts/${postId}/images`, {
        data: { imageUrl },
      });

      setEditForm((prev) => ({
        ...prev,
        oldImages: prev.oldImages.filter((img) => img !== imageUrl),
      }));

      toast.success("Ảnh đã được xóa!");
    } catch (err) {
      console.error("❌ Lỗi khi xóa ảnh:", err);
      toast.error("Không thể xóa ảnh!");
    }
  };



  // Xóa ảnh mới
  const handleRemoveNewImage = (file) => {
    setEditForm((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((f) => f !== file),
    }));
  };

  // Chọn ảnh mới
  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files).filter((file) => file instanceof File);

    // Lọc chỉ lấy file ảnh hợp lệ
    const imageFiles = files.filter((file) => {
      const isImage =
        file.type.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name);

      if (!isImage) {
        toast.error(`❌ ${file.name} không phải ảnh, hệ thống sẽ bỏ qua!`);
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`⚠️ ${file.name} vượt quá 5MB, không thể upload!`);
        return false;
      }

      return true;
    });

    setEditForm((prev) => ({
      ...prev,
      newImages: [...(prev.newImages || []), ...imageFiles],
    }));
  };



  return (
    <div className="bg-light min-vh-100">
      <Header
        user={user}
        name={user?.username || user?.name || ""}
        logout={logout}
      />

      <div className="container py-4">
        <div className="card p-3 mb-4 rounded-4">
          <div className="row g-3 align-items-end">
            {/* Tháng */}
            <div className="col-md-3">
              <label className="form-label">Tháng đăng</label>
              <select
                className="form-select"
                value={filters.month}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, month: e.target.value }))
                }
              >
                <option value="">Tất cả</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Trạng thái */}
            <div className="col-md-3">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
                <option value="deleted">Đã Xóa</option>
                <option value="expired">Đã Hết Hạn</option>
              </select>
            </div>

            {/* Loại bài đăng */}
            <div className="col-md-3">
              <label className="form-label">Loại bài</label>
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option value="">Tất cả</option>
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Gói đăng tin */}
            <div className="col-md-3">
              <label className="form-label">Gói đăng</label>
              <select
                className="form-select"
                value={filters.postPackage}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    postPackage: e.target.value,
                  }))
                }
              >
                <option value="">Tất cả</option>
                {postPackage.map((pkg) => (
                  <option key={pkg._id} value={pkg._id}>
                    {pkg.type}{" "}
                    {/* hoặc `${pkg.type} - ${pkg.price}₫` nếu muốn hiển thị giá */}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-outline-secondary mt-3"
              onClick={() =>
                setFilters({ month: "", status: "", type: "", postPackage: "" })
              }
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
        <div className="bg-primary text-white rounded-4 p-3 mb-4 text-center">
          <h2 className="mb-0">
            <span
              className="material-symbols-rounded align-middle"
              style={{ fontSize: 32, verticalAlign: "middle" }}
            >
              library_books
            </span>
            <span className="ms-2">Bài Đăng Của Tôi</span>
          </h2>
        </div>

        {/* Post List */}
        <div className="row g-4">
          {(Array.isArray(paginatedPosts) ? paginatedPosts : []).map(
            (post, index) => (
              <div key={post._id} className="col-12">
                <div className="card shadow-sm border-0 rounded-4 p-3">
                  <div className="row g-3 align-items-center flex-column flex-md-row">
                    {/* Post Number */}
                    <div className="col-auto">
                      <span className="badge bg-secondary fs-6 px-3 py-2">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </span>
                    </div>
                    {/* Post Image */}
                    <div className="col-auto">
                      {post.images && post.images[0] ? (
                        <img
                          src={post.images[0]}
                          alt="Post"
                          className="rounded-3 shadow-sm"
                          style={{ width: 80, height: 60, objectFit: "cover", cursor: "pointer" }}
                          onClick={() => setSelectedImages(post.images)} // 👉 gán tất cả ảnh của post vào modal
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          className="bg-light border rounded d-flex align-items-center justify-content-center"
                          style={{
                            width: 80,
                            height: 60,
                            fontSize: 12,
                            color: "#666",
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </div>
                    <Modal
                      show={Array.isArray(selectedImages) && selectedImages.length > 0}
                      onHide={() => setSelectedImages([])}
                      size="lg"
                      centered
                    >
                      <Modal.Header closeButton>
                        <Modal.Title>Ảnh bài post</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <div className="d-flex flex-wrap gap-3">
                          {selectedImages?.map((img, index) => (
                            <div
                              key={index}
                              className="rounded shadow-sm overflow-hidden"
                              style={{
                                width: "30%",   // 3 ảnh / dòng
                                aspectRatio: "1/1", // giữ tỷ lệ vuông
                                background: "#f8f9fa", // màu nền fallback
                              }}
                            >
                              <img
                                src={img}
                                alt={`Ảnh ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover", // đảm bảo ảnh fill khung
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </Modal.Body>
                    </Modal>

                    {/* Post Info */}
                    <div className="col">
                      <div className="fw-bold mb-1 d-flex align-items-center gap-2">
                        <span
                          className="material-symbols-rounded text-primary"
                          style={{ fontSize: 20 }}
                        >
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
                        <span
                          className="material-symbols-rounded align-middle"
                          style={{ fontSize: 16, verticalAlign: "middle" }}
                        >
                          location_on
                        </span>
                        {post.location} • {post.area}m² •{" "}
                        {formatPrice(post.price)}{" "}
                        {post.type === "ban" ? "VND" : "VND/tháng"}
                      </div>
                      <div className="text-secondary small mb-1">
                        <span
                          className="material-symbols-rounded align-middle"
                          style={{ fontSize: 16, verticalAlign: "middle" }}
                        >
                          call
                        </span>
                        Liên hệ: {post.contactInfo?.name} -{" "}
                        {post.contactInfo?.phone}
                      </div>
                      <div className="small">
                        <span
                          className="material-symbols-rounded align-middle"
                          style={{ fontSize: 16, verticalAlign: "middle" }}
                        >
                          calendar_month
                        </span>
                        Ngày đăng: {formatDate(post.paymentDate)} •
                        <span
                          className={`badge ms-2 px-2 py-1 rounded-pill fw-normal ${post.status === "pending"
                            ? "bg-warning text-dark"
                            : post.status === "approved"
                              ? "bg-success"
                              : "bg-danger"
                            }`}
                        >
                          {postStatusLabels[post.status] || post.status}
                        </span>
                        <span
                          className={`badge ms-2 px-2 py-1 rounded-pill fw-normal ${post.paymentStatus === "unpaid"
                            ? "bg-light text-danger border"
                            : "bg-success"
                            }`}
                        >
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
                        className={`btn btn-success btn-sm rounded-pill d-flex align-items-center gap-1 ${![
                          "pending",
                          "rejected",
                          "expired",
                          "approved",
                        ].includes(post.status)
                          ? "disabled"
                          : ""
                          }`}
                        disabled={
                          ![
                            "pending",
                            "rejected",
                            "expired",
                            "approved",
                          ].includes(post.status)
                        }
                        title={
                          post.status === "expired" ? "Gia hạn" : "Chỉnh sửa"
                        }
                      >
                        <span
                          className="material-symbols-rounded"
                          style={{ fontSize: 18 }}
                        >
                          edit
                        </span>
                        {post.status === "expired"
                          ? "Gia hạn"
                          : ["pending", "rejected", "approved"].includes(
                            post.status
                          )
                            ? "Chỉnh sửa"
                            : "Không thể sửa"}
                      </button>

                      {post.status !== "deleted" && (
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="btn btn-danger btn-sm rounded-pill d-flex align-items-center gap-1"
                          title="Xóa"
                        >
                          <span
                            className="material-symbols-rounded"
                            style={{ fontSize: 18 }}
                          >
                            delete
                          </span>
                          Xóa
                        </button>
                      )}

                      <button
                        onClick={() => handlePayment(post._id)}
                        className={`btn btn-primary btn-sm rounded-pill d-flex align-items-center gap-1 ${post.paymentStatus !== "unpaid" ||
                          post.status !== "approved"
                          ? "disabled"
                          : ""
                          }`}
                        disabled={
                          post.paymentStatus !== "unpaid" ||
                          post.status !== "approved"
                        }
                        title="Thanh toán"
                      >
                        <span
                          className="material-symbols-rounded"
                          style={{ fontSize: 18 }}
                        >
                          payments
                        </span>
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
                      <span
                        className="material-symbols-rounded"
                        style={{ fontSize: 20 }}
                      >
                        error
                      </span>
                      <div>
                        <strong>Lý do từ chối:</strong> {post.reasonreject}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-4">
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <span
                    className="material-symbols-rounded"
                    style={{ fontSize: 18 }}
                  >
                    chevron_left
                  </span>
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""
                    }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""
                  }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <span
                    className="material-symbols-rounded"
                    style={{ fontSize: 18 }}
                  >
                    chevron_right
                  </span>
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
              <span
                className="material-symbols-rounded align-middle"
                style={{ fontSize: 20 }}
              >
                add_circle
              </span>
              <span className="ms-1">Tạo bài đăng đầu tiên</span>
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div
            className="modal fade show"
            style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content rounded-4 shadow-lg border-0">
                <div className="modal-header bg-primary text-white rounded-top-4">
                  <h5 className="modal-title fw-bold">✏️ Chỉnh sửa bài đăng</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowEditModal(false)}
                  />
                </div>

                <div className="modal-body bg-light">
                  {/* Loại bài đăng */}
                  <div className="card shadow-sm border-0 mb-3">
                    <div className="card-body">
                      <h6 className="fw-bold text-secondary mb-3">
                        Thông tin cơ bản
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6">
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
                        <div className="col-12">
                          <label className="form-label">Tiêu đề</label>
                          <input
                            type="text"
                            name="title"
                            value={editForm.title}
                            onChange={handleInputChange}
                            className="form-control"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Mô tả</label>
                          <textarea
                            name="description"
                            value={editForm.description}
                            onChange={handleInputChange}
                            className="form-control"
                            rows="3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Địa chỉ & Loại hình */}
                  <div className="card shadow-sm border-0 mb-3">
                    <div className="card-body">
                      <h6 className="fw-bold text-secondary mb-3">
                        Địa điểm & Loại hình
                      </h6>
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
                    </div>
                  </div>

                  {/* Thông số */}
                  <div className="card shadow-sm border-0 mb-3">
                    <div className="card-body">
                      <h6 className="fw-bold text-secondary mb-3">Thông số</h6>
                      <div className="row g-3">
                        {/* Diện tích */}
                        <div className="col-md-6">
                          <label className="form-label">Diện tích</label>
                          <div className="input-group">
                            <input
                              type="number"
                              name="area"
                              min={1} // ✅ không cho nhập số âm hoặc 0
                              value={editForm.area}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 1 || e.target.value === "") {
                                  handleInputChange(e);
                                }
                              }}
                              className="form-control"
                              placeholder="Nhập diện tích"
                            />
                            <span className="input-group-text">m²</span>
                          </div>
                        </div>

                        {/* Giá */}
                        <div className="col-md-6">
                          <label className="form-label">Giá</label>
                          <div className="input-group">
                            <input
                              type="text"
                              name="price"
                              value={
                                editForm.price
                                  ? Number(editForm.price).toLocaleString("vi-VN")
                                  : ""
                              }
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, ""); // chỉ giữ số
                                if (raw.length <= 12) {
                                  const num = Number(raw);
                                  if (num >= 1 || raw === "") {
                                    handleInputChange({
                                      target: { name: "price", value: raw },
                                    });
                                  }
                                }
                              }}
                              className="form-control"
                              placeholder="Nhập giá (tối đa 12 chữ số)"
                            />
                            <span className="input-group-text">VNĐ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin bổ sung */}
                  {editForm.type !== "dich_vu" && (
                    <div className="card shadow-sm border-0 mb-3">
                      <div className="card-body">
                        <h6 className="fw-bold text-secondary mb-3">
                          Thông tin bổ sung
                        </h6>
                        <div className="mb-3">
                          <label className="form-label">Giấy tờ pháp lý</label>
                          <input
                            type="text"
                            name="legalDocument"
                            value={editForm.legalDocument}
                            onChange={handleInputChange}
                            className="form-control"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Tình trạng nội thất
                          </label>
                          <input
                            type="text"
                            name="interiorStatus"
                            value={editForm.interiorStatus}
                            onChange={handleInputChange}
                            className="form-control"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Tiện ích (cách nhau bằng dấu phẩy)
                          </label>
                          <input
                            type="text"
                            name="amenities"
                            value={editForm.amenities}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Ví dụ: Hồ bơi, Gym, Gần trường học"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Ảnh hiện tại */}
                  <>
                    {/* Ảnh cũ */}
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {editForm.oldImages && editForm.oldImages.length > 0 ? (
                        editForm.oldImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="position-relative border rounded shadow-sm"
                            style={{ width: 100, height: 100 }}
                          >
                            <img
                              src={img}
                              alt=""
                              className="img-fluid rounded"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                cursor: "pointer",
                              }}
                              onClick={() => setPreview(img)}
                            />

                            <button
                              type="button"
                              onClick={() => {
                                handleRemoveOldImage(img); // ✅ truyền đúng postId
                              }}
                              className="btn btn-danger btn-sm position-absolute"
                              style={{
                                top: -6,
                                right: -6,
                                borderRadius: "50%",
                                padding: "2px 6px",
                                fontSize: 12,
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">Chưa có ảnh nào</p>
                      )}
                    </div>



                    {/* Ảnh mới */}
                    {editForm.newImages.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {editForm.newImages.map((file, idx) => (
                          <div key={idx} className="position-relative" style={{ width: 100, height: 100 }}>
                            <img
                              src={URL.createObjectURL(file)}
                              alt=""
                              className="img-fluid rounded"
                              style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
                              onClick={() => setPreview(URL.createObjectURL(file))}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(file)}
                              className="btn btn-danger btn-sm position-absolute"
                              style={{ top: 2, right: 2, padding: "0 6px", lineHeight: 1, borderRadius: "50%" }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lightbox xem ảnh */}
                    {preview && (
                      <div
                        onClick={() => setPreview(null)}
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          width: "100vw",
                          height: "100vh",
                          backgroundColor: "rgba(0,0,0,0.8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 9999,
                          cursor: "pointer",
                        }}
                      >
                        <img src={preview} alt="" style={{ maxHeight: "90%", maxWidth: "90%" }} />
                      </div>
                    )}
                  </>
                  {/* Ảnh mới upload (preview) */}
                  {/* {newImages.length > 0 && (
  <div className="d-flex flex-wrap gap-2 mb-3">
    {newImages.map((file, idx) => (
      <div key={idx} className="position-relative">
        <img
          src={URL.createObjectURL(file)}
          alt={`Ảnh mới ${idx + 1}`}
          className="rounded border"
          style={{ width: 100, height: 100, objectFit: "cover" }}
        />
        <button
          type="button"
          className="btn btn-sm btn-danger position-absolute top-0 end-0"
          onClick={() => handleRemoveNewImage(file)}
          style={{ transform: "translate(30%, -30%)" }}
        >
          ✕
        </button>
      </div>
    ))}
  </div>
)} */}

                  {/* Upload ảnh mới */}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImagesChange}
                    className="form-control"
                  />

                  {/* ⚠️ Thêm lưu ý dung lượng ảnh */}
                  <small className="text-danger">
                    ⚠️ Mỗi ảnh không được vượt quá <strong>5MB</strong>.
                  </small>


                  {/* Gói tin */}
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <h6 className="fw-bold text-secondary mb-3">
                        Gói đăng tin
                      </h6>
                      <select
                        name="postPackagename"
                        value={editForm.postPackagename || ""}
                        onChange={handleInputChange}
                        className="form-select"
                        disabled={(editingPost.status || "").toLowerCase().trim() !== "expired"}
                      // ✅ Nếu status null/undefined sẽ thành "" => không crash
                      >
                        <option value="">-- Chọn gói tin --</option>
                        {postPackage.map((pkg) => (
                          <option key={pkg._id} value={pkg._id}>
                            {pkg.type}
                          </option>
                        ))}
                      </select>



                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer bg-light rounded-bottom-4">
                  <button
                    className="btn btn-secondary px-4"
                    onClick={handleCancelEdit}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-primary px-4 d-flex align-items-center gap-2"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        💾 Lưu thay đổi
                      </>
                    )}
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
