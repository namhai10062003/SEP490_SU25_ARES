import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/interaction`;

// ✅ Chỉ trả về object headers như axios yêu cầu
const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/* 👍 Like / Unlike */
export const toggleLike = (postId) =>
  axios.post(`${API}/likes/${postId}`, null, getAuthHeader());

/* ✅ Kiểm tra người dùng đã like hay chưa */
export const checkLiked = (postId) =>
  axios.get(`${API}/likes/${postId}`, getAuthHeader());

/* ❤️ Lấy tổng số lượt like */
export const getLikeCount = (postId) =>
  axios.get(`${API}/${postId}/count`);

/* 💬 Thêm bình luận */
export const addComment = (postId, content) =>
  axios.post(
    `${API}/comments/${postId}`,
    { content },
    getAuthHeader()
  );

/* 📖 Lấy danh sách bình luận */
export const getComments = (postId) =>
  axios.get(`${API}/comments/${postId}`); // Không cần token

/* 🚩 Gửi báo cáo */
export const reportPost = (postId, { reason, description }) =>
  axios.post(
    `${API}/reports/${postId}`,
    { data: { reason, description } },   // 👈 Backend cần bọc trong "data"
    getAuthHeader()
  );
