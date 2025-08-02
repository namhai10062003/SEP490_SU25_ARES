import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Dùng chung 1 storage → tự động phân loại vào folder 'profile'
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage: profileStorage });

// Middleware: Upload 3 ảnh (profile + CCCD front/back)
const uploadProfileAndCCCD = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "cccdFrontImage", maxCount: 1 },
    { name: "cccdBackImage", maxCount: 1 },
  ]);

  uploadFields(req, res, (err) => {
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

export { uploadProfileAndCCCD };

