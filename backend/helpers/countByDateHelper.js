import Post from "../models/Post.js";
import Fee from "../models/Fee.js";
import Contract from "../models/Contract.js";

export const countTodayAndYesterday = async (Model, filter = {}) => {
    // Lấy thời gian hiện tại ở VN
    const now = new Date();
    const vnOffset = 7 * 60 * 60 * 1000; // 7 tiếng tính theo milliseconds

    // Lấy 0h hôm nay ở VN (UTC+7)
    const today = new Date(now.getTime() + vnOffset);
    today.setHours(0, 0, 0, 0);
    const todayUTC = new Date(today.getTime() - vnOffset);

    // Lấy 0h hôm qua ở VN (UTC+7)
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setDate(yesterdayUTC.getDate() - 1);

    const todayCount = await Model.countDocuments({
        ...filter,
        createdAt: { $gte: todayUTC },
    });

    const yesterdayCount = await Model.countDocuments({
        ...filter,
        createdAt: { $gte: yesterdayUTC, $lt: todayUTC },
    });

    return { today: todayCount, yesterday: yesterdayCount };
};


export const calculatePostRevenue = async () => {
    const posts = await Post.find({ paymentStatus: "paid" }).populate('postPackage');

    let total = 0;
    posts.forEach(post => {
        total += post.postPackage?.price || 0;
        console.log(`✅ Post: ${post._id} | Gói: ${post.postPackage?.type}`);
        console.log(`🔹 Đã lọc được ${posts.length} bài post paid`);
    });

    return total;
};

const fetchPosts = async () => {
    const posts = await Post.find({ paymentStatus: "paid" }).populate('postPackage').lean();
    console.log(posts.length);
  };

export const calculateApartmentRevenue = async () => {
    const fees = await Fee.find({ paymentStatus: "paid" });
    return fees.reduce((sum, fee) => sum + (fee.total || 0), 0);
};

export const calculateContractRevenue = async () => {
    const contracts = await Contract.find();
    return contracts.reduce((sum, contract) => sum + (contract.depositAmount || 0), 0);
};
