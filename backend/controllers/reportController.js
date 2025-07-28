import Post from "../models/Post.js";
import Report from "../models/Report.js";

// controllers/reportController.js

export const createReport = async (req, res) => {
  try {
    /* ====== DEBUG tiện kiểm tra ====== */
    console.log("[DEBUG] req.params:", req.params); // { postId: ... }
    console.log("[DEBUG] req.body  :", req.body);   // Có thể {reason,...} hoặc {data:{reason,...}}
    console.log("[DEBUG] req.user  :", req.user);   // Lấy từ middleware auth

    const { postId } = req.params;
    const userId = req.user?._id;   // Có thể undefined nếu chấp nhận ẩn danh

    /* ----- 1. Lấy payload thật sự ----- */
    const payload = req.body?.data ? req.body.data : req.body;   // ưu tiên req.body.data
    const reason = typeof payload.reason === "string" ? payload.reason.trim() : "";
    const description = typeof payload.description === "string" ? payload.description.trim() : "";

    /* ----- 2. Validate ----- */
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Lý do báo cáo là bắt buộc.",
      });
    }

    /* ----- 3. bài đăng có tồn tại? ----- */
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài đăng.",
      });
    }

    /* ----- 4. Tạo báo cáo ----- */
    const report = await Report.create({
      post,
      user: userId,
      reason,
      description,
    });

    console.log("[DEBUG] Report created:", report);

    return res.status(201).json({
      success: true,
      message: "Báo cáo đã được gửi.",
      data: report,
    });

  } catch (err) {
    console.error("[DEBUG] createReport error:", err);

    // Lỗi duplicate key (đã báo cáo trước đó)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã gửi báo cáo này trước đó.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ.",
    });
  }
};

/**
 * (Tùy chọn) Lấy tất cả report – thường cho admin
 * GET /api/reports?status=pending
 */
export const getReports = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const reports = await Report.find(filter)
      .populate("post", "title type description location property area price legalDocument interiorStatus images createdAt")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reports });
  } catch (err) {
    console.error("Lỗi getReports:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};


/**
 * (Tùy chọn) Cập nhật trạng thái report (admin)
 * PATCH /api/reports/:id
 * Body { status: "reviewed" | "rejected" }
 */
export const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  console.log("[updateReportStatus] 🚀 Dữ liệu nhận được:", req.body); // 👈 log rõ dữ liệu

  if (!["pending", "reviewed", "rejected"].includes(status)) {
    console.log("[updateReportStatus] ❌ Trạng thái không hợp lệ:", status); // 👈 log trạng thái lỗi
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  if (status === "rejected" && (!reason || reason.trim() === "")) {
    console.log("[updateReportStatus] ❌ Lý do từ chối bị thiếu");
    return res.status(400).json({ message: "Cần nhập lý do từ chối" });
  }

  try {
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo" });
    }

    report.status = status;
    if (status === "rejected") {
      report.reason = reason;
    }

    await report.save();

    console.log("[updateReportStatus] ✅ Cập nhật thành công:", report);
    res.json({ message: "Cập nhật thành công", data: report });
  } catch (err) {
    console.error("❌ Lỗi cập nhật báo cáo:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
