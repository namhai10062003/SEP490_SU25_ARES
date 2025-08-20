import multer from "multer";
import { upload } from "../db/cloudinary.js";

// Middleware upload nhiều loại file cùng lúc, giới hạn dung lượng
const uploadImage = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: "documentFront", maxCount: 1 },
    { name: "documentBack", maxCount: 1 },
    { name: "images", maxCount: 20 }, // Cho phép nhiều ảnh
  ]);

  // Gắn limits vào multer
  const options = {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB/ảnh
  };

  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          status: "fail",
          message: "❌ File quá lớn! Dung lượng tối đa 5MB/ảnh",
        });
      }
      return res.status(400).json({
        status: "fail",
        message: "❌ Lỗi upload: " + err.message,
      });
    } else if (err) {
      return res.status(400).json({
        status: "fail",
        message: "❌ Lỗi hệ thống: " + err.message,
      });
    }

    console.log("📸 Uploaded files:", req.files);
    next();
  });
};

export { uploadImage };


