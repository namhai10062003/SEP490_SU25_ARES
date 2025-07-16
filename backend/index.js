import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import './cron/expirePostJob.js';
import connectToDatabase from "./db/db.js";
import adminDashboardRoutes from "./router/adminDashboardRoutes.js";
import apartmentRouter from "./router/apartmentRoutes.js";
import authRouter from "./router/auth.js";
import contractRouter from "./router/contractRouter.js";
import expenseRoutes from "./router/expenseRoutes.js";
import feeRoutes from "./router/feeRoutes.js";
import interationRouter from "./router/interactions.js";
import messageRoutes from "./router/messageRoutes.js";
import notificationRoutes from './router/notificationRoutes.js';
import parkingRouter from "./router/parkingRegistration.js";
import paymentRouter from "./router/payment.js";
import plazaRoutes from "./router/plazaRoutes.js";
import postPackage from "./router/postPackage.js";
import postRouter from "./router/postRouter.js";
import residentRouter from "./router/residentRoutes.js";
import residentVerificationRouter from "./router/residentVerificationRoutes.js";
import staffRouter from "./router/staff.js";
import userRouter from "./router/user.js";
import waterRoutes from "./router/waterRoutes.js";
import withdrawalRouter from "./router/withdrawalRouter.js";
import { initSocket } from "./socket.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* --------- HTTP + Socket.IO --------- */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://ares.io.vn",
      "http://ares.io.vn"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});
global._io = io;             // (tuỳ) để access ở module khác
initSocket(io);              // nếu bạn có file socket.js

/* --------- Middleware --------- */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ares.io.vn",
    "http://ares.io.vn"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* --------- Logging --------- */
app.use((req, _res, next) => {
  console.log(`📨 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  if (Object.keys(req.body || {}).length) {
    console.log("📝 Body:", req.body);
  }
  next();
});

/* --------- Routes --------- */
app.get("/", (_req, res) => res.send("API working with Socket.IO 🔥"));

app.use("/api/auth", authRouter);
app.use("/api/staff", staffRouter);
app.use("/api/users", userRouter);
app.use("/api/parkinglot", parkingRouter);
app.use("/api/apartments", apartmentRouter);
app.use("/api/residents", residentRouter);
app.use("/api/admin-dashboard", adminDashboardRoutes);
app.use("/api/resident-verifications", residentVerificationRouter);
app.use("/api/posts", postRouter);
app.use("/api/package", postPackage);
app.use("/api/payment", paymentRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/interaction", interationRouter);
app.use("/api/messages", messageRoutes);
app.use("/api/contracts", contractRouter);
app.use("/api/water", waterRoutes); 
app.use("/api/fees", feeRoutes); 
app.use("/api/plaza", plazaRoutes); 
app.use("/api/withdrawals", withdrawalRouter);
/* --------- Socket.IO events --------- */
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // Có thể gộp 2 listener trước đó:
  socket.on("register", (userId) => { socket.userId = userId; });

  socket.on("message", (payload) => {
    console.log("📩 Message:", payload);
    io.emit("message", payload);
  });
// video calll 
  // --- 📞 VIDEO CALL LOGIC ---
  socket.on("call-user", ({ to, offer, from }) => {
    console.log(`📞 ${from} is calling ${to}`);
    // Tìm socket của người nhận
    const targetSocket = [...io.sockets.sockets.values()].find(s => s.userId === to);
    if (targetSocket) {
      targetSocket.emit("incoming-call", { from, offer });
    }
  });

  socket.on("answer-call", ({ to, answer }) => {
    console.log(`✅ ${socket.userId} answered call to ${to}`);
    const targetSocket = [...io.sockets.sockets.values()].find(s => s.userId === to);
    if (targetSocket) {
      targetSocket.emit("call-answered", { answer });
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocket = [...io.sockets.sockets.values()].find(s => s.userId === to);
    if (targetSocket) {
      targetSocket.emit("ice-candidate", { candidate });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

/* --------- Start server --------- */
(async () => {
  try {
    await connectToDatabase();
    server.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Server error:", err);
    process.exit(1);
  }
})();
