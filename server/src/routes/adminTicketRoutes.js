import express from 'express';
import { getAdminTickets, updateTicket } from '../controllers/ticketController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/', getAdminTickets);
router.patch('/:id', updateTicket);

export default router;

