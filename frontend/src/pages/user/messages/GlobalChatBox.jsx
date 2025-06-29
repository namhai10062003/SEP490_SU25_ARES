import React, { useState } from "react";
import { useChat } from "../../../../context/ChatContext.jsx";
import { useAuth } from "../../../../context/authContext.jsx";
import ChatBox from "../../../pages/user/messages/ChatBox.jsx";
import Inbox from "../../../pages/user/messages/Inbox.jsx";

const GlobalChatBox = () => {
  const { user } = useAuth();
  const { receiver } = useChat();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* Nút mở chat */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: "#F2B98E",
          width: 60,
          height: 60,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 28,
          cursor: "pointer",
          zIndex: 9999,
        }}
        onClick={() => setOpen((prev) => !prev)}
      >
        💬
      </div>

      {/* Khung chat hiện ra */}
      {open && (
        <div
        style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 360,
            height: 460,
            background: "#fff",           
            border: "1px solid #F2B98E",      // ✅ viền cùng màu nền (hoặc đậm hơn nếu muốn)
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 9999,
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          }}
          
        >
          {receiver ? (
            <ChatBox
              currentUserId={user._id}
              receiverId={receiver.id}
              receiverName={receiver.name}
            />
          ) : (
            <Inbox currentUserId={user._id} />
          )}
        </div>
      )}
    </>
  );
};

export default GlobalChatBox;
