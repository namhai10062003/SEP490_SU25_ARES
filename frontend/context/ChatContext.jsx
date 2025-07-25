import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [receiver, setReceiver] = useState(null); // { id, name }
  const [postInfo, setPostInfo] = useState(null); // 👈 Thêm dòng này

  return (
    <ChatContext.Provider value={{ receiver, setReceiver, postInfo, setPostInfo }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
