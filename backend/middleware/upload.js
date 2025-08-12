import multer from 'multer';
import { upload } from '../db/cloudinary.js';

// Middleware upload 2 file cùng lúc
const uploadImage = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'documentFront', maxCount: 1 },
    { name: 'documentBack', maxCount: 1 },
    { name: 'images', maxCount: 10 } 
  ]);

  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        status: "fail",
        message: "Error uploading files: " + err.message,
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

export { uploadImage };

