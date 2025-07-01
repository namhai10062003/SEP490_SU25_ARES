import React, { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaHeart,
  FaMapMarkerAlt,
  FaRegHeart,
  FaRulerCombined,
  FaStar,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../../components/header.jsx";
import { useChat } from "../../../../context/ChatContext.jsx"; // THÊM
import { useAuth } from "../../../../context/authContext.jsx";
// import ChatBox from "../messages/ChatBox";
import {
  addComment,
  checkLiked,
  getComments,
  getLikeCount,
  reportPost,
  toggleLike,
} from "../../../service/postInteractionService.js";
import { getPostById } from "../../../service/postService.js";
const PostDetail = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();

  const [name, setName] = useState(null);
  const [post, setPost] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showReport, setShowReport] = useState(false);
  // const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();
  const { setReceiver } = useChat(); // THÊM
  useEffect(() => setName(user?.name || null), [user]);
// hàm fetch data bài post chi tiết 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, commentRes, likedRes, countRes] = await Promise.all([
          getPostById(id),
          getComments(id),
          checkLiked(id),
          getLikeCount(id),
        ]);

        if (postRes.data.success) {
          setPost(postRes.data.data);
          setSelectedImage(postRes.data.data.images?.[0] || null);
        } else {
          setErr("Không tìm thấy bài đăng.");
        }

        setComments(commentRes.data.data);
        setIsLiked(likedRes.data.liked);
        setLikeCount(countRes.data.count);
      } catch (error) {
        setErr("Có lỗi xảy ra khi tải dữ liệu bài viết.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);
// hàm xử lí like 
  const handleLike = async () => {
    try {
      await toggleLike(id);
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch {
      console.error("Lỗi like bài viết");
    }
  };
//hàm xử lí comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment(id, commentText);
      const updated = await getComments(id);
      setComments(updated.data.data);
      setCommentText("");
    } catch {
      console.error("Lỗi gửi bình luận");
    }
  };
//hàm xử lí report 
  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.warn("Vui lòng nhập lý do báo cáo!", { position: "top-right" });
      return;
    }
    try {
      const payload = {
        reason: reportReason,
        description: reportDescription,
      };
      await reportPost(id, payload);
      toast.success("Đã gửi báo cáo!", { position: "top-right" });
      setReportReason("");
      setReportDescription("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Gửi báo cáo thất bại.",
        { position: "top-right" }
      );
    }
  };
//hàm xử lí effect nhắn tin dễ dàng
useEffect(() => {
  if (post?.contactInfo?.userId) {
    if (user && user._id !== post.contactInfo.userId) {
      setReceiver({
        id: post.contactInfo.userId,
        name: post.contactInfo.name,
      });
    } else {
      setReceiver(null); // Nếu là chính mình đăng bài, không mở chat
    }
  }
}, [post, user]);

