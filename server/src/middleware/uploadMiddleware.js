import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '..', '..', 'uploads');

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
    const prefix = ext === '.mp4' || ext === '.mov' ? 'video' : ext === '.zip' ? 'template' : 'asset';
    const uniqueHash = crypto.randomBytes(12).toString('hex');
    const safeFilename = `${prefix}_${Date.now()}_${uniqueHash}${ext}`;
    cb(null, safeFilename);
  },
});

// File filter for customer photos: strictly JPG, PNG, and WebP with matched MIME type
const customerPhotoFilter = (req, file, cb) => {
  const allowedExtToMimes = {
    '.jpg': ['image/jpeg', 'image/jpg'],
    '.jpeg': ['image/jpeg', 'image/jpg'],
    '.png': ['image/png'],
    '.webp': ['image/webp'],
  };

  const ext = path.extname(path.basename(file.originalname)).toLowerCase();
  const validMimes = allowedExtToMimes[ext];

  if (validMimes && validMimes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Invalid photo format. Only JPG, PNG, and WebP images are allowed for customer photos.'), false);
  }
};

// File filter for admin theme assets: JPG, PNG, WebP, MP4, MOV, and ZIP with paired MIME verification
const adminAssetFilter = (req, file, cb) => {
  const allowedExtToMimes = {
    '.jpg': ['image/jpeg', 'image/jpg'],
    '.jpeg': ['image/jpeg', 'image/jpg'],
    '.png': ['image/png'],
    '.webp': ['image/webp'],
    '.mp4': ['video/mp4'],
    '.mov': ['video/quicktime'],
    '.zip': [
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
      'application/x-zip',
    ],
  };

  const ext = path.extname(path.basename(file.originalname)).toLowerCase();
  const validMimes = allowedExtToMimes[ext];

  if (validMimes && validMimes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Invalid asset format. Allowed formats: JPG, PNG, WebP, MP4, MOV, and ZIP.'), false);
  }
};

// Customer photo upload middleware: 5MB limit, max 6 photos per request
export const customerPhotoUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 6,
  },
  fileFilter: customerPhotoFilter,
});

// Admin theme asset upload middleware: 100MB limit (supports HD video templates & packages)
export const adminThemeAssetUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10,
  },
  fileFilter: adminAssetFilter,
});

export const upload = customerPhotoUpload;
export default customerPhotoUpload;
