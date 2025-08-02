import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import {
  FaCalendarAlt,
  FaExpand,
  FaHeart,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaRegHeart,
  FaRulerCombined,
  FaStar,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Slider from "react-slick";
import { toast } from "react-toastify";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import Header from "../../../../components/header.jsx";
import { useChat } from "../../../../context/ChatContext.jsx";
import { useAuth } from "../../../../context/authContext.jsx";
import {
  addComment,
  checkLiked,
  getComments,
  getLikeCount,
  reportPost,
  toggleLike,
} from "../../../service/postInteractionService.js";
import {
  getAllPosts,
  getPostById,
} from "../../../service/postService.js";

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

  // New: toggles for comment & report
  const [showComments, setShowComments] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  //chat 
  const { setReceiver, setPostInfo } = useChat();
  const [showChat, setShowChat] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  // hàm thực hiện chat vs người bài đăng 
  useEffect(() => {
    if (post?.contactInfo?.userId) {
      if (user && user._id !== post.contactInfo.userId) {
        setReceiver({
          id: post.contactInfo.userId,
          name: post.contactInfo.name,
        });

        // ✅ Set postInfo ở đây
        setPostInfo({
          id: post._id,
          title: post.title,
          image: post.images?.[0] || "",
          price: post.price,
        });

        console.log("✅ ChatBox Props:", {
          currentUserId: user._id,
          receiverId: post.contactInfo.userId,
          receiverName: post.contactInfo.name,
          postId: post._id,
        });
      } else {
        setReceiver(null);
        setPostInfo(null); // clear nếu là chủ bài
      }
    }
  }, [post, user]);

  // 
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
        setErr("Có lỗi khi tải dữ liệu bài đăng.");
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
        if (res.data.success && Array.isArray(res.data.data)) {
          const now = new Date();
          const others = res.data.data
            .filter((p) =>
              p._id !== id &&
              p.status === "approved" &&
              // p.isActive === false &&
              // p.paymentStatus === "paid" &&
              (!p.expiredAt || new Date(p.expiredAt) > now)
            )
            .slice(0, 3);
  
          console.log("👉 Related posts:", others); // log sau khi lọc
  
          setRelatedPosts(others);
        }
      } catch (err) {
        console.error("Lỗi gợi ý:", err); // log lỗi chi tiết
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

  // Placeholder for report handler

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.warn("Vui lòng nhập lý do báo cáo!", { position: "top-right" });
      return;
    }
    try {
      await reportPost(id, { reason: reportReason, description: reportDescription });
      toast.success("Đã gửi báo cáo!", { position: "top-right" });
      setReportReason("");
      setReportDescription("");
      setShowReport(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Gửi báo cáo thất bại.",
        { position: "top-right" }
      );
    }
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
                style={{
                  width: "100%",
                  height: 400, // fixed height
                  objectFit: "cover",
                  background: "#f5f5f5"
                }}
              />
              <button
                className="btn btn-light position-absolute top-0 end-0 m-2"
                onClick={() => setShowModal(true)}
              >
                <FaExpand />
              </button>
            </div>

            {/* Thumbnails in slick */}
            {(post.images || []).length > 1 ? (
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
                          background: "#f5f5f5"
                        }}
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            ) : null}


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
              className="btn btn-outline-primary me-2"
              onClick={() => {
                setShowComments((prev) => !prev);
                setTimeout(() => {
                  const el = document.getElementById("comments");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100); // wait for render
              }}
            >
              💬 Bình luận
            </button>

            <button
              className="btn btn-outline-warning me-2"
              onClick={() => setShowReportModal(true)}
            >
              🚩 Báo cáo
            </button>


            <button
              className="btn btn-success"
              onClick={() => navigate(`/booking/${post._id}`)}
            >
              📄 Đặt chỗ
            </button>
          </div>
        </div>
        {/* {user && post.contactInfo?.userId !== user._id && (
  <button
    className="btn btn-outline-primary btn-sm"
    onClick={() => {
      setReceiver({
        id: post.contactInfo.userId,
        name: post.contactInfo.name,
      });

      setPostInfo({
        id: post._id,
        title: post.title,
        image: post.images?.[0] || "", // lấy ảnh đầu tiên nếu có
        price: post.price,
      });
    }}
  >
    💬 Nhắn tin với người đăng
  </button>
)} */}
        {/* {selectedUser && selectedPost && showChat && (
  <ChatBox
    currentUserId={user._id}
    receiverId={selectedUser._id}
    receiverName={selectedUser.name}
    postInfo={selectedPost}
  />
)} */}
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
        {showComments && (
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
        )}

        {/* Report */}
        {showReport && (
          <div className="mt-4">
            <h4>🚩 Báo cáo</h4>
            <input
              className="form-control mb-2"
              placeholder="Lý do báo cáo"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <textarea
              className="form-control mb-2"
              placeholder="Mô tả chi tiết (tuỳ chọn)"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
            <button className="btn btn-warning mb-3" onClick={handleReport}>
              Gửi báo cáo
            </button>
          </div>
        )}

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-4">
            <h4>🗂️ bài đăng gợi ý</h4>
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
                    width: "100%",
                    height: "70vh", // or 60vh if you want less height
                    objectFit: "cover",
                    background: "#f5f5f5",
                    borderRadius: 8,
                  }}
                />
              </div>
            ))}
          </Slider>
        </Modal.Body>
      </Modal>
      {/* Report Modal */}
      <Modal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>🚩 Báo cáo bài đăng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label fw-bold">Lý do báo cáo <span className="text-danger">*</span></label>
            <select
              className="form-select"
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
            >
              <option value="">-- Chọn lý do --</option>
              <option value="Tin giả mạo">Tin giả mạo</option>
              <option value="Nội dung không phù hợp">Nội dung không phù hợp</option>
              <option value="Lừa đảo">Lừa đảo</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Mô tả chi tiết (tuỳ chọn)</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Nhập mô tả chi tiết nếu cần..."
              value={reportDescription}
              onChange={e => setReportDescription(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowReportModal(false)}
            disabled={reportLoading}
          >
            Huỷ
          </button>
          <button
            className="btn btn-warning"
            disabled={!reportReason || reportLoading}
            onClick={async () => {
              if (!reportReason) return;
              setReportLoading(true);
              try {
                await reportPost(id, { reason: reportReason, description: reportDescription });
                toast.success("Đã gửi báo cáo!", { position: "top-right" });
                setShowReportModal(false);
                setReportReason("");
                setReportDescription("");
              } catch (error) {
                toast.error(
                  error?.response?.data?.message || "Gửi báo cáo thất bại.",
                  { position: "top-right" }
                );
              }
              setReportLoading(false);
            }}
          >
            {reportLoading ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PostDetail;