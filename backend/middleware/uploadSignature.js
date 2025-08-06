import multer from 'multer';
import { upload } from '../db/cloudinary.js';

// Middleware upload 2 file chữ ký: signaturePartyAUrl và signaturePartyBUrl
const uploadSignature = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'signaturePartyAUrl', maxCount: 1 },
    { name: 'signaturePartyBUrl', maxCount: 1 }
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

export { uploadSignature };
