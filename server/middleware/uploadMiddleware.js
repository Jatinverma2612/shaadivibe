import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists safely
if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

// Storage abstraction for local development & extensible for cloud storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_ROOT);
  },
  filename: (req, file, cb) => {
    // Sanitize extension and generate random cryptographically strong filename
    const sanitizedOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedOriginal).toLowerCase();
    const uniqueHash = crypto.randomBytes(12).toString('hex');
    const safeFilename = `photo_${Date.now()}_${uniqueHash}${ext}`;
    cb(null, safeFilename);
  },
});

// File filter to only allow safe image types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  const ext = path.extname(path.basename(file.originalname)).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPG, PNG, and WebP images are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 6, // max 6 photos per batch
  },
  fileFilter,
});
