// ✅ sendMessageWithSocket.js
import axios from "axios";

export const sendMessageWithSocket = async ({
  senderId,
  receiverId,
  content,
  socket,
  setText,
  postInfo,
  onSend,
}) => {
  if (!content.trim() || senderId === receiverId) return;

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
      senderId,
      receiverId,
      content,
      type: postInfo ? "post" : "text",
      post: postInfo
        ? {
            postId: postInfo._id,
            title: postInfo.title,
            thumbnail: postInfo.image || postInfo.thumbnail || "",
          }
        : undefined,
    });

    const msg = {
      ...res.data.data,
      senderId,
      receiverId,
      timestamp: res.data.data.createdAt,
      postInfo: res.data.data.post || postInfo,
    };

    socket.emit("sendMessage", msg);
    onSend?.(msg);     // ✅ gọi callback
    setText("");
  } catch (err) {
    console.error("❌ Gửi tin nhắn thất bại:", err);
  }
};
