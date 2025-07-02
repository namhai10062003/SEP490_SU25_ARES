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

      {/* Khung chat hiện ra */}
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
            flexDirection: "column",
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