import React, { useEffect, useState } from "react";
import { useChat } from "../../../../context/ChatContext.jsx";
import { useAuth } from "../../../../context/authContext.jsx";
import ChatBox from "../../../pages/user/messages/ChatBox.jsx";
import Inbox from "../../../pages/user/messages/Inbox.jsx";

const GlobalChatBox = () => {
  const { user } = useAuth();
  const { receiver, postInfo } = useChat(); // 🟢 lấy receiver và thông tin bài post nếu có
  const [open, setOpen] = useState(false);

  const [chatBoxes, setChatBoxes] = useState(new Map()); // 📦 Lưu từng đoạn chat theo từng người nhận
  const [messages, setMessages] = useState([]); // 💬 Danh sách tin nhắn hiện tại

  // 🔄 Cập nhật tin nhắn khi người nhận thay đổi
  useEffect(() => {
    if (receiver) {
      const msgList = chatBoxes.get(receiver.id) || [];
      setMessages(msgList);
    }
  }, [receiver, chatBoxes]);

  if (!user) return null;

  return (
    <>
      {/* Nút mở chat */}
      <button
        className="btn btn-warning rounded-circle shadow"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          fontSize: 28,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Mở chat"
      >
        💬
      </button>

      {/* Khung chat */}
      {open && (
        <div
          className="shadow-lg"
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 570,
            height: 500,
            background: "#fff",
            border: "1px solid #F2B98E",
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 9999,
            display: "flex",
            flexDirection: "row",
          }}
        >
          {/* Cột người đã chat */}
          <div style={{ width: "40%", borderRight: "1px solid #ccc", overflowY: "auto" }}>
            <Inbox currentUserId={user._id} />
          </div>

          {/* Cột khung chat */}
          <div style={{ width: "60%", position: "relative" }}>
            {receiver ? (
              <ChatBox
                key={receiver.id}
                currentUserId={user._id}
                receiverId={receiver.id}
                receiverName={receiver.name}
                postInfo={postInfo}
                messages={messages}
                onSendMessage={(msg) => {
                  const updated = new Map(chatBoxes);
                  const oldMsgs = updated.get(receiver.id) || [];
                  updated.set(receiver.id, [...oldMsgs, msg]);
                  setChatBoxes(updated);
                  setMessages(updated.get(receiver.id));
                }}
              />
            ) : (
              <div className="text-center mt-5 text-muted">
                Chọn người để bắt đầu chat 💬
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalChatBox;