// hàm xử lí giá tiền 
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  if (loading || !post)
    return (
      <div style={styles.container}>
        <Header user={user} name={name} logout={logout} />
        <p style={styles.loading}>Đang tải dữ liệu…</p>
      </div>
    );

  if (err)
    return (
      <div style={styles.container}>
        <Header user={user} name={name} logout={logout} />
        <p style={{ ...styles.loading, color: "red" }}>{err}</p>
      </div>
    );
    console.log("🧾 Receiver ID:", post?.contactInfo?.userId);
  return (
    <div style={styles.container}>
      <Header user={user} name={name} logout={logout} />
      <div style={styles.detailWrapper}>
        <div style={styles.content}>
          <div style={styles.imageColumn}>
            <div style={styles.mainImageWrapper}>
              {selectedImage ? (
                <img src={selectedImage} alt="main" style={styles.mainImage} />
              ) : (
                <div style={styles.noImage}>🏠 Không có ảnh</div>
              )}
            </div>
            <div style={styles.thumbnailList}>
              {(post.images || []).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`thumb-${i}`}
                  style={{
                    ...styles.thumbnail,
                    border:
                      img === selectedImage ? "2px solid #d4a762" : "2px solid transparent",
                  }}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>

          <div style={styles.infoColumn}>
            <h1 style={styles.title}>{post.title}</h1>
            <p style={styles.price}>{formatPrice(post.price)}</p>
            {/* <button style={styles.contactBtn}>Nhắn tin</button> */}

          

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📌 Mô tả dự án</h3>
              {post.description?.split("\n").map((line, idx) => (
                <p key={idx} style={styles.descLine}>
                  {line}
                </p>
              ))}
            </div>
           

            <div style={iconStyles.wrapper}>
              <IconInfoRow icon={<FaRulerCombined />} label="Diện tích" value={`${post.area} m²`} />
              <IconInfoRow icon={<FaMapMarkerAlt />} label="Vị trí" value={post.location} />
              <IconInfoRow icon={<FaCalendarAlt />} label="Ngày đăng" value={new Date(post.createdAt).toLocaleDateString("vi-VN")} />
              <IconInfoRow icon={<FaStar />} label="Loại bài" value={post.postPackage?.type || "Standard"} />
              <IconInfoRow icon={<FaCheckCircle />} label="Trạng thái" value={post.status === "active" ? "Hoạt động" : "Ẩn"} />
            </div>

            <div style={styles.section}>
            <div style={styles.interactionBox}>
            <button
  style={{
    ...styles.iconBtn,
    ...styles.likeBtn,
    backgroundColor: isLiked ? "#e74c3c" : "#fff",
    color: isLiked ? "#fff" : "#e74c3c",
    border: `2px solid #e74c3c`,
  }}
  onClick={handleLike}
>
  {isLiked ? <FaHeart /> : <FaRegHeart />} {likeCount}
</button>
  <button
    style={{ ...styles.iconBtn, ...styles.commentBtnToggle }}
    onClick={() => setShowComments((prev) => !prev)}
  >
    💬 Bình luận
  </button>
  <button
    style={{ ...styles.iconBtn, ...styles.reportBtnToggle }}
    onClick={() => setShowReport((prev) => !prev)}
  >
    🚩 Báo cáo
  </button>
</div>

            {showComments && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>💬 Bình luận</h3>
                <textarea
                  placeholder="Viết bình luận..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={styles.textarea}
                />
                <button onClick={handleAddComment} style={styles.commentBtn}>
                  Gửi
                </button>
                {comments.map((c, idx) => (
                  <div key={idx} style={styles.commentItem}>
                    <strong>{c.user?.name || "Ẩn danh"}:</strong> {c.content}
                  </div>
                ))}
              </div>
            )}

            {showReport && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🚩 Báo cáo</h3>
                <input
                  placeholder="Lý do báo cáo"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={styles.input}
                />
                <textarea
                  placeholder="Mô tả chi tiết (tuỳ chọn)"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  style={styles.textarea}
                />
                <button onClick={handleReport} style={styles.reportBtn}>
                  Gửi báo cáo
                </button>
              </div>
            )}
              <h3 style={styles.sectionTitle}>📞 Liên hệ</h3>
              <p>👤 {post.contactInfo?.name}</p>
              {/* {user && post.contactInfo?.userId && (
  <div> */}
    {/* Nút icon để toggle */}
    {/* <span
      className="material-symbols-rounded"
      style={{ fontSize: 30, color: "#2ecc71", cursor: "pointer", marginBottom: 10 }}
      onClick={() => setShowChat((prev) => !prev)}
    >
      chat
    </span> */}

    {/* Khung chat chỉ hiện khi showChat === true */}
    {/* {showChat &&
      (user._id === post.contactInfo.userId ? (
        <Inbox currentUserId={user._id} />
      ) : (
        <ChatBox
          currentUserId={user._id}
          receiverId={post.contactInfo.userId}
          receiverName={post.contactInfo.name}
        />
      ))}
  </div>
)} */}




              <p>📧 {post.contactInfo?.email}</p>
              {/* <p>📱 {post.contactInfo?.phone}</p> */}
              {user && post.contactInfo?.userId && (
  <div>
    <span
      className="material-symbols-rounded"
      style={{
        fontSize: 30,
        color: "#2ecc71",
        cursor: "pointer",
        marginBottom: 10,
      }}
      onClick={() => {
        // ✅ Luôn mở chat tới người đăng bài
        setReceiver({
          id: post.contactInfo.userId,
          name: post.contactInfo.name,
        });
      }}
    >
      chat
    </span>
  </div>
)}
<button
  style={{ ...styles.contactBtn, backgroundColor: "#27ae60" }}
  onClick={() => navigate(`/booking/${post._id}`)}
