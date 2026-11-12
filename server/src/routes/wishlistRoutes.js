import express from 'express';
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  syncWishlist,
} from '../controllers/wishlistController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getWishlist);
router.post('/toggle', protect, toggleWishlist);
router.delete('/items/:themeId', protect, removeFromWishlist);
router.post('/sync', protect, syncWishlist);

export default router;
