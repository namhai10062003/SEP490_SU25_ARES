import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useChat } from "../../../../context/ChatContext"; // đường dẫn tùy dự án của bạn
import ChatBox from "./ChatBox";
const Inbox = ({ currentUserId }) => {
  const location = useLocation(); // ⬅️ Lấy state từ router
  const [partners, setPartners] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const { setReceiver, setPostInfo, postInfo } = useChat();
  const [chatBoxes, setChatBoxes] = useState(new Map());

  const handleSelectUser = (user) => {
    if (!user || !user._id) return;
  
    setSelectedUserId(user._id);
setSelectedUserName(user.name || user.email || "Người dùng");

setReceiver({ id: user._id, name: user.name || user.email || "Người dùng" });

// Gán lại postInfo tương ứng từ chatBox (nếu đã có)
const existingBox = chatBoxes.get(user._id);
if (existingBox?.postInfo) {
  setPostInfo(existingBox.postInfo);
} else if (user.lastPost) {
  setPostInfo(user.lastPost);
} else {
  setPostInfo(null);
}

// Nếu chưa có chatBox -> tạo rỗng
if (!chatBoxes.has(user._id)) {
  setChatBoxes(prev => {
    const updated = new Map(prev);
    updated.set(user._id, { messages: [], postInfo: user.lastPost || null });
    return updated;
  });
}
  
    console.log("✅ Đã chọn user:", user._id, user.name || user.email);
  };
  

  useEffect(() => {
    
    
    const fetchPartners = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/messages/recent-sender/${currentUserId}`
        );
    
        const data = res.data.data || [];
    
        const filtered = data.filter(
          (user) => user && user._id && user._id !== currentUserId
        );
    
        setPartners(filtered);
    
        console.log("🧾 Danh sách người đã từng nhắn (filtered):");
        filtered.forEach((user, i) =>
          console.log(`${i + 1}. ID: ${user._id}, Tên: ${user.name}`)
        );
    
        // ✅ Nếu có receiver từ location (chuyển từ post qua)
        const stateReceiver = location.state?.receiver;
        const statePostInfo = location.state?.postInfo;
    
        if (stateReceiver?.id) {
          const exists = filtered.some((p) => p._id === stateReceiver.id);
    
          if (!exists) {
            filtered.push({ _id: stateReceiver.id, name: stateReceiver.name || "Người dùng" });
            setPartners([...filtered]);
          }
    
          setSelectedUserId(stateReceiver.id);
          setSelectedUserName(stateReceiver.name || "Người dùng");
          setReceiver({ id: stateReceiver.id, name: stateReceiver.name || "Người dùng" });
          setPostInfo(statePostInfo || null);
    
          console.log("➡️ Đang chọn từ location.state:", stateReceiver.id, stateReceiver.name);
    
          window.history.replaceState({}, document.title);
        } else {
          // ❌ KHÔNG còn tự động chọn người đầu tiên
          console.log("ℹ️ Không có state receiver, chờ user chọn người từ sidebar.");
        }
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách:", err);
      }
    };
    
  
    fetchPartners();
  }, [currentUserId]);
  
  useEffect(() => {
    console.log("📍 Selected user:", selectedUserId, selectedUserName);
  }, [selectedUserId, selectedUserName]);
  
  
  return (
    <div className="d-flex flex-row" style={{ height: "100vh", overflow: "hidden" }}>
    {/* --- Sidebar --- */}
    <div
      className="bg-light border-end"
      style={{
        width: 250,
        minWidth: 200,
        maxWidth: 300,
        overflowY: "auto",
        height: "100%",
      }}
    >
      <div className="p-3 border-bottom bg-primary text-white">
        <h6 className="mb-0 fw-bold">💬 Người đã nhắn</h6>
      </div>
  
      <div className="list-group list-group-flush">
        {partners.length === 0 ? (
          <div className="text-center text-secondary py-4">
            Không có cuộc hội thoại nào
          </div>
        ) : (
          partners.map((p) => (
            <button
              key={p._id}
              className={`list-group-item list-group-item-action border-0 text-start ${
                p._id === selectedUserId ? "active" : ""
              }`}
              style={{ fontWeight: p._id === selectedUserId ? "bold" : "normal" }}
              onClick={() => handleSelectUser(p)}
            >
              <span className="me-2">👤</span>
              {p.name || p.email}
            </button>
          ))
        )}
      </div>
    </div>
  
    {/* --- ChatBox --- */}
    {/* <div className="flex-grow-1 d-flex flex-column" style={{ height: "100%" }}>
      <div className="border-bottom p-3 bg-white">
        <h6 className="mb-0 fw-bold text-primary">
          {selectedUserName
            ? `Đang chat với: ${selectedUserName}`
            : "Chọn người để xem hội thoại"}
        </h6>
      </div>
  
      <div className="flex-grow-1 p-3 bg-light" style={{ overflowY: "auto" }}>
        {selectedUserId && (
          <ChatBox
            key={selectedUserId}
            currentUserId={currentUserId}
            receiverId={selectedUserId}
            receiverName={selectedUserName}
            messages={chatBoxes.get(selectedUserId)?.messages || []}
            onSendMessage={(msg) => {
              setChatBoxes((prev) => {
                const oldBox =
                  prev.get(selectedUserId) || { messages: [], postInfo: null };
                const newMessages = [...oldBox.messages, msg];
                return new Map(prev).set(selectedUserId, {
                  ...oldBox,
                  messages: newMessages,
                });
              });
            }}
            onUpdatePostInfo={(postInfo) => {
              setChatBoxes((prev) => {
                const oldBox =
                  prev.get(selectedUserId) || { messages: [], postInfo: null };
                return new Map(prev).set(selectedUserId, {
                  ...oldBox,
                  postInfo,
                });
              });
            }}
          />
        )}
      </div>
    </div> */}
  </div>
  );
  
};

export default Inbox;