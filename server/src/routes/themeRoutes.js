import express from 'express';
import {
  getThemes,
  getThemeBySlug,
  createTheme,
  updateTheme,
  deleteTheme,
  togglePublish,
} from '../controllers/themeController.js';
import { protectAdmin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getThemes);
router.get('/:slug', optionalAuth, getThemeBySlug);
router.post('/', protectAdmin, createTheme);
router.put('/:id', protectAdmin, updateTheme);
router.delete('/:id', protectAdmin, deleteTheme);
router.patch('/:id/publish', protectAdmin, togglePublish);

export default router;
