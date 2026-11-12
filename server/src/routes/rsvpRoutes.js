import express from 'express';
import {
  submitRsvp,
  getInvitationRsvps,
  getAdminRsvps,
} from '../controllers/rsvpController.js';
import { protect, protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public RSVP response submission
router.post('/', submitRsvp);

// Invitation owner or admin viewing RSVPs for an invitation
router.get('/invitation/:invitationId', protect, getInvitationRsvps);

// Admin platform-wide RSVP overview
router.get('/admin/all', protectAdmin, getAdminRsvps);

export default router;

