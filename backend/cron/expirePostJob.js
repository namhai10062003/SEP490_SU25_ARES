import cron from 'node-cron';
import Post from '../models/Post.js';

// 🕒 Cron: Chạy mỗi phút để test, khi deploy đổi thành '0 0 * * *' (00:00 hàng ngày)
cron.schedule('*/1 * * * *', async () => {
    const nowUTC = new Date();
    const vietnamOffsetMs = 7 * 60 * 60 * 1000; // UTC+7
    const nowVN = new Date(nowUTC.getTime() + vietnamOffsetMs);

    console.log('⏰ CRON chạy giờ VN:', nowVN.toLocaleString());

    const result = await Post.updateMany(
        { status: 'approved', expiredDate: { $lte: nowVN } },
        { $set: { status: 'expired' } }
    );

    console.log(`🔁 CRON: Cập nhật ${result.modifiedCount} bài hết hạn.`);
});

// 🧪 Gọi ngay khi server start để test
(async () => {
    console.log('🧪 Test gọi hàm cron thủ công:', new Date().toLocaleString());

    const nowVN = new Date();
    const result = await Post.updateMany(
        { status: 'approved', expiredDate: { $lte: nowVN } },
        { $set: { status: 'expired' } }
    );

    console.log(`✅ Test cập nhật ${result.modifiedCount} bài.`);
})();
