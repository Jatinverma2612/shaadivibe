import express from 'express';
import {
  getUserInvitations,
  getInvitationById,
  getInvitationBySlug,
  createInvitation,
  updateInvitation,
  publishInvitation,
  unpublishInvitation,
  deleteInvitation,
} from '../controllers/invitationController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// List current user's invitations (or all for admin)
router.get('/', protect, getUserInvitations);

// Fetch invitation by internal ID (for owner/admin editing)
router.get('/id/:id', protect, getInvitationById);

// Public or authorized fetch by slug
router.get('/:slug', optionalAuth, getInvitationBySlug);

// Create / save initial invitation
router.post('/', optionalAuth, createInvitation);

// Update invitation draft
router.put('/:id', protect, updateInvitation);

// Explicit publish action
router.patch('/:id/publish', protect, publishInvitation);

// Unpublish action (revert to draft)
router.patch('/:id/unpublish', protect, unpublishInvitation);

// Delete draft
router.delete('/:id', protect, deleteInvitation);

export default router;
