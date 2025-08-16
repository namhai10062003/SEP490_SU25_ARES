import mongoose from "mongoose";
import Apartment from "../models/Apartment.js";
import Contract from "../models/Contract.js";
import Fee from "../models/Fee.js";
import Post from "../models/Post.js";

export const getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra userId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("❌ userId không hợp lệ:", userId);
      return res.status(400).json({ success: false, message: "userId không hợp lệ" });
    }
    const mongoUserId = new mongoose.Types.ObjectId(userId);
    console.log("✅ mongoUserId:", mongoUserId);

    // -----------------------------
    // 1. Lấy thanh toán Post
    // -----------------------------
    const postPayments = await Post.find({
      contactInfo: mongoUserId,
      paymentStatus: { $regex: /^paid$/i },
      paymentDate: { $exists: true, $ne: null }
    })
      .select("orderCode paymentDate title postPackage paymentAmount totalAmount paymentStatus")
      .populate("postPackage", "type price expireAt")
      .lean();

    console.log("🔹 PostPayments:", postPayments);

    const postHistory = postPayments.map(p => ({
        type: "post",
        channel: "WebARES",
        orderAmount: p.postPackage?.price ?? p.totalAmount ?? 0,      // tổng tiền gói
        paidAmount: p.paymentAmount ?? (p.postPackage?.price ?? p.totalAmount ?? 0), // ưu tiên paymentAmount, nếu null thì lấy giá gói
        createdAt: p.paymentDate,
        description: `Thanh toán gói ${p.postPackage?.type || ""}`,
        accountNumber: "0358 4178 50",
        orderCode: p.orderCode,
        status: p.paymentStatus
      }));
      
    // -----------------------------
    // 2. Lấy thanh toán Contract
    // -----------------------------
    const contractPayments = await Contract.find({
      userId: mongoUserId,
      paymentStatus: { $regex: /^paid$/i },
      paymentDate: { $exists: true, $ne: null }
    })
      .select("orderCode paymentDate depositAmount paymentAmount paymentStatus")
      .lean();

    console.log("🔹 ContractPayments:", contractPayments);

    const contractHistory = contractPayments.map(c => ({
      type: "contract",
      channel: "paymentContract",
      orderAmount: c.depositAmount || 0,
      paidAmount: c.depositAmount|| 0,
      createdAt: c.paymentDate,
      description: "Đặt cọc hợp đồng",
      accountNumber: "0358 4178 50",
      orderCode: c.orderCode,
      status: c.paymentStatus
    }));

    // -----------------------------
    // 3. Lấy Fee payments (version debug)
    // -----------------------------
    const apartments = await Apartment.find({ isOwner: mongoUserId })
      .select("_id apartmentCode ownerName")
      .lean();
    console.log("🔹 Apartments of user:", apartments);

    const apartmentIds = apartments.map(a => a._id);

    const feePayments = await Fee.find({
      apartmentId: { $in: apartmentIds }
    }).lean();

    console.log("🔹 Raw FeePayments (không filter):", feePayments);

    const paidFees = feePayments.filter(f => f.paymentStatus === "paid");
    console.log("🔹 Paid FeePayments:", paidFees);

    const feeHistory = paidFees.map(f => ({
      type: "fee",
      channel: "paymentFee",
      orderAmount: f.total || 0,
      paidAmount: f.total || 0,
      createdAt: f.paymentDate || f.createdAt,
      description: f.description || `Thanh toán phí căn hộ ${f.apartmentCode || ""}`,
      accountNumber: "0358 4178 50",
      orderCode: f.orderCode,
      status: f.paymentStatus,
      apartmentCode: f.apartmentCode,
      ownerName: f.ownerName
    }));

    // -----------------------------
    // 4. Gộp tất cả và sắp xếp theo ngày giảm dần
    // -----------------------------
    const history = [...postHistory, ...contractHistory, ...feeHistory]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log("🔹 Full history:", history);

    res.json({ success: true, data: history });

  } catch (err) {
    console.error("❌ Error getPaymentHistory:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
