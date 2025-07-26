// ✅ sendMessageWithSocket.js
import axios from "axios";

export const sendMessageWithSocket = async ({
  senderId,
  receiverId,
  content,
  socket,
  setText,
  postInfo,
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
      // ✅ Gắn postInfo vào để socket gửi đi
      postInfo: res.data.data.post || {
        title: postInfo?.title,
        thumbnail: postInfo?.image || postInfo?.thumbnail || "",
      },
    };

    socket.emit("sendMessage", msg);
    setText("");
  } catch (err) {
    console.error("❌ Gửi tin nhắn thất bại:", err);
  }
};
