import { sendEmailNotification, sendSMSNotification } from '../helpers/notificationHelper.js';
import { emitNotification } from "../helpers/socketHelper.js";
import Contract from "../models/Contract.js";
import Notification from "../models/Notification.js";
import Post from "../models/Post.js"; // để lấy giá từ bài đăng
import User from "../models/User.js";

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
      emailA,
      emailB,
      agreed,
      contractTerms,
      depositAmount,
      apartmentCode,
      side,
      // signaturePartyAUrl,
      signaturePartyBUrl
    } = req.body;

    // 📌 Lấy bài đăng để lấy dữ liệu snapshot
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài đăng." });
    }
// Upload xong thì lưu đường dẫn vào trường tương ứng
// if (side === "A") {
//   contract.signaturePartyAUrl = req.file.path;
// } else
 if (side === "B") {
  contract.signaturePartyBUrl= req.file.path;
}
    // 💵 Tính tiền cọc nếu chưa có
    let finalDeposit = depositAmount || Math.floor(post.price * 0.1);

    // ✨ Snapshot đầy đủ các thông tin từ bài đăng
    const postSnapshot = {
      title: post.title,
      image: post.image,
      location: post.location,
      area: post.area,
      price: post.price,
      property: post.property,
      legalDocument: post.legalDocument,
      interiorStatus: post.interiorStatus,
      amenities: post.amenities,
      apartmentCode: post.apartmentCode,
    };

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
      emailA,
      emailB,
      agreed,
      contractTerms,
      apartmentCode,
      depositAmount: finalDeposit,
      withdrawableAmount: Math.round(finalDeposit * 0.9),
      postSnapshot, // ✅ dùng snapshot đầy đủ
      // signaturePartyAUrl,
      signaturePartyBUrl
    });

    await contract.save();
    await Notification.create({
      userId: userId,
      message: `Bạn đã tạo một hợp đồng mới ${contract._id} thành công.`
    });

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
        const isExpired = new Date(contract.endDate) < now;
    
        // Nếu đang approved mà đã hết hạn thì update status → expired
        if (contract.status === "approved" && isExpired) {
          contract.status = "expired";
          await contract.save();
        }
    
        // Trả thêm isExpired cho frontend xử lý lọc
        const contractObject = contract.toObject();
        contractObject.isExpired = isExpired;
        return contractObject;
      })
    );
    
    res.status(200).json({ success: true, data: updatedContracts });
    
  } catch (error) {
    console.error("❌ Lỗi getMyContracts:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// [PUT] Duyệt hợp đồng
export const approveContract = async (req, res) => {
  const contract = await Contract.findById(req.params.id);
  if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng" });

  const now = new Date();
  if (new Date(contract.endDate) < now) {
    contract.status = "expired";
    await contract.save();
    return res.status(400).json({ message: "Hợp đồng đã hết hạn và không thể duyệt" });
  }

  if (contract.status !== "pending") {
    return res.status(400).json({ message: "Hợp đồng không ở trạng thái chờ duyệt" });
  }

  contract.status = "approved";
  await contract.save();
  const newNotification = await Notification.create({
    userId: contract.userId,
    message: `Hợp đồng ${contract._id} của bạn đã được duyệt ✅.`
  });
  const user = await User.findById(contract.userId);
  // Gửi thông báo qua socket
  emitNotification(contract.userId, newNotification);
  // --- EMAIL & SMS NOTIFICATION ---
  if (user.email) {
    await sendEmailNotification({
      to: user.email,
      subject: "Thông báo duyệt hợp đồng",
      text: `Hợp đồng ${contract._id} của bạn đã được duyệt ✅.`,
      html: `<b>Hợp đồng ${contract._id} của bạn đã được duyệt ✅.</b>`
    });
  }
  if (user.phone) {
    await sendSMSNotification({
      to: user.phone,
      body: `Hợp đồng ${contract._id} của bạn đã được duyệt ✅.`
    });
  }
  // --- END EMAIL & SMS NOTIFICATION ---
  res.json({ message: "Đã duyệt hợp đồng", data: contract });
};

// [PUT] Từ chối hợp đồng có lý do
export const rejectContract = async (req, res) => {
  const contract = await Contract.findById(req.params.id);
  const { reason } = req.body;

  if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
  if (!reason || reason.trim() === "") return res.status(400).json({ message: "Vui lòng nhập lý do từ chối" });
  if (contract.status !== "pending") {
    return res.status(400).json({ message: "Hợp đồng không ở trạng thái chờ duyệt" });
  }
  contract.status = "rejected";
  contract.rejectionReason = reason;
  await contract.save();
  const newNotification = await Notification.create({
    userId: contract.userId,
    message: `Hợp đồng ${contract._id} của bạn đã bị từ chối ❌. Lý do: ${reason}`
  });
  const user = await User.findById(contract.userId);
  // Gửi thông báo qua socket
  emitNotification(contract.userId, newNotification);
  // --- EMAIL & SMS NOTIFICATION ---
  if (user.email) {
    await sendEmailNotification({
      to: user.email,
      subject: "Thông báo từ chối hợp đồng",
      text: `Hợp đồng ${contract._id} của bạn đã bị từ chối ❌. Lý do: ${reason}`,
      html: `<b>Hợp đồng ${contract._id} của bạn đã bị từ chối ❌. Lý do: ${reason}</b>`
    });
  }
  if (user.phone) {
    await sendSMSNotification({
      to: user.phone,
      body: `Hợp đồng ${contract._id} của bạn đã bị từ chối ❌. Lý do: ${reason}`
    });
  }
  // --- END EMAIL & SMS NOTIFICATION ---
  res.json({ message: "Đã từ chối hợp đồng", data: contract });
};

// [DELETE] Xóa hợp đồng
export const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }

    // Thực hiện soft delete (cho phép xóa dù ở trạng thái nào)
    contract.deletedAt = new Date(); // Đánh dấu thời gian xóa
    await contract.save();

    res.json({ message: "Đã xóa hợp đồng" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa hợp đồng", error: error.message });
  }
};

// xem chi tiết hợp đồng v
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
    contract.rejectionReason = "";  // xoá lý do cũ

    await contract.save();
    // Gửi thông báo cho người dùng và chủ nhà
    const newNotification = await Notification.create({
      userId: contract.landlordId,
      message: `Hợp đồng ${contract._id} đã được ${contract.userId} gửi lại để duyệt.`
    });
    await Notification.create({
      userId: contract.userId,
      message: `Bạn đã gửi lại hợp đồng ${contract._id} thành công, xin vui lòng chờ duyệt.`
    });
    // Gửi thông báo qua socket cho chủ nhà
    emitNotification(contract.landlordId, newNotification);

    // --- EMAIL & SMS NOTIFICATION ---
    const landlord = await User.findById(contract.landlordId);
    if (landlord.email) {
      await sendEmailNotification({
        to: landlord.email,
        subject: "Hợp đồng đã được gửi lại",
        text: `Hợp đồng ${contract._id} đã được ${contract.userId} gửi lại để duyệt.`,
        html: `<b>Hợp đồng ${contract._id} đã được ${contract.userId} gửi lại để duyệt.</b>`
      });
    }
    if (landlord.phone) {
      await sendSMSNotification({
        to: landlord.phone,
        body: `Hợp đồng ${contract._id} đã được ${contract.userId} gửi lại để duyệt.`
      });
    }
    if (req.user.email) {
      await sendEmailNotification({
        to: req.user.email,
        subject: "Hợp đồng đã gửi lại",
        text: `Bạn đã gửi lại hợp đồng ${contract._id} thành công, xin vui lòng chờ duyệt.`,
        html: `<b>Bạn đã gửi lại hợp đồng ${contract._id} thành công, xin vui lòng chờ duyệt.</b>`
      });
    }
    if (req.user.phone) {
      await sendSMSNotification({
        to: req.user.phone,
        body: `Bạn đã gửi lại hợp đồng ${contract._id} thành công, xin vui lòng chờ duyệt.`
      });
    }
    // --- END EMAIL & SMS NOTIFICATION ---
    res.json({ message: "📤 Đã gửi lại hợp đồng", data: contract });
  } catch (err) {
    console.error("❌ Resubmit error:", err);
    res.status(500).json({ message: "Lỗi khi gửi lại hợp đồng", error: err.message });
  }
};
export const getAllPaidContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ paymentStatus: "paid" }).sort({ createdAt: -1 });
    if (!contracts || contracts.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy hợp đồng nào đã thanh toán" });
    }
    res.status(200).json({ success: true, data: contracts });
  } catch (error) {
    console.error("❌ Lỗi getAllPaidContracts:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// hàm thực hiện cập nhật lại bản hợp đồng nếu mấy hợp đồng cũ muốn cập nhật cái số tiền nhận dc 
export const updateWithdrawableForAll = async (req, res) => {
  try {
    const contracts = await Contract.find();

    for (const contract of contracts) {
      if (contract.depositAmount && !contract.withdrawableAmount) {
        contract.withdrawableAmount = Math.round(contract.depositAmount * 0.9);

        // ⚠️ Nếu status không hợp lệ thì sửa lại trước khi lưu
        if (!["pending", "approved", "rejected", "expired"].includes(contract.status)) {
          console.warn(`⚠️ Hợp đồng ${contract._id} có status không hợp lệ: ${contract.status} → đang sửa về 'approved'`);
          contract.status = "approved"; // hoặc giá trị phù hợp
        }

        await contract.save();
      }
    }

    res.json({ message: "✅ Đã cập nhật withdrawableAmount cho tất cả hợp đồng" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "❌ Server error" });
  }
};

export const handleSignatureUpload = async (req, res) => {
  try {
    const contractId = req.body.contractId || req.query.contractId;

    if (!contractId) {
      return res.status(400).json({ message: "Thiếu contractId" });
    }

    const files = req.files;
    console.log("FILES:", files); // ✅ LOG RA ĐỂ DEBUG TRONG POSTMAN

    if (!files || (!files.signaturePartyAUrl && !files.signaturePartyBUrl)) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    const updateFields = {};
    if (files.signaturePartyAUrl) {
      updateFields.signaturePartyAUrl = files.signaturePartyAUrl[0].path;
    }
    if (files.signaturePartyBUrl) {
      updateFields.signaturePartyBUrl = files.signaturePartyBUrl[0].path;
    }

    const updatedContract = await Contract.findByIdAndUpdate(
      contractId,
      updateFields,
      { new: true }
    );

    if (!updatedContract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }

    res.status(200).json({
      message: "Upload chữ ký thành công",
      contract: updatedContract,
    });
  } catch (err) {
    console.error("Lỗi khi upload chữ ký:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


