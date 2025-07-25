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

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/recent-sender/${currentUserId}`);
        const data = res.data.data || [];
        const filtered = data.filter(user => user._id !== currentUserId);
        setPartners(filtered);
        console.log("🧾 Danh sách partners:", filtered);

        if (location.state?.receiver) {
          // ✅ Nếu được truyền từ nơi khác qua
          const r = location.state.receiver;
          const pi = location.state.postInfo;
          setSelectedUserId(r.id);
          setSelectedUserName(r.name || "Người dùng");
          setPostInfo(pi || null);
          setReceiver({ id: r.id, name: r.name || "Người dùng" });
        } else {
          // ❌ Đừng auto chọn người đầu tiên ở đây!
          setSelectedUserId(null);
          setSelectedUserName("");
          setPostInfo(null);
          setReceiver(null);
        }
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách:", err);
      }
    };
  
    fetchPartners();
  }, [currentUserId]);
  
  return (
    <div className="h-100 d-flex flex-column flex-md-row" style={{ minHeight: 400, height: "100%" }}>
      {/* Sidebar */}
      <div className="bg-light border-end" style={{ width: 220, minWidth: 180, maxWidth: 260, height: "100%" }}>
        <div className="p-3 border-bottom bg-primary text-white">
          <h6 className="mb-0 fw-bold">💬 Người đã nhắn</h6>
        </div>
        <div className="list-group list-group-flush">
          {partners.length === 0 && (
            <div className="text-center text-secondary py-4">Không có cuộc hội thoại nào</div>
          )}
          {partners.map((p) => (
            <button
              key={p._id}
              className={`list-group-item list-group-item-action border-0 text-start ${p._id === selectedUserId ? "active" : ""}`}
              style={{ fontWeight: p._id === selectedUserId ? "bold" : "normal" }}
              onClick={() => {
                setSelectedUserId(p._id);
                setSelectedUserName(p.name || p.email || "Người dùng");
                console.log("👉 Partner:", p.name || p.email, "Post:", p.lastPost);
                // ✅ Kiểm tra post có tồn tại không
                if (p.lastPost) {
                  setPostInfo({
                    ...p.lastPost,
                    image: p.lastPost.image || p.lastPost.thumbnail || null,
                  });
                } else {
                  setPostInfo(null);
                }
                              
                console.log("🧾 Đang chọn:", p);
              }}
            >
              <span className="me-2">👤</span>
              {p.name || p.email}
              
            </button>
          ))}
        </div>
      </div>
      {/* Chat Box */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 400 }}>
        <div className="border-bottom p-3 bg-white">
          <h6 className="mb-0 fw-bold text-primary">
            {selectedUserName ? `Đang chat với: ${selectedUserName}` : "Chọn người để xem hội thoại"}
          </h6>
        </div>
        <div className="flex-grow-1 p-3 bg-light" style={{ minHeight: 300, height: "100%" }}>
          {selectedUserId ? (
            <ChatBox
              currentUserId={currentUserId}
              receiverId={selectedUserId}
              receiverName={selectedUserName}
              postInfo={postInfo}
            />
          ) : (
            <div className="text-center text-secondary py-5">Chọn người để xem hội thoại</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;