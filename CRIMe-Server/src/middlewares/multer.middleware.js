// middlewares/multer.middleware.js
import multer from 'multer';
import apiError from '../utils/apiError.js';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'video/mp4',
  'audio/mpeg',
  'application/pdf',
  'application/zip'
];

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new apiError(400, `Unsupported file type: ${file.mimetype}`), false);
  }
  cb(null, true);
};

export const uploadEvidence = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file, adjust as needed
    files: 10 // max files per request, adjust as needed
  }
});