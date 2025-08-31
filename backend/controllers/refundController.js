import Refund from "../models/Refund.js";

// Staff tạo yêu cầu hoàn tiền
export const createRefund = async (req, res) => {
  try {
    const { amount, accountHolder, accountNumber, bankName, note } = req.body;

    if (!amount || !accountHolder || !accountNumber || !bankName) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const refund = await Refund.create({
      user: req.user._id,  // lấy từ token
      amount,
      accountHolder,
      accountNumber,
      bankName,
      note,
    });

    res.status(201).json({ success: true, data: refund });
  } catch (error) {
    console.error("❌ Lỗi khi tạo refund:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
// Lấy tất cả refund 
export const getAllRefunds = async (req, res) => {
    try {
      const refunds = await Refund.find().populate("user", "name email phone");
      res.json(refunds);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  };
// hàm duyệt refund
  export const approveRefund = async (req, res) => {
    try {
      const refund = await Refund.findById(req.params.id);
      if (!refund) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
  
      refund.status = "approved";
      refund.processedBy = req.user.id;
      await refund.save();
  
      res.json({ message: "Đã duyệt hoàn tiền", data: refund });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  };
//hàm từ chối refund
// Reject Refund
export const rejectRefund = async (req, res) => {
    try {
      const refund = await Refund.findById(req.params.id);
      if (!refund) {
        return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
      }
  
      // Kiểm tra có rejectReason không
      const { rejectReason } = req.body;
      if (!rejectReason || rejectReason.trim() === "") {
        return res.status(400).json({ message: "Vui lòng nhập lý do từ chối" });
      }
  
      refund.status = "rejected";
      refund.rejectReason = rejectReason;   // thêm field này
      refund.processedBy = req.user.id;
      refund.processedAt = new Date();
  
      await refund.save();
  
      res.json({
        message: "❌ Đã từ chối hoàn tiền",
        data: refund,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  };
  