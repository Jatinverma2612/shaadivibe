import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getMyOrders,
  getCustomersLookup,
} from '../controllers/orderController.js';
import { protect, protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer-facing orders
router.get('/my-orders', protect, getMyOrders);

// Admin-facing customer lookup helper for order creation wizard
router.get('/customers/lookup', protectAdmin, getCustomersLookup);

// Admin Order Management
router.get('/', protectAdmin, getOrders);
router.post('/', protectAdmin, createOrder);
router.get('/:id', protect, getOrderById);
router.put('/:id', protectAdmin, updateOrder);
router.patch('/:id/status', protectAdmin, updateOrderStatus);
router.delete('/:id', protectAdmin, deleteOrder);

export default router;

