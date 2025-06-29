import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [receiver, setReceiver] = useState(null); // { id, name }

  return (
    <ChatContext.Provider value={{ receiver, setReceiver }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
