import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useVideoCall } from "../../../../context/VideoCallContext";
import { sendMessageWithSocket } from "./utils/sendMessageWithSocket";
const socket = io("http://localhost:4000", { withCredentials: true });

const ChatBox = ({ currentUserId, receiverId, receiverName }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chatEndRef = useRef(null);
  const { callUser } = useVideoCall(); // ✅ dùng đúng tên từ context

  // Hàm xử lý nhận tin nhắn
  const handleReceive = (rawMsg) => {
    console.log("📩 [SOCKET] Nhận tin nhắn:", rawMsg);
  
    const msg = {
      _id: rawMsg._id || Math.random().toString(36).substring(7),
      senderId: rawMsg.senderId || rawMsg.sender,
      receiverId: rawMsg.receiverId || rawMsg.receiver,
      content: rawMsg.content,
      timestamp: rawMsg.timestamp || rawMsg.createdAt || new Date(),
      type: rawMsg.type || "text",
    };
  
    const isValid =
      (msg.senderId === receiverId && msg.receiverId === currentUserId) ||
      (msg.senderId === currentUserId && msg.receiverId === receiverId);
  
    if (!isValid) {
      console.log("⛔ Không đúng người, bỏ qua:", msg);
      return;
    }
  
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
  
      if (existed) {
        console.log("⚠️ Tin nhắn trùng, không thêm lại.");
        return prev;
      }
  
      console.log("✅ Thêm tin nhắn mới:", msg);
      return [...prev, msg];
    });
  };
  
  
// ✅ Socket listener chỉ đăng ký 1 lần duy nhất
useEffect(() => {
  socket.on("receiveMessage", handleReceive);
  return () => socket.off("receiveMessage", handleReceive);
}, []);


  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    socket.emit("joinRoom", { senderId: currentUserId, receiverId });

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/messages/${currentUserId}/${receiverId}`);
        const normalized = res.data.data.map((msg) => ({
          _id: msg._id,
          senderId: msg.sender,
          receiverId: msg.receiver,
          content: msg.content,
          timestamp: msg.createdAt,
          type: msg.type || "text",
        }));
        setMessages(normalized);
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
    await sendMessageWithSocket({
      senderId: currentUserId,
      receiverId,
      content: text,
      socket,
      setMessages,
      setText,
    });
  };
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.chatBox}>
      <div style={styles.header}>
        <span className="material-symbols-rounded" style={styles.chatIcon}>chat</span>
        <span>Đoạn hội thoại với <strong>{receiverName || "người dùng"}</strong></span>

        {/* ✅ Nút gọi video */}
        <button
onClick={() => callUser(receiverId)} // ✅ dùng đúng hàm
          style={{
            marginLeft: "auto",
            background: "#27ae60",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "6px 10px"
          }}
        >
          📞 Gọi
        </button>
      </div>

      <div style={styles.messages}>
        {messages.map((msg, idx) => {
          const isCurrentUser = msg.senderId === currentUserId;
          return (
            <div
              key={msg._id || idx}
              style={{
                ...styles.message,
                alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                backgroundColor: isCurrentUser ? "#d1f0d1" : "#eee",
              }}
            >
              <div style={{ fontSize: "0.9rem", marginBottom: 4 }}>
                {isCurrentUser ? "Bạn" : receiverName || "Người gửi"}
              </div>
              <div>{msg.content}</div>
              <div style={styles.timestamp}>
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
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          style={styles.input}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>Gửi</button>
      </div>
    </div>
  );
};

const styles = {
  chatBox: {
    borderTop: "1px solid #ccc",
    paddingTop: 16,
    marginTop: 30,
  },
  messages: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxHeight: 250,
    overflowY: "auto",
    padding: 8,
    background: "#f9f9f9",
    borderRadius: 6,
    marginBottom: 10,
  },
  message: {
    padding: 10,
    borderRadius: 8,
    maxWidth: "70%",
    wordBreak: "break-word",
  },
  inputArea: {
    display: "flex",
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  sendBtn: {
    padding: "10px 20px",
    background: "#2ecc71",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  header: {
    display: "flex",
    alignItems: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
    gap: 8,
  },
  chatIcon: {
    fontSize: 24,
    color: "#2ecc71",
  },
  timestamp: {
    fontSize: "0.75rem",
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  }
};

export default ChatBox;