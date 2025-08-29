import cron from 'node-cron';
import Notification from '../models/Notification.js';
import Post from '../models/Post.js';

// 🕒 Cron: Chạy mỗi phút để test, khi deploy đổi thành '0 0 * * *' (00:00 hàng ngày)
cron.schedule('*/1 * * * *', async () => {
  const nowUTC = new Date();
  const vietnamOffsetMs = 7 * 60 * 60 * 1000; // UTC+7
  const nowVN = new Date(nowUTC.getTime() + vietnamOffsetMs);

  console.log('⏰ CRON chạy giờ VN:', nowVN.toLocaleString());

  // 1️⃣ Bài viết sắp hết hạn (còn 1 ngày)
  const tomorrow = new Date(nowVN.getTime() + 24 * 60 * 60 * 1000);

  const almostExpiredPosts = await Post.find({
    status: 'approved',
    expiredDate: {
      $gt: nowVN,       // chưa hết hạn
      $lte: tomorrow,   // <= 1 ngày
    },
  });

  for (const post of almostExpiredPosts) {
    const notifyTitle = 'Bài viết sắp hết hạn';
    const notifyMessage = `Bài viết "${post.title}" sẽ hết hạn vào ngày ${post.expiredDate.toLocaleDateString('vi-VN')}`;

    await Notification.create({
      userId: post.contactInfo,   // 👈 chủ bài viết
      title: notifyTitle,
      message: notifyMessage,
      data: {
        postId: post._id,
      },
    });

    console.log(`📢 Thông báo sắp hết hạn cho bài: ${post._id}`);
  }

  // 2️⃣ Bài viết đã hết hạn
  const result = await Post.updateMany(
    { status: 'approved', expiredDate: { $lte: nowVN } },
    { $set: { status: 'expired' } }
  );

  if (result.modifiedCount > 0) {
    const expiredPosts = await Post.find({
      status: 'expired',
      expiredDate: { $lte: nowVN },
    });

    for (const post of expiredPosts) {
      const notifyTitle = 'Bài viết đã hết hạn';
      const notifyMessage = `Bài viết "${post.title}"đã hết hạn vào ngày ${post.expiredDate.toLocaleDateString('vi-VN')}`;

      await Notification.create({
        userId: post.contactInfo,   // 👈 chủ bài viết
        title: notifyTitle,
        message: notifyMessage,
        data: {
          postId: post._id,
        },
      });

      console.log(`📢 Thông báo hết hạn cho bài: ${post._id}`);
    }
  }

  console.log(`🔁 CRON: Cập nhật ${result.modifiedCount} bài hết hạn.`);
});
