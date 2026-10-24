import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { uploadPhotos } from '../controllers/uploadController.js';

const router = express.Router();

// Allow up to 6 photos in single batch
router.post('/', upload.array('photos', 6), uploadPhotos);

export default router;
