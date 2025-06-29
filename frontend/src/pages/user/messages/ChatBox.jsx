import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useVideoCall } from "../../../../context/VideoCallContext";

const socket = io("http://localhost:4000", { withCredentials: true });

const ChatBox = ({ currentUserId, receiverId, receiverName }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chatEndRef = useRef(null);
  const { callUser } = useVideoCall(); // ✅ dùng đúng tên từ context

  // Hàm xử lý nhận tin nhắn
  const handleReceive = (msg) => {
    console.log("📩 [SOCKET] Nhận tin nhắn:", msg);

    if (msg.fromSelf) return;

    const isValid =
      (msg.senderId === receiverId && msg.receiverId === currentUserId) ||
      (msg.senderId === currentUserId && msg.receiverId === receiverId);

    if (!isValid) return;

    setMessages((prev) => {
      if (prev.find((m) => m._id === msg._id || m.content === msg.content)) {
        return prev;
      }
      return [...prev, msg];
    });
  };

  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    socket.emit("joinRoom", { senderId: currentUserId, receiverId });

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/messages/${currentUserId}/${receiverId}`);
        const normalized = res.data.data.map((msg) => ({
          ...msg,
          senderId: msg.sender,
          receiverId: msg.receiver,
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
    if (!text.trim() || currentUserId === receiverId) return;

    const message = {
      senderId: currentUserId,
      receiverId,
      content: text,
    };

    try {
      const res = await axios.post("http://localhost:4000/api/messages", message);
      const newMsg = {
        ...res.data.data,
        senderId: currentUserId,
        receiverId,
        fromSelf: true,
      };
      socket.emit("sendMessage", newMsg);
      setText("");
      setMessages((prev) => [...prev, newMsg]); // thêm vào local luôn
    } catch (err) {
      console.error("❌ Gửi tin nhắn thất bại:", err);
    }
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