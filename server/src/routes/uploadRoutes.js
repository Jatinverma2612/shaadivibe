import express from 'express';
import { customerPhotoUpload, adminThemeAssetUpload } from '../middleware/uploadMiddleware.js';
import { uploadPhotos } from '../controllers/uploadController.js';
import { optionalAuth, protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer photo uploads (5MB max, strictly JPG/PNG/WebP, optionalAuth)
router.post(
  '/',
  optionalAuth,
  (req, res, next) => {
    customerPhotoUpload.any()(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message || 'Photo upload failed.' });
      }
      next();
    });
  },
  uploadPhotos
);

// Admin-only theme asset uploads (100MB max, JPG/PNG/WebP, MP4/MOV, and ZIP archives)
router.post(
  '/theme-asset',
  protectAdmin,
  (req, res, next) => {
    adminThemeAssetUpload.any()(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message || 'Theme asset upload failed.' });
      }
      next();
    });
  },
  uploadPhotos
);

export default router;
