import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình storage riêng cho ảnh hồ sơ
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile", // 📂 upload vào folder 'profile'
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage: profileStorage });

// Middleware upload 1 ảnh đại diện profile
const uploadProfileImage = (req, res, next) => {
  const uploadSingle = upload.single("profileImage");

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        status: "fail",
        message: "Lỗi khi upload ảnh đại diện: " + err.message,
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

export { uploadProfileImage };
