import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage riêng cho giấy tờ tạm trú / tạm vắng
const residenceDocStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "residence_declaration", // folder lưu ảnh trên Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage: residenceDocStorage });

// Middleware: upload 1 ảnh duy nhất
const uploadResidenceDocument = (req, res, next) => {
  const singleUpload = upload.single("documentImage"); // tên field phải là documentImage

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        status: "fail",
        message: "Lỗi upload file: " + err.message,
      });
    } else if (err) {
      return res.status(400).json({
        status: "fail",
        message: err.message,
      });
    }
    next();
  });
};

export { uploadResidenceDocument };
