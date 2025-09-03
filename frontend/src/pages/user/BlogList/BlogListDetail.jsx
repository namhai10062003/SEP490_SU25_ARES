import DOMPurify from "dompurify";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import {
  FaCalendarAlt,
  FaConciergeBell,
  FaExpand,
  FaFutbol,
  FaHeart,
  FaHospital,
  FaHotel,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaRegHeart,
  FaRulerCombined,
  FaSchool,
  FaStar,
  FaUmbrellaBeach
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Slider from "react-slick";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import Header from "../../../../components/header.jsx";
import LoadingModal from "../../../../components/loadingModal.jsx";
import UserInfo from "../../../../components/user/userInfor.jsx";
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
  const [contract, setContract] = useState(null);
  //chat 
  const { setReceiver, setPostInfo } = useChat();
  const [showChat, setShowChat] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPostsCount, setUserPostsCount] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    setLoading(true);
    if (post?.contactInfo?._id) {
      // console.log("📌 contactInfo có dữ liệu:", post.contactInfo);

      fetch(`${import.meta.env.VITE_API_URL}/api/posts/count/${post.contactInfo.userId || post.contactInfo._id}`)
        .then((res) => res.json())
        .then((data) => setUserPostsCount(data.count))
        .catch((err) => console.error("Lỗi lấy số tin đăng:", err));
    } else {
      // console.log("⚠️ contactInfo chưa có dữ liệu:", post?.contactInfo);
    }
    setLoading(false);
  }, [post]); // ✅ chạy lại khi post thay đổi
  // 👈 đổi lại: theo dõi toàn bộ post thay vì chỉ _id

  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token"); // lấy token
        const res = await fetch(`${API_URL}/api/contracts/by-post/${post._id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // gửi token
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        if (data.success) {
          setContract(data.data);
        } else {
          console.warn("API trả về không thành công:", data.message);
        }
      } catch (err) {
        console.error("Không lấy được hợp đồng:", err);
      } finally {
        setLoading(false);
      }
    };

    if (post?._id) fetchContract();
  }, [post]);

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

        // console.log("✅ ChatBox Props:", {
        //   currentUserId: user._id,
        //   receiverId: post.contactInfo.userId,
        //   receiverName: post.contactInfo.name,
        //   postId: post._id,
        // });
      } else {
        setReceiver(null);
        setPostInfo(null); // clear nếu là chủ bài
      }
    }
  }, [post, user]);

  // 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
        toast.error("Bài đăng đã hết hạn.");  // Hiện thông báo lỗi
        navigate("/blog");                    // Quay lại trang blog
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

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
              p.paymentStatus === "paid" && // ✅ Chỉ bài đã thanh toán
              (!p.expiredAt || new Date(p.expiredAt) > now) // ✅ Chưa hết hạn
            )
            .slice(0, 3);

          // console.log("👉 Related posts:", others);
          setRelatedPosts(others);
        }
      } catch (err) {
        console.error("Lỗi gợi ý:", err);
      }
    };

    fetchRelated();
  }, [id]);



  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    }).format(price);

  const handleLike = async () => {
    try {
      const res = await toggleLike(id);

      if (res.data.success) {
        setIsLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "❌ Like thất bại, vui lòng thử lại!";

      if (status === 401) {
        toast.warn("⚠️ Vui lòng đăng nhập để like bài viết!");
        // navigate("/login");
      } else {
        toast.error(msg);
      }
    }
  };

  const handleAddComment = async () => {
    // Giả sử có biến user hoặc token để check đăng nhập
    const token = localStorage.getItem("token"); // hoặc state user

    if (!token) {
      toast.warn("⚠️ Vui lòng đăng nhập để bình luận!");
      return;
    }

    if (!commentText.trim()) return;

    try {
      await addComment(id, commentText);
      const updated = await getComments(id);
      setComments(updated.data.data);
      setCommentText("");
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
    }
  };


  // Placeholder for report handler

  const handleReport = async () => {
    // Giả sử có biến user hoặc token để check đăng nhập
    const token = localStorage.getItem("token"); // hoặc state user

    if (!token) {
      toast.warn("⚠️ Vui lòng đăng nhập để bình luận!");
      return;
    }
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
        error?.response?.data?.message,
        { position: "top-right" }
      );
    }
  };

  if (loading) return <LoadingModal />;
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
            {/* Tiêu đề & giá */}
            <h2 className="fw-bold mb-2 text-dark">{post.title}</h2>
            <h4 className="fw-bold text-danger mb-4">
              {formatPrice(post.price)}
            </h4>

            {/* Thông tin nhanh */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-2">
                <FaRulerCombined className="text-primary me-2 fs-5" />
                <span><strong>Diện tích:</strong> {post.area} m²</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FaMapMarkerAlt className="text-danger me-2 fs-5" />
                <span><strong>Vị trí:</strong> {post.location}</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FaCalendarAlt className="text-warning me-2 fs-5" />
                <span>
                  <strong>Ngày đăng:</strong>{" "}
                  {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FaStar className="text-warning me-2 fs-5" />
                <span><strong>Gói:</strong> {post.postPackage?.type || "Standard"}</span>
              </div>

              {/* Tiện ích */}
              <div className="d-flex align-items-center">
                <FaConciergeBell className="text-secondary me-2 fs-5" />
                <strong className="me-2">Tiện ích:</strong>

                <span className="d-flex align-items-center me-2">
                  <FaUmbrellaBeach className="text-info fs-5" title="Bãi biển" />
                </span>
                <span className="me-2">||</span>

                <span className="d-flex align-items-center me-2">
                  <FaHospital className="text-danger fs-5" title="Bệnh viện" />
                </span>
                <span className="me-2">||</span>

                <span className="d-flex align-items-center me-2">
                  <FaSchool className="text-success fs-5" title="Trường học" />
                </span>
                <span className="me-2">||</span>

                <span className="d-flex align-items-center me-2">
                  <FaFutbol className="text-warning fs-5" title="Khu vui chơi" />
                </span>
                <span className="me-2">||</span>

                <span className="d-flex align-items-center">
                  <FaHotel className="text-primary fs-5" title="Khách sạn" />
                </span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              <button
                className={`btn ${isLiked ? "btn-danger" : "btn-outline-danger"} px-3`}
                onClick={handleLike}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />} {likeCount}
              </button>
              <button
                className="btn btn-outline-primary px-3"
                onClick={() => {
                  setShowComments((prev) => !prev);
                  setTimeout(() => {
                    const el = document.getElementById("comments");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }}
              >
                💬 Bình luận
              </button>
              <button
                className="btn btn-outline-warning px-3"
                onClick={() => setShowReportModal(true)}
              >
                🚩 Báo cáo
              </button>
              <button
                className="btn btn-success px-3"
                onClick={() => {
                  const token = localStorage.getItem("token"); // hoặc state user

                  if (!token) {
                    toast.info("⚠️ Vui lòng đăng nhập để đặt cọc!", {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                    });
                    return; // dừng ở đây, không navigate
                  }

                  if (contract?.paymentStatus === "paid") {
                    toast.info("Căn hộ/bất động sản này đã được đặt cọc", {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                    });
                    return;
                  }

                  navigate(`/booking/${post._id}`);
                }}
                disabled={post.type === "dich_vu"}
              >
                📄 Đặt Cọc
              </button>

            </div>
          </div>

          <div className="row">
            {/* Cột Mô tả */}
            <div className="col-md-8">
              <div>
                <h5 className="mb-3 d-flex align-items-center text-primary fw-bold">
                  <FaInfoCircle className="me-2" /> Mô tả
                </h5>

                <div
                  className="bg-white rounded-4 shadow-sm border p-4"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.7",
                    color: "#444",
                    borderColor: "#f0f0f0",
                  }}
                >
                  <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                  {post.description &&
  DOMPurify.sanitize(post.description, {
    ALLOWED_TAGS: ["ul", "li", "strong", "p", "br"],
    ALLOWED_ATTR: [],
  })
    .split(/\n+/) // nếu description là text có xuống dòng
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const isSectionTitle =
        line.startsWith("✨") || /THÔNG TIN/i.test(line);
      const isBullet = line.startsWith("•") || /^\d+\./.test(line);

      return (
        <li
          key={index}
          className={`d-flex align-items-start ${
            isSectionTitle
              ? "bg-primary bg-opacity-10 fw-bold text-primary"
              : "bg-light"
          } p-3 mb-2 rounded-3 border`}
          style={{
            gap: "12px",
            borderColor: "#eee",
            transition: "all 0.25s ease",
            cursor: "default",
            textAlign: "justify", // căn đều cho đẹp
            whiteSpace: "pre-line", // giữ xuống dòng
          }}
          onMouseEnter={(e) =>
            !isSectionTitle &&
            (e.currentTarget.style.backgroundColor = "#f8faff")
          }
          onMouseLeave={(e) =>
            !isSectionTitle &&
            (e.currentTarget.style.backgroundColor = "#f8f9fa")
          }
        >
          {/* {isSectionTitle ? (
            <span style={{ fontSize: "1.2rem" }}>✨</span>
          ) : (
            <FaCheckCircle
              style={{
                color: "#0d6efd",
                marginTop: "4px",
                fontSize: "1.1rem",
                flexShrink: 0,
              }}
            />
          )} */}

          <span
            dangerouslySetInnerHTML={{
              __html: line.replace(
                /^([^:]+):/,
                "<strong style=''>$1:</strong>"
              ),
            }}
          />
        </li>
      );
    })}

                  </ul>
                </div>
              </div>
            </div>
            {/* Cột UserInfo */}
            <div className="col-md-4">
              <div className="rounded-2xl p-3">
                <UserInfo
                  user={post.contactInfo}
                  postCount={userPostsCount}
                  relatedCount={19}
                  onOpenProfile={() => navigate(`/user/${post?.contactInfo?._id}`)}
                />
              </div>
            </div>
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
            <h4>🗂️ Bài đăng gợi ý</h4>
            <div className="row g-3">
              {relatedPosts.map((rp) => {
                // Cắt title còn 1/2
                const truncatedTitle =
                  rp.title.length > 0
                    ? rp.title.slice(0,50) + "..."
                    : "";

                // Cắt mô tả còn 20 ký tự
                const truncatedDesc =
                  rp.description && rp.description.length > 20
                    ? rp.description.slice(0, 20) + "..."
                    : rp.description || "";

                return (
                  <div className="col-md-4" key={rp._id}>
                    <div className="card h-100 shadow-sm" style={{ cursor: "pointer" }} onClick={() => navigate(`/postdetail/${rp._id}`)}>
                      <img
                        src={rp.images?.[0] || "https://via.placeholder.com/300x200"}
                        className="card-img-top"
                        alt={rp.title}
                        style={{ height: 150, objectFit: "cover" }}
                      />
                      <div className="card-body d-flex flex-column justify-content-between">
                        <h5 className="card-title">{truncatedTitle}</h5>
                        {truncatedDesc.split("\n").map((line, index) => (
                          <span
                            key={index}
                            dangerouslySetInnerHTML={{
                              __html: line.replace(
                                /^([^:]+):/,
                                "<strong style='color:#0d6efd'>$1:</strong>"
                              ) + "<br/>", // thêm xuống dòng nếu muốn
                            }}
                          />
                        ))}
                         {/* Thêm location */}
                {rp.location && (
                  <p className="text-muted mb-2">
                    <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
                    {rp.location}
                  </p>
                )}
                        <p className="card-text fw-bold fs-5 text-danger">{formatPrice(rp.price)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
      {/* ✅ Loading toàn màn hình */}
      {loading && <LoadingModal />}
    </>
  );
};

export default PostDetail;