import express from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from '../controllers/couponController.js';
import { protect, protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / User checkout coupon validation
router.post('/validate', validateCoupon);

// Admin-protected coupon management routes
router.use(protect, protectAdmin);
router.get('/', getCoupons);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.patch('/:id/toggle', toggleCouponStatus);
router.delete('/:id', deleteCoupon);

export default router;

