let io = null;

export const initSocket = (serverIO) => {
  io = serverIO;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO chưa được khởi tạo!");
  return io;
};
