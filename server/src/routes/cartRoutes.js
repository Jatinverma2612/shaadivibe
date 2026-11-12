import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  syncCart,
  clearCart,
} from '../controllers/cartController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getCart);
router.post('/items', protect, addToCart);
router.delete('/items/:themeId', protect, removeFromCart);
router.post('/sync', protect, syncCart);
router.delete('/', protect, clearCart);

export default router;
