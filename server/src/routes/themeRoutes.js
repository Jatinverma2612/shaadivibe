import express from 'express';
import {
  getThemes,
  getThemeBySlug,
  createTheme,
  updateTheme,
  togglePublish,
} from '../controllers/themeController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getThemes);
router.get('/:slug', getThemeBySlug);
router.post('/', protectAdmin, createTheme);
router.put('/:id', protectAdmin, updateTheme);
router.patch('/:id/publish', protectAdmin, togglePublish);

export default router;
