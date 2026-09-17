// middlewares/multer.middleware.js
import multer from 'multer';
import apiError from '../utils/apiError.js';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',

  // Audio
  'audio/mpeg',       // MP3
  'audio/ogg',        // OGG
  'application/ogg',
  'audio/wav',        // WAV
  'audio/x-wav',
  'audio/mp4',        // M4A
  'audio/aac',
  'audio/webm',
  'audio/flac',

  // Video
  'video/mp4',
  'video/webm',
  'video/quicktime',  // MOV
  'video/x-msvideo',  // AVI
  'video/x-matroska', // MKV
  'video/mpeg',

  // Documents
  'application/pdf',

  'application/msword', // DOC

  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX

  'application/vnd.ms-excel', // XLS

  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX

  'application/vnd.ms-powerpoint', // PPT

  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX

  'text/plain', // TXT
  'text/csv',   // CSV

  // Archives
  'application/zip',
  'application/x-7z-compressed',
  'application/x-rar-compressed'
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