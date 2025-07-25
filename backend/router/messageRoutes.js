import express from "express";
import mongoose from "mongoose";
import Message from "../models/Messages.js";
import User from "../models/User.js";
const router = express.Router();

// router.get("/recent-sender/:userId", async (req, res) => {
//   const userId = req.params.userId;

//   // ✅ Kiểm tra ID hợp lệ
//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return res.status(400).json({ success: false, message: "ID người dùng không hợp lệ" });
//   }

//   try {
//     // ✅ Tìm các tin nhắn có userId là sender hoặc receiver
//     const messages = await Message.find({
//       $or: [
//         { sender: userId },
//         { receiver: userId }
//       ]
//     });

//     // ✅ Tạo Set để lưu các ID khác với userId
//     const partnerIdSet = new Set();

//     messages.forEach(msg => {
//       if (msg.sender.toString() !== userId) {
//         partnerIdSet.add(msg.sender.toString());
//       }
//       if (msg.receiver.toString() !== userId) {
//         partnerIdSet.add(msg.receiver.toString());
//       }
//     });

//     const partnerIds = Array.from(partnerIdSet); // → danh sách người đã nhắn với userId

//     // ✅ Lấy thông tin user
//     const partners = await User.find({ _id: { $in: partnerIds } }).select("name email");

//     return res.status(200).json({ success: true, data: partners });
//   } catch (err) {
//     console.error("❌ Lỗi recent-sender:", err.message);
//     return res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
//   }
// });

router.get("/recent-sender/:userId", async (req, res) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "ID người dùng không hợp lệ" });
  }

  try {
    // ✅ Lấy tất cả tin nhắn có liên quan
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 }); // sắp xếp mới nhất trước

    const partnerMap = new Map(); // key = partnerId, value = { info: user, lastPost: ... }

    for (const msg of messages) {
      const partnerId =
        msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();

      // Nếu chưa có, thêm vào map
      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, {
          lastPost: msg.post || null,
        });
      }
    }

    const partnerIds = Array.from(partnerMap.keys());

    // ✅ Lấy thông tin user
    const users = await User.find({ _id: { $in: partnerIds } }).select("name email");

    const result = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      lastPost: partnerMap.get(user._id.toString())?.lastPost || null,
    }));

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("❌ Lỗi recent-sender:", err.message);
    return res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
});





// Lấy tất cả tin nhắn giữa 2 người dùng
router.get("/:user1Id/:user2Id", async (req, res) => {
  const { user1Id, user2Id } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: user1Id, receiver: user2Id },
        { sender: user2Id, receiver: user1Id },
      ],
    }).sort("createdAt");

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

  // POST /api/messages
  router.post("/", async (req, res) => {
    const { senderId, receiverId, content, type = "text", post = null } = req.body;
  
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
    }
  
    try {
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        type,
        post: type === "post" ? post : undefined,
      });
      await message.save();
  
      const roomId = [senderId, receiverId].sort().join("_");
  
      global._io?.to?.(roomId)?.emit("receiveMessage", message);
  
      res.status(201).json({ success: true, data: message });
    } catch (err) {
      res.status(500).json({ success: false, message: "Không gửi được tin nhắn" });
    }
  });
  
  // ✅ 4. Lấy tất cả người đã từng nhắn với user (gồm gửi & nhận)
router.get("/partners/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
      const messages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }],
      }).populate("sender receiver", "name email");
  
      const partnersMap = new Map();
  
      messages.forEach((msg) => {
        const otherUser =
          msg.sender._id.toString() === userId
            ? msg.receiver
            : msg.sender;
  
        partnersMap.set(otherUser._id.toString(), otherUser);
      });
  
      const partners = Array.from(partnersMap.values());
  
      res.status(200).json({ data: partners });
    } catch (err) {
      res.status(500).json({ message: "Lỗi lấy danh sách người đã nhắn tin" });
    }
  });
export default router;
