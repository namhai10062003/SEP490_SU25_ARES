import Contract from "../models/Contract.js";
import Post from "../models/Post.js"; // để lấy giá từ bài đăng

export const createContract = async (req, res) => {
  try {
    const {
      postId,
      startDate,
      endDate,
      userId,
      landlordId,
      fullNameA,
      fullNameB,
      cmndA,
      cmndB,
      addressA,
      addressB,
      phoneA,
      phoneB,
      agreed,
      contractTerms,
      depositAmount,
      apartmentCode, // nếu frontend đã gửi
    } = req.body;

    let finalDeposit = depositAmount;

    // Nếu không gửi sẵn từ frontend thì tính ở backend
    if (!finalDeposit) {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ success: false, message: "Không tìm thấy bài đăng." });
      }
      finalDeposit = Math.floor(post.price * 0.1); // tính 10% giá thuê
    }

    const contract = new Contract({
      postId,
      startDate,
      endDate,
      userId,
      landlordId,
      fullNameA,
      fullNameB,
      cmndA,
      cmndB,
      addressA,
      addressB,
      phoneA,
      phoneB,
      agreed,
      contractTerms,
      apartmentCode,
      depositAmount: finalDeposit, // 💰 lưu tiền đặt cọc
    });

    await contract.save();

    res.status(201).json({ success: true, message: "Tạo hợp đồng thành công", data: contract });
  } catch (error) {
    console.error("❌ Lỗi tạo hợp đồng:", error);
    res.status(500).json({ success: false, message: "Tạo hợp đồng thất bại", error });
  }
};

// Lấy hợp đồng của người dùng hiện tại
export const getMyContracts = async (req, res) => {
    try {
      const userId = req.user.id;
      const contracts = await Contract.find({
        $or: [{ userId: userId }, { landlordId: userId }],
      }).sort({ createdAt: -1 });
  
      const now = new Date();
  
      const updatedContracts = await Promise.all(
        contracts.map(async (contract) => {
          if (
            contract.status === "approved" &&
            new Date(contract.endDate) < now
          ) {
            contract.status = "expired";
            await contract.save();
          }
          return contract;
        })
      );
  
      res.status(200).json({ success: true, data: updatedContracts });
    } catch (error) {
      console.error("❌ Lỗi getMyContracts:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  };
  

  // [PUT] Duyệt hợp đồng
export const approveContract = async (req, res) => {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
  
    contract.status = "approved";
    await contract.save();
    res.json({ message: "Đã duyệt hợp đồng", data: contract });
  };
  
  // [PUT] Từ chối hợp đồng có lý do
  export const rejectContract = async (req, res) => {
    const contract = await Contract.findById(req.params.id);
    const { reason } = req.body;
  
    if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    if (!reason || reason.trim() === "") return res.status(400).json({ message: "Vui lòng nhập lý do từ chối" });
  
    contract.status = "rejected";
    contract.rejectionReason = reason;
    await contract.save();
  
    res.json({ message: "Đã từ chối hợp đồng", data: contract });
  };
  
  // [DELETE] Xóa hợp đồng
  export const deleteContract = async (req, res) => {
    await Contract.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa hợp đồng" });
  };
  // xem chi tiết hợp đồng 
  // ✅ Lấy chi tiết 1 hợp đồng
export const getContractById = async (req, res) => {
    try {
      const contract = await Contract.findById(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
      }
      res.status(200).json({ data: contract });
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  };
  // edit roofi update lai 
  export const resubmitContract = async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate, contractTerms } = req.body;
  
      const contract = await Contract.findById(id);
      if (!contract) {
        return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
      }
  
      // Kiểm tra quyền người gửi
      if (req.user._id.toString() !== contract.userId.toString()) {
        return res.status(403).json({ message: "Bạn không có quyền sửa hợp đồng này" });
      }
  
      // Cập nhật lại
      contract.startDate = startDate;
      contract.endDate = endDate;
      contract.contractTerms = contractTerms;
      contract.status = "pending"; // gửi lại để chờ duyệt
      contract.rejectReason = "";  // xoá lý do cũ
  
      await contract.save();
  
      res.json({ message: "📤 Đã gửi lại hợp đồng", data: contract });
    } catch (err) {
      console.error("❌ Resubmit error:", err);
      res.status(500).json({ message: "Lỗi khi gửi lại hợp đồng" });
    }
  };
  