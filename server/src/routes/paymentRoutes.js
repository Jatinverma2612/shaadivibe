import express from 'express';
import {
  getPayments,
  recordManualPayment,
  refundPayment,
  getGatewayConfig,
  updateGatewayConfig,
} from '../controllers/paymentController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/', getPayments);
router.post('/manual', recordManualPayment);
router.post('/:id/refund', refundPayment);
router.get('/config', getGatewayConfig);
router.put('/config', updateGatewayConfig);

export default router;

