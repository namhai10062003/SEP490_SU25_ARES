import React, { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaHeart,
  FaMapMarkerAlt,
  FaRegHeart,
  FaRulerCombined,
  FaStar,
  FaInfoCircle,
  FaExpand,
} from "react-icons/fa";
import { Modal } from "react-bootstrap";
import Slider from "react-slick";
import { useNavigate, useParams } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Header from "../../../../components/header.jsx";
import { useAuth } from "../../../../context/authContext.jsx";
import {
  getPostById,
  getAllPosts,
} from "../../../service/postService.js";
import {
  toggleLike,
  getComments,
  addComment,
  checkLiked,
  getLikeCount,
} from "../../../service/postInteractionService.js";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, commentsRes, likedRes, countRes] = await Promise.all([
          getPostById(id),
          getComments(id),
          checkLiked(id),
          getLikeCount(id),
        ]);

        if (postRes.data.success) {
          setPost(postRes.data.data);
        } else {
          setErr("Không tìm thấy bài đăng.");
        }

        setComments(commentsRes.data.data);
        setIsLiked(likedRes.data.liked);
        setLikeCount(countRes.data.count);
      } catch {
        setErr("Có lỗi khi tải dữ liệu bài viết.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await getAllPosts();
        if (res.data.success) {
          const others = res.data.data.filter((p) => p._id !== id).slice(0, 3);
          setRelatedPosts(others);
        }
      } catch {
        console.error("Lỗi gợi ý");
      }
    };
    fetchRelated();
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const handleLike = async () => {
    await toggleLike(id);
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await addComment(id, commentText);
    const updated = await getComments(id);
    setComments(updated.data.data);
    setCommentText("");
  };

  if (loading) return <div className="text-center py-5">🔄 Đang tải dữ liệu…</div>;
  if (err) return <div className="text-danger text-center py-5">{err}</div>;

  const thumbSliderSettings = {
    slidesToShow: Math.min(5, (post.images || []).length),
    swipeToSlide: true,
    focusOnSelect: true,
    arrows: true,
  };

  return (
    <>
      <Header user={user} logout={logout} />
      <div className="container py-4">
        <button
          type="button"
          className="btn btn-secondary mb-3"
          onClick={() => navigate(-1)}
        >
          ← Quay lại
        </button>
        <div className="row g-4">
          {/* Left column: Images */}
          <div className="col-md-7">
            <div className="position-relative">
              <img
                src={post.images?.[selectedIndex] || "https://via.placeholder.com/800x500"}
                alt="main"
                className="img-fluid rounded shadow-sm"
                style={{ maxHeight: 450, objectFit: "cover", width: "100%" }}
              />
              <button
                className="btn btn-light position-absolute top-0 end-0 m-2"
                onClick={() => setShowModal(true)}
              >
                <FaExpand />
              </button>
            </div>

            {/* Thumbnails in slick */}
            <div className="mt-2">
              <Slider {...thumbSliderSettings}>
                {(post.images || []).map((img, idx) => (
                  <div key={idx} onClick={() => setSelectedIndex(idx)}>
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      style={{
                        width: "95%",
                        height: 80,
                        objectFit: "cover",
                        border: idx === selectedIndex ? "2px solid #0d6efd" : "1px solid #ddd",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>

          {/* Right column: Info */}
          <div className="col-md-5">
            <h2 className="fw-bold">{post.title}</h2>
            <h4 className="text-danger">{formatPrice(post.price)}</h4>
            <div className="my-2">
              <span className="badge bg-success">
                {post.status === "active" ? "Đang hoạt động" : "Ẩn"}
              </span>
            </div>

            <ul className="list-unstyled mb-3">
              <li><FaRulerCombined /> Diện tích: {post.area} m²</li>
              <li><FaMapMarkerAlt /> Vị trí: {post.location}</li>
              <li><FaCalendarAlt /> Ngày đăng: {new Date(post.createdAt).toLocaleDateString("vi-VN")}</li>
              <li><FaStar /> Gói: {post.postPackage?.type || "Standard"}</li>
            </ul>

            <button
              className={`btn ${isLiked ? "btn-danger" : "btn-outline-danger"} me-2`}
              onClick={handleLike}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />} {likeCount}
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => document.getElementById("comments").scrollIntoView({ behavior: "smooth" })}
            >
              💬 Bình luận
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <h4 className="mb-3 d-flex align-items-center text-primary">
            <FaInfoCircle className="me-2" /> Mô tả
          </h4>

          <div
            className="bg-light rounded shadow-sm p-3"
            style={{
              fontSize: "1rem",
              lineHeight: "1.7",
              color: "#333",
              textAlign: "justify",
              whiteSpace: "pre-line",
            }}
          >
            {post.description}
          </div>
        </div>

        {/* Comments */}
        <div className="mt-4" id="comments">
          <h4>💬 Bình luận</h4>
          <textarea
            className="form-control mb-2"
            placeholder="Viết bình luận…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button className="btn btn-primary mb-3" onClick={handleAddComment}>
            Gửi bình luận
          </button>
          <ul className="list-group">
            {comments.map((c, idx) => (
              <li key={idx} className="list-group-item">
                <strong>{c.user?.name || "Ẩn danh"}:</strong> {c.content}
              </li>
            ))}
          </ul>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-4">
            <h4>🗂️ Bài viết gợi ý</h4>
            <div className="row g-3">
              {relatedPosts.map((rp) => (
                <div className="col-md-4" key={rp._id}>
                  <div
                    className="card h-100 shadow-sm"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/postdetail/${rp._id}`)}
                  >
                    <img
                      src={rp.images?.[0] || "https://via.placeholder.com/300x200"}
                      className="card-img-top"
                      alt={rp.title}
                      style={{ height: 150, objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{rp.title}</h5>
                      <p className="card-text text-danger">{formatPrice(rp.price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Body>
          <Slider
            initialSlide={selectedIndex}
            arrows
            afterChange={(current) => setSelectedIndex(current)}
          >
            {(post.images || []).map((img, idx) => (
              <div key={idx}>
                <img
                  src={img}
                  alt={`modal-${idx}`}
                  className="d-block mx-auto"
                  style={{
                    maxHeight: "80vh",
                    objectFit: "contain",
                  }}
                />
              </div>
            ))}
          </Slider>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PostDetail;
