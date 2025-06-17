import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";

import connectToDatabase from "./db/db.js";
import apartmentRouter from "./router/apartmentRoutes.js";
import authRouter from "./router/auth.js";
import ParkingRegistration from "./router/parkingRegistration.js";
import residentRouter from "./router/residentRoutes.js";
import staffRouter from "./router/staff.js";
import userRouter from "./router/user.js";
import { initSocket } from "./socket.js"; // 🆕 import file socket.js

// Load env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Tạo HTTP server để dùng được với Socket.IO
const server = http.createServer(app);

// Khởi tạo Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// Khởi tạo socket toàn cục
initSocket(io); // 🆕 truyền io để router khác có thể dùng

// CORS config
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📝 Request body:", req.body);
  }
  next();
});

// Test route
app.get("/", (req, res) => res.send("API working with Socket.IO 🔥"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/staff", staffRouter);
app.use("/api/users", userRouter);
app.use("/api/parkinglot", ParkingRegistration);
app.use("/api/apartments", apartmentRouter);
app.use("/api/residents", residentRouter);

// Socket.IO event listeners
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("message", (data) => {
    console.log("📩 Received message:", data);
    io.emit("message", data); // broadcast to all
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// Start server
const startServer = async () => {
  try {
    await connectToDatabase();
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    process.exit(1);
  }
};

startServer();
