// ✅ sendMessageWithSocket.js
import axios from "axios";

export const sendMessageWithSocket = async ({
  senderId,
  receiverId,
  content,
  socket,
  setText,
  postInfo, // 🟢 thêm dòng này
}) => {
  if (!content.trim() || senderId === receiverId) return;

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
      senderId,
      receiverId,
      content,
      type: postInfo ? "post" : "text", // 🆗 phân biệt loại
      post: postInfo ? {
        postId: postInfo._id,
        title: postInfo.title,
        thumbnail: postInfo.image || postInfo.thumbnail || "", // nếu có
      } : undefined,
    });

    const msg = {
      ...res.data.data,
      senderId,
      receiverId,
      timestamp: res.data.data.createdAt,
    };
    
    socket.emit("sendMessage", msg);
    setText(""); // Clear input
  } catch (err) {
    console.error("❌ Gửi tin nhắn thất bại:", err);
  }
};
