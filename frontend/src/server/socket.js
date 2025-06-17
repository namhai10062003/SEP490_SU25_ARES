// socket.js (tách riêng file nếu muốn tái sử dụng)
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  withCredentials: true,
});

export default socket;
