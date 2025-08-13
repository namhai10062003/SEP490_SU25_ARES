import fetch from "node-fetch";
import Chat from "../models/AiChat.js";
import Apartment from "../models/Apartment.js";
import Post from "../models/Post.js";
const AI_BRAIN = `
Bạn là trợ lý AI tư vấn bất động sản và căn hộ.
- "Blog", "bài viết", "bài đăng" = bài đăng bất động sản (Post).
- "Căn hộ" là dữ liệu riêng, có thể liên quan hoặc không liên quan đến Post.
Thông tin từ hệ thống:
1. Bài đăng (Post): tiêu đề, mô tả, loại (bán, cho thuê, dịch vụ), diện tích, giá, tiện ích, trạng thái, tòa plaza, hình ảnh, hạn đăng.
2. Căn hộ (Apartment): mã căn, diện tích, số phòng ngủ, nội thất, hướng, tòa, pháp lý, chủ sở hữu/người thuê.
Quy tắc trả lời:
- Nếu người dùng hỏi về bài đăng bất động sản, liệt kê các bài hiện còn hạn và đã thanh toán.
- Nếu người dùng hỏi về căn hộ, trả lời dựa trên dữ liệu căn hộ có sẵn.
- Nếu dữ liệu trống, nói rõ “Hiện không có dữ liệu”.
- Không đoán thông tin ngoài dữ liệu được cung cấp.
Thông tin bạn có thể sử dụng: 
- Bài đăng: tiêu đề, mô tả, loại hình (bán, cho thuê, dịch vụ), diện tích, giá, tiện ích, trạng thái, tòa plaza, hình ảnh.
- Căn hộ: mã căn hộ, diện tích, số phòng ngủ, nội thất, hướng, tòa, giấy tờ pháp lý, chủ sở hữu hoặc người thuê.
Nhiệm vụ của bạn: 
1. Trả lời các câu hỏi của khách hàng về căn hộ, bài đăng bất động sản, giá cả, diện tích, tiện ích, tình trạng pháp lý, chủ sở hữu hoặc người thuê.
2. Nếu khách hỏi so sánh các căn hộ hoặc gợi ý bất động sản phù hợp, hãy đưa ra các lựa chọn dựa trên dữ liệu.
3. Nếu câu hỏi không liên quan bất động sản hoặc căn hộ, trả lời ngắn gọn, lịch sự.
4. Luôn ưu tiên sử dụng dữ liệu thực tế từ hệ thống thay vì đoán.
`;

export const aiChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!message?.trim()) return res.status(400).json({ error: "Message is required" });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY is not defined" });

// Hàm chuyển đổi type sang tiếng Việt
const typeMap = {
  cho_thue: "Cho thuê",
  ban: "Bán",
  dich_vu: "Dịch vụ"
};

const now = new Date();

// Lấy bài đăng, kèm gói tin để tính hạn
const postsRaw = await Post.find({
  status: "approved",
  paymentStatus: "paid"
})
.select("title type area price toaPlaza postPackage paymentDate") // paymentDate: ngày thanh toán
.populate("toaPlaza", "name")
.populate("postPackage", "type expireAt") // expireAt: số ngày
.lean();

// Lọc bài còn hạn
const posts = postsRaw.filter(p => {
  if (!p.postPackage?.expireAt || !p.paymentDate) return false;
  const expiredAt = new Date(p.paymentDate);
  expiredAt.setDate(expiredAt.getDate() + p.postPackage.expireAt);
  return expiredAt > now;
});

// Tạo text bài đăng
const postSummary = posts.map(p => {
  let info = `${p.title || "(không tiêu đề)"}`;
  if (p.type) info += ` - loại: ${typeMap[p.type] || p.type}`;
  if (p.area) info += `, diện tích: ${p.area}m²`;
  if (p.price) info += `, giá: ${p.price}`;
  if (p.toaPlaza?.name) info += `, tòa: ${p.toaPlaza.name}`;
  
  const expiredAt = new Date(p.paymentDate);
  expiredAt.setDate(expiredAt.getDate() + p.postPackage.expireAt);
  info += `, hết hạn: ${expiredAt.toLocaleDateString("vi-VN")}`;
  
  return info;
}).join("\n");

// ================== LẤY DỮ LIỆU ==================
const apartments = await Apartment.find({})
  .select("apartmentCode area bedrooms furniture direction building legalDocuments ownerName")
  .lean();

const aptSummary = apartments.map(a => {
  let info = `Căn hộ ${a.apartmentCode || "(không mã)"}`;
  if (a.area) info += `, diện tích: ${a.area}m²`;
  if (a.bedrooms) info += `, số phòng ngủ: ${a.bedrooms}`;
  if (a.furniture) info += `, nội thất: ${a.furniture}`;
  if (a.direction) info += `, hướng: ${a.direction}`;
  if (a.building) info += `, tòa: ${a.building}`;
  if (a.legalDocuments) info += `, pháp lý: ${a.legalDocuments}`;
  if (a.ownerName) info += `, chủ sở hữu: ${a.ownerName}`;
  return info;
}).join("\n");

console.log(aptSummary);

// Context AI
const context = `
${AI_BRAIN}

=== Bài đăng ===
${postSummary || "(Không có bài đăng nào phù hợp)"}

=== Căn hộ ===
${aptSummary || "(Không có căn hộ nào)"}
`;



    // Gọi Gemini API
    let reply = "Xin lỗi, tôi không thể trả lời câu hỏi này.";
    try {
      const aiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: context }] },
              { role: "user", parts: [{ text: message }] }
            ]
          })
        }
      );

      const aiData = await aiRes.json();
      reply = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || reply;
    } catch (err) {
      console.error("Gemini API error:", err);
    }

    // Lưu lịch sử chat
    let chat = await Chat.findOne({ user: userId });
    if (!chat) chat = new Chat({ user: userId, messages: [] });

    chat.messages.push({ sender: "user", text: message, createdAt: new Date() });
    chat.messages.push({ sender: "ai", text: reply, createdAt: new Date() });
    await chat.save();

    res.json({ reply, history: chat.messages });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: "AI chat failed" });
  }
};

// API lấy lịch sử chat
export const getAiChatHistory = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const chat = await Chat.findOne({ user: userId });
    res.json(chat ? chat.messages : []);
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({ error: "Failed to get chat history" });
  }
};
