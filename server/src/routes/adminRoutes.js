import express from 'express';
import { getDashboardStats, getAnalyticsData } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protectAdmin, getDashboardStats);
router.get('/analytics', protectAdmin, getAnalyticsData);

export default router;