>
  📄 Đặt chỗ
</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const IconInfoRow = ({ icon, label, value }) => (
  <div style={iconStyles.item}>
    <span style={iconStyles.icon}>{icon}</span>
    <div>
      <div style={iconStyles.value}>{value}</div>
      <div style={iconStyles.label}>{label}</div>
    </div>
  </div>
);

const styles = {
  container: { width: "205vh", background: "#f9f9f9", minHeight: "100vh" },
  detailWrapper: { maxWidth: 1200, margin: "0 auto", padding: 20 },
  content: { display: "flex", flexWrap: "wrap", gap: 24 },
  imageColumn: { flex: 1, minWidth: 300 },
  mainImageWrapper: { width: "100%", height: 400, background: "#f0f0f0", borderRadius: 8, overflow: "hidden", marginBottom: 12 },
  mainImage: { width: "100%", height: "100%", objectFit: "cover" },
  thumbnailList: { display: "flex", flexDirection: "column", gap: 8 },
  thumbnail: { width: 80, height: 60, objectFit: "cover", borderRadius: 6, cursor: "pointer" },
  noImage: { width: "100%", height: 400, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#888" },
  infoColumn: { flex: 2, minWidth: 400 },
  title: { fontSize: "1.8rem", fontWeight: "bold", marginBottom: 8 },
  price: { fontSize: "1.5rem", color: "#e74c3c", marginBottom: 16 },
  contactBtn: { background: "#d4a762", color: "#fff", padding: "10px 20px", border: "none", borderRadius: 6, cursor: "pointer", marginBottom: 10 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: "1.2rem", fontWeight: "bold", marginBottom: 8 },
  descLine: { marginBottom: 10, whiteSpace: "pre-line", lineHeight: 1.6, textAlign: "justify", color: "#555" },
  loading: { textAlign: "center", marginTop: 80, fontSize: "1.2rem" },
  commentItem: { background: "#f1f1f1", padding: 10, borderRadius: 6, marginBottom: 10 },
  textarea: { width: "100%", padding: 10, borderRadius: 6, marginBottom: 10, resize: "none", minHeight: 60 },
  commentBtn: { padding: "8px 16px", background: "#3498db", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  input: { width: "100%", padding: 10, borderRadius: 6, marginBottom: 10, border: "1px solid #ccc" },
  reportBtn: { padding: "8px 16px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  interactionBox: { display: "flex", gap: 12, marginBottom: 24 },
  // iconBtn: { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#eee", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer", fontSize: 14 },
  likeBtn: {
    backgroundColor: "#e74c3c", // đỏ
    color: "#fff",
    border: "none",
  },
  commentBtnToggle: {
    backgroundColor: "#3498db", // xanh dương
    color: "#fff",
    border: "none",
  },
  reportBtnToggle: {
    backgroundColor: "#f39c12", // cam sáng
    color: "#fff",
    border: "none",
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "bold",
    transition: "all 0.3s ease",
  },
  
};

const iconStyles = {
  wrapper: { display: "flex", flexWrap: "wrap", gap: 24, borderTop: "1px solid #eee", paddingTop: 20, marginBottom: 20 },
  item: { display: "flex", alignItems: "center", gap: 10, minWidth: 160 },
  icon: { fontSize: 22, color: "#444" },
  value: { fontWeight: "bold", fontSize: "1rem" },
  label: { fontSize: "0.8rem", color: "#666" },
};

export default PostDetail;