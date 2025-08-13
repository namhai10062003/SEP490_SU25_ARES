import axios from "axios";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../context/authContext";

const AIChatBox = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/ai/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Lỗi khi tải lịch sử chat:", err));
  }, [token]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userInput = input;
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setInput("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/chat`,
        { message: userInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.reply) {
        setMessages((prev) => [...prev, { sender: "ai", text: res.data.reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Lỗi khi gọi AI." },
      ]);
    }
  };

  // Kéo thả
  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offset]);

  return (
    <>
      {/* Nút mở chat */}
      {!isOpen && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "20px",
            transform: "translateY(-50%)",
            zIndex: 1000,
          }}
        >
          <button
            className="btn btn-primary rounded-circle shadow"
            style={{ width: 60, height: 60, fontSize: 24 }}
            onClick={() => setIsOpen(true)}
          >
            🤖
          </button>
        </div>
      )}

      {/* Khung chat */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: position.y,
            left: position.x,
            width: 360,
            height: 520,
            background: "#f8f9fa",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 2000,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(90deg, #0d6efd, #3b82f6)",
              color: "#fff",
              padding: "10px 14px",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "move",
            }}
            onMouseDown={handleMouseDown}
          >
            <strong>AI Tư vấn</strong>
            <button
              className="btn btn-sm btn-light"
              onClick={() => setIsOpen(false)}
            >
              ✖
            </button>
          </div>

          {/* Nội dung chat */}
          <div className="flex-grow-1 p-3 overflow-auto">
          {messages.map((m, i) => {
  const isUser = m.sender === "user";

  return (
    <div
      key={i}
      className={`d-flex align-items-end mb-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <img
        src={
          isUser
            ? user?.profileImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7U1gOR6kMXE2P4fr25FDt4zZWN-0N1gq9IQ&s"
            : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShTVuZ762a3TtgFUXdpYEBRdUpfuoMYcvdiHD0c-po2M7TYNKd1wuHuTXZzwr-rCXOyf8&usqp=CAU"
        }
        alt="avatar"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #f1f1f1",
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          marginLeft: isUser ? "8px" : "0",
          marginRight: isUser ? "0" : "8px",
        }}
      />

      {/* Bong bóng chat */}
      <div
        style={{
          maxWidth: "75%",
          padding: "10px 14px",
          borderRadius: isUser
            ? "18px 18px 4px 18px"
            : "18px 18px 18px 4px",
          background: isUser
            ? "linear-gradient(135deg, #0d6efd, #1a73e8)"
            : "#f1f3f5",
          color: isUser ? "#fff" : "#212529",
          fontSize: "15px",
          lineHeight: "1.5",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          wordBreak: "break-word",
        }}
      >
        <ReactMarkdown>{m.text}</ReactMarkdown>
      </div>
    </div>
  );
})}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
  className="d-flex p-2 border-top"
  style={{
    background: "linear-gradient(135deg, #e3f2fd, #bbdefb)", // xanh biển nhạt
  }}
>
  <input
    type="text"
    className="form-control rounded-pill border-0 shadow-sm"
    placeholder="Nhập tin nhắn..."
    style={{
      backgroundColor: "#ffffff",
      paddingLeft: "15px",
    }}
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleSend()}
  />
  <button
    className="btn ms-2 rounded-circle shadow-sm"
    style={{
      width: 44,
      height: 44,
      background: "linear-gradient(135deg, #0d6efd, #1a73e8)", // xanh biển đậm
      border: "none",
      color: "#fff",
    }}
    onClick={handleSend}
  >
    <FaPaperPlane />
  </button>
</div>

        </div>
      )}
    </>
  );
};

export default AIChatBox;
