// app.js
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectToDatabase from "./db/db.js";
import authRouter from "./router/auth.js";
import ParkingRegistration from "./router/parkingRegistration.js";
import staffRouter from "./router/staff.js";
import userRouter from "./router/user.js";
import apartmentRouter from "./router/apartmentRoutes.js";
import adminDashboardRoutes from "./router/adminDashboardRoutes.js";
import ResidentVerificationRouter from "./router/residentVerificationRoutes.js";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
dotenv.config(); // Load biến môi trường từ .env

const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
global._io = io; // Make io accessible globally

// Cấu hình CORS
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware (ORDER MATTERS!)
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Log Every Request - MOVE THIS BEFORE ROUTES
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - ${new Date().toISOString()}`)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📝 Request body:', req.body)
  }
  next()
})

// Route kiểm tra
app.get("/", (req, res) => res.send("API working"));

// Routes chính
app.use("/api/auth", authRouter);
app.use("/api/staff", staffRouter);
app.use("/api/users", userRouter);
app.use("/api/parkinglot", ParkingRegistration);
app.use("/api/apartments", apartmentRouter);
app.use("/api/admin-dashboard", adminDashboardRoutes);
app.use("/api/resident-verifications", ResidentVerificationRouter);
// Socket.IO setup
io.on('connection', (socket) => {
  // Save userId to socket mapping if needed
  socket.on('register', (userId) => {
    socket.userId = userId;
  });
});
// Kết nối DB và khởi chạy server
const startServer = async () => {
  try {
    await connectToDatabase();
    server.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  }

};

startServer();