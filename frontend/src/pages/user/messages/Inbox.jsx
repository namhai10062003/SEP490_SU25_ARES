import axios from "axios";
import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";

const Inbox = ({ currentUserId }) => {
  const [partners, setPartners] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/messages/recent-sender/${currentUserId}`);
        const data = res.data.data || [];

        // Loại bỏ chính mình khỏi danh sách nếu có (phòng trường hợp lỗi gửi cho chính mình)
        const filtered = data.filter(user => user._id !== currentUserId);

        setPartners(filtered);

        if (filtered.length > 0) {
          setSelectedUserId(filtered[0]._id);
          setSelectedUserName(filtered[0].name || filtered[0].email || "Người dùng");
        }
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách:", err);
      }
    };

    fetchPartners();
  }, [currentUserId]);

  return (
    <div style={{ display: "flex", height: "400px" }}>
      <div style={{ width: "200px", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <h4>💬 Người đã nhắn</h4>
        {partners.length === 0 && <p>Không có cuộc hội thoại nào</p>}
        {partners.map((p) => (
          <div
            key={p._id}
            style={{
              padding: "8px",
              cursor: "pointer",
              backgroundColor: p._id === selectedUserId ? "#ddd" : "transparent",
            }}
            onClick={() => {
              setSelectedUserId(p._id);
              setSelectedUserName(p.name || p.email || "Người dùng");
            }}
          >
            {p.name || p.email}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, paddingLeft: 16 }}>
        {selectedUserId ? (
          <ChatBox
            currentUserId={currentUserId}
            receiverId={selectedUserId}
            receiverName={selectedUserName}
          />
        ) : (
          <p>Chọn người để xem hội thoại</p>
        )}
      </div>
    </div>
  );
};

export default Inbox;
