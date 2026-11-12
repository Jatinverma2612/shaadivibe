import express from 'express';
import {
  getCustomers,
  getCustomerById,
  updateCustomer,
} from '../controllers/customerController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);

export default router;

