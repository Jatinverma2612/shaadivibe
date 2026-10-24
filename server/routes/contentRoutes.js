import express from 'express';
import {
  getContentBySection,
  updateContentBySection,
} from '../controllers/contentController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:section', getContentBySection);
router.put('/:section', protectAdmin, updateContentBySection);

export default router;
