import Post from "../models/Post.js";
import Fee from "../models/Fee.js";
import Contract from "../models/Contract.js";

export const countTodayAndYesterday = async (Model, filter = {}) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayCount = await Model.countDocuments({
        ...filter,
        createdAt: { $gte: today },
    });

    const yesterdayCount = await Model.countDocuments({
        ...filter,
        createdAt: { $gte: yesterday, $lt: today },
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
  

export const calculateApartmentRevenue = async () => {
    const fees = await Fee.find({ paymentStatus: "paid" });
    return fees.reduce((sum, fee) => sum + (fee.total || 0), 0);
};

export const calculateContractRevenue = async () => {
    const contracts = await Contract.find();
    return contracts.reduce((sum, contract) => sum + (contract.depositAmount || 0), 0);
};
