import pkg from "cloudinary";
import * as dotenv from "dotenv";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

const { v2: cloudinary } = pkg;

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình lưu trữ file ảnh trên Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "home", // Lưu vào thư mục "avatar"
        format: async (req, file) => {
            const allowedFormats = ["jpg", "png", "jpeg", "gif"];
            const ext = file.mimetype.split("/")[1]; // Lấy phần mở rộng file từ mimetype
            if (allowedFormats.includes(ext)) return ext;
            throw new Error("Invalid file format. Only JPG, PNG, and GIF are allowed!");
        },
        public_id: (req, file) => {
            return `avatar_${Date.now()}`; // Đặt tên file duy nhất
        },
    },
});


const storage2 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "contract-photo", // Lưu vào thư mục "avatar"
        format: async (req, file) => {
            const allowedFormats = ["jpg", "png", "jpeg", "gif"];
            const ext = file.mimetype.split("/")[1]; // Lấy phần mở rộng file từ mimetype
            if (allowedFormats.includes(ext)) return ext;
            throw new Error("Invalid file format. Only JPG, PNG, and GIF are allowed!");
        },
        public_id: (req, file) => {
            return `contract-photo${Date.now()}`; // Đặt tên file duy nhất
        },
    },
});

// Middleware upload ảnh với kiểm tra định dạng file
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
        if (file && allowedFormats.includes(file.mimetype)) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error("Invalid file format. Only JPG, PNG, and GIF are allowed!"), false);
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn file 2MB
});

const upload2 = multer({
    storage: storage2,
    fileFilter: (req, file, cb) => {
        const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
        if (file && allowedFormats.includes(file.mimetype)) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error("Invalid file format. Only JPG, PNG, and GIF are allowed!"), false);
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn file 2MB
});

export { cloudinary, upload,upload2 };

