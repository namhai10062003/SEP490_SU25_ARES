import cron from 'node-cron';
import Post from '../models/Post.js'; // Đường dẫn tới Post model

// Chạy mỗi ngày lúc 00:00
cron.schedule('*/1 * * * *', async () => {
    const nowUTC = new Date();
    const vietnamOffsetMs = 7 * 60 * 60 * 1000; // hoặc 8 * ... nếu bạn dùng UTC+8
    const nowVN = new Date(nowUTC.getTime() + vietnamOffsetMs);
    console.log('⏰ CRON chạy giờ VN:', nowUTC.toLocaleString());
    const result = await Post.updateMany(
        { isActive: true, expiredDate: { $lte: nowUTC } },
        { isActive: false }
    );
    console.log(`🔁 Cập nhật ${result.modifiedCount} bài hết hạn.`);
});

// Gọi ngay khi load
(async () => {
    console.log('🧪 Test gọi hàm cron thủ công:', new Date());
    const now = new Date();
    const result = await Post.updateMany(
        { isActive: true, expiredDate: { $lte: now } },
        { isActive: false }
    );
    console.log(`✅ Test cập nhật ${result.modifiedCount} bài.`);
})();
