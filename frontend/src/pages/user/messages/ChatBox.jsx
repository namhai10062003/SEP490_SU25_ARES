import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useChat } from "../../../../context/ChatContext";
import { useVideoCall } from "../../../../context/VideoCallContext";
import { sendMessageWithSocket } from "./utils/sendMessageWithSocket";
const socket = io(`${import.meta.env.VITE_API_URL}`, { withCredentials: true });
const ChatBox = ({ currentUserId, receiverId, receiverName, postInfo }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chatEndRef = useRef(null);
  const { callUser } = useVideoCall();
  const { setPostInfo } = useChat(); 
  // Nhận tin nhắn mới qua socket
  const handleReceive = (rawMsg) => {
    const msg = {
      _id: rawMsg._id || Math.random().toString(36).substring(7),
      senderId: rawMsg.senderId || rawMsg.sender,
      receiverId: rawMsg.receiverId || rawMsg.receiver,
      content: rawMsg.content,
      timestamp: rawMsg.timestamp || rawMsg.createdAt || new Date(),
      type: rawMsg.type || "text",
      postInfo: rawMsg.post || rawMsg.postInfo || null,
    };

    const isValid =
      (msg.senderId === receiverId && msg.receiverId === currentUserId) ||
      (msg.senderId === currentUserId && msg.receiverId === receiverId);

    if (!isValid) return;

    setMessages((prev) => {
      const existed = prev.find(
        (m) =>
          m._id === msg._id ||
          (
            m.content === msg.content &&
            m.senderId === msg.senderId &&
            new Date(m.timestamp).getTime() === new Date(msg.timestamp).getTime()
          )
      );
      if (existed) return prev;
      return [...prev, msg];
    });
  };

  useEffect(() => {
    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, []);

  useEffect(() => {
    if (!currentUserId || !receiverId) return;
  
    socket.emit("joinRoom", { senderId: currentUserId, receiverId });
  
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${currentUserId}/${receiverId}`);
        
        // Giữ nguyên logic cũ: chuẩn hóa tin nhắn
        const normalized = res.data.data.map((msg) => ({
          _id: msg._id,
          senderId: msg.sender,
          receiverId: msg.receiver,
          content: msg.content,
          timestamp: msg.createdAt,
          type: msg.type || "text",
          postInfo: msg.post || null, // ✅ chính xác
        }));
        setMessages(normalized);
  
        // ✅ Nếu chưa có postInfo từ props, tự lấy từ tin nhắn đầu có postInfo
        if (!postInfo) {
          const msgWithPost = normalized.find((msg) => msg.postInfo);
          if (msgWithPost) {
            setPostInfo(msgWithPost.postInfo);
          }
        }
        console.log("🪵 Tin nhắn từ API:", res.data.data);

      } catch (err) {
        console.error("❌ Lỗi khi tải tin nhắn:", err);
      }
    };
  
    fetchMessages();
  
    socket.off("receiveMessage", handleReceive);
    socket.on("receiveMessage", handleReceive);
  
    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [currentUserId, receiverId]);
  

  const sendMessage = async () => {
    if (!text.trim()) return;
    await sendMessageWithSocket({
      senderId: currentUserId,
      receiverId,
      content: text,
      socket,
      setMessages,
      setText,
      postInfo,
    });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  console.log("📦 postInfo:", postInfo);
  
  return (
    <div className="d-flex flex-column h-100">
    {/* Header */}
    
    <div className="d-flex align-items-center border-bottom pb-2 mb-2">
      <span className="me-2 fs-4 text-success">💬</span>
      <span>
        Đoạn hội thoại với <strong>{receiverName || "người dùng"}</strong>
      </span>
      <button
        onClick={() => callUser(receiverId)}
        className="btn btn-success btn-sm ms-auto"
      >
        📞 Gọi
      </button>
    </div>

    {/* Messages */}
    <div className="flex-grow-1 overflow-auto mb-2" style={{ minHeight: 200, maxHeight: 300 }}>
      {/* ✅ Tin hệ thống hiển thị bài viết đang chat */}
      {postInfo && (
  <div
    className="d-flex align-items-center gap-2 px-3 py-2 border-bottom"
    style={{ background: "#f9f9f9" }}
  >
    <img
      src={postInfo.image || postInfo.thumbnail || "/default.jpg"} // ✅ sửa ở đây
      alt="Ảnh bài đăng"
      style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
    />
    <div>
      <div className="fw-bold">{postInfo.title}</div>
      {/* ✅ Nếu không có giá thì không hiển thị */}
      {postInfo.price && (
        <div className="text-muted small">
          Giá: {postInfo.price.toLocaleString("vi-VN")} VNĐ
        </div>
      )}
    </div>
  </div>
)}

      {/* ✅ Tin nhắn người dùng */}
      {messages.map((msg, idx) => {
        const isCurrentUser = msg.senderId === currentUserId;
        return (
          <div
            key={msg._id || idx}
            className={`d-flex flex-column mb-2 ${isCurrentUser ? "align-items-end" : "align-items-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-3 ${isCurrentUser ? "bg-success text-white" : "bg-light border"}`}
              style={{ maxWidth: "75%", wordBreak: "break-word" }}
            >
              <div className="small mb-1" style={{ opacity: 0.7 }}>
                {isCurrentUser ? "Bạn" : receiverName || "Người gửi"}
              </div>
              <div>{msg.content}</div>
              <div className="text-end small mt-1" style={{ opacity: 0.6 }}>
                {new Date(msg.timestamp || msg.createdAt).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour12: false,
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={chatEndRef} />
    </div>

    {/* Input */}
    <div className="input-group">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhập tin nhắn..."
        className="form-control"
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />
      <button className="btn btn-primary" onClick={sendMessage}>
        Gửi
      </button>
    </div>
  </div>
);
};

export default ChatBox;