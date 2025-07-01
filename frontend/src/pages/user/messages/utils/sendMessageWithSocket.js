// ✅ sendMessageWithSocket.js
import axios from "axios";

export const sendMessageWithSocket = async ({
  senderId,
  receiverId,
  content,
  socket,
  setText,
}) => {
  if (!content.trim() || senderId === receiverId) return;

  try {
    const res = await axios.post("http://localhost:4000/api/messages", {
      senderId,
      receiverId,
      content,
    });

    const msg = {
      ...res.data.data,
      senderId,
      receiverId,
      timestamp: res.data.data.createdAt,
    };

    // ✅ Chỉ emit, KHÔNG gọi setMessages ở đây
    socket.emit("sendMessage", msg);

    setText(""); // Clear input
  } catch (err) {
    console.error("❌ Gửi tin nhắn thất bại:", err);
  }
};
