let io = null;

export const initSocket = (serverIO) => {
  io = serverIO; // ✅ Thêm dòng này để gán giá trị cho biến toàn cục

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("joinRoom", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      socket.join(roomId);
      console.log(`👥 User ${senderId} joined room: ${roomId}`);
    });

    socket.on("sendMessage", ({ senderId, receiverId, content, _id, timestamp }) => {
      const roomId = [senderId, receiverId].sort().join("_");

      const payload = {
        _id,
        senderId,
        receiverId,
        content,
        timestamp: timestamp || new Date(),
      };

      io.to(roomId).emit("receiveMessage", payload);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO chưa được khởi tạo!");
  return io;
};
