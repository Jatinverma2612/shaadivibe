import express from 'express';
import {
  getInvitationBySlug,
  createInvitation,
  updateInvitation,
} from '../controllers/invitationController.js';

const router = express.Router();

router.get('/:slug', getInvitationBySlug);
router.post('/', createInvitation);
router.put('/:id', updateInvitation);

export default router;
