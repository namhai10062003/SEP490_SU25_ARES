let io = null;

// 👉 Thêm bản đồ lưu userId ↔ socket.id để gửi trực tiếp
const userSocketMap = new Map();

export const initSocket = (serverIO) => {
  io = serverIO;

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // 🔐 Đăng ký userId sau khi kết nối
    socket.on("register-user", (userId) => {
      socket.userId = userId;
      userSocketMap.set(userId, socket.id);
      console.log(`✅ Registered user ${userId} with socket ${socket.id}`);
    });

    // 👥 Vào phòng chat chung
    socket.on("joinRoom", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      socket.join(roomId);
      console.log(`👥 User ${senderId} joined room: ${roomId}`);
    });

    // ❌ Từ chối cuộc gọi
    socket.on("call-rejected", ({ from, to }) => {
      const toSocketId = userSocketMap.get(to);
      if (toSocketId) {
        io.to(toSocketId).emit("call-rejected", { from });
        console.log(`❌ Người dùng ${from} từ chối cuộc gọi từ ${to}`);
      }
    });

    socket.on("cancel-call", ({ from, to }) => {
      const toSocketId = userSocketMap.get(to);
      if (toSocketId) {
        io.to(toSocketId).emit("call-canceled", { from });
        console.log(`📴 Cuộc gọi từ ${from} đến ${to} đã bị huỷ.`);
      }
    });
    // cuộc gọi nhỡ
    
    socket.on("start-call", ({ from, to, name }) => {
      const toSocketId = userSocketMap.get(to);
      if (toSocketId) {
        io.to(toSocketId).emit("start-call", { from, name });
        console.log(`📞 start-call từ ${from} gửi đến ${to} (${toSocketId})`);
      } else {
        console.log("⚠️ Không tìm thấy socketId của người nhận:", to);
      }
    });
    // ✉️ Gửi tin nhắn
    socket.on("sendMessage", (data) => {
      const {
        _id,
        senderId,
        receiverId,
        content,
        timestamp,
        type = "text", // hỗ trợ cả message dạng "missed-call"
      } = data;
    
      const roomId = [senderId, receiverId].sort().join("_");
    
      const payload = {
        _id,
        senderId,
        receiverId,
        content,
        timestamp: timestamp || new Date().toISOString(),
        type,
      };
    
      console.log("📤 Gửi message tới phòng:", roomId, payload);
    
      io.to(roomId).emit("receiveMessage", payload); // realtime gửi về cả 2 người
    });
    

    // 🔌 Ngắt kết nối
    socket.on("disconnect", () => {
      if (socket.userId) {
        userSocketMap.delete(socket.userId);
        console.log(`🔴 User ${socket.userId} disconnected (${socket.id})`);
      } else {
        console.log(`🔴 Socket disconnected: ${socket.id}`);
      }
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO chưa được khởi tạo!");
  return io;
};