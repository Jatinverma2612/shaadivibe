import express from 'express';
import {
  createTicket,
  getMyTickets,
  getTicketById,
} from '../controllers/ticketController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Customer ticket creation
router.post('/', optionalAuth, createTicket);

// Customer fetching their own tickets
router.get('/my', protect, getMyTickets);

// Single ticket view (IDOR guarded: Admin or Ticket Owner)
router.get('/:id', protect, getTicketById);

export default router;
