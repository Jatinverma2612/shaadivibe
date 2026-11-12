import mongoose from 'mongoose';
import { Invitation } from '../models/Invitation.js';
import { sampleInvitation } from '../constants/mockData.js';
export { sampleInvitation };

const generateSlug = (bride, groom, custom) => {
  if (custom && custom.trim()) {
    return custom.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
  }
  const b = (bride || 'bride').toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
  const g = (groom || 'groom').toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${b}-weds-${g}-${randomSuffix}`.replace(/-+/g, '-');
};

const isOwnerOrAdmin = (invitation, user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (!invitation || !invitation.userId) return false; // Unassigned / anonymous invitations are not owned by any customer
  const invUserId = invitation.userId._id ? invitation.userId._id.toString() : invitation.userId.toString();
  const currentUserId = user._id ? user._id.toString() : (user.id ? user.id.toString() : '');
  return Boolean(invUserId && currentUserId && invUserId === currentUserId);
};

/**
 * List invitations belonging to current authenticated customer (or all if admin)
 * GET /api/invitations
 */
export const getUserInvitations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // Customer only sees their own; Admin sees all
    if (req.user.role !== 'admin') {
      const userId = req.user._id || req.user.id;
      query.userId = userId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = [
        query.userId ? { userId: query.userId } : {},
        {
          $or: [
            { brideName: searchRegex },
            { groomName: searchRegex },
            { slug: searchRegex },
          ],
        },
      ];
      delete query.userId;
    }

    const total = await Invitation.countDocuments(query);
    const invitations = await Invitation.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: invitations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch single invitation by internal ID (with ownership check for drafts)
 * GET /api/invitations/id/:id
 */
export const getInvitationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid invitation ID format.' });
    }

    const invitation = await Invitation.findById(id);

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    // Ownership check: drafts and invitations are private to owner or admin
    if (!isOwnerOrAdmin(invitation, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view or manage this invitation.',
      });
    }

    res.json({ success: true, data: invitation });
  } catch (error) {
    next(error);
  }
};

/**
 * Public or authorized retrieval by slug
 * GET /api/invitations/:slug
 */
export const getInvitationBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slug.toLowerCase().trim();

    let invitation = await Invitation.findOne({ slug: cleanSlug });

    // Intended public demo sample invitation fallback for sample/demo/priya-and-rohan
    if (!invitation && (cleanSlug === 'sample' || cleanSlug === 'demo' || cleanSlug === 'priya-and-rohan')) {
      invitation = { ...sampleInvitation, status: 'published' };
    }

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Wedding invitation not found. Please verify the URL.',
      });
    }

    // Privacy rule: Unpublished drafts can ONLY be viewed by owner or admin
    if (invitation.status === 'draft') {
      if (!isOwnerOrAdmin(invitation, req.user)) {
        return res.status(404).json({
          success: false,
          message: 'Wedding invitation not found or is currently private.',
        });
      }
    }

    res.json({ success: true, data: invitation });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or save initial invitation draft
 * POST /api/invitations
 */
export const createInvitation = async (req, res, next) => {
  try {
    const {
      brideName,
      groomName,
      weddingDate,
      weddingTime,
      language,
      tagline,
      familyMessage,
      venue,
      photos,
      interactiveCards,
      events,
      themeSlug,
      customSlug,
      status = 'draft',
    } = req.body;

    if (!brideName || !groomName) {
      return res.status(400).json({
        success: false,
        message: 'Bride name and Groom name are required.',
      });
    }

    // Guard against duplicate draft creation: If an existing ID was provided by the client, route to update
    const existingId = req.body._id || req.body.id;
    if (existingId && !existingId.startsWith('local_')) {
      if (!mongoose.Types.ObjectId.isValid(existingId)) {
        return res.status(400).json({ success: false, message: 'Invalid invitation ID format.' });
      }

      const existing = await Invitation.findById(existingId);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Invitation not found.' });
      }

      // If existing has an owner and user is not owner/admin -> 403
      if (existing.userId && !isOwnerOrAdmin(existing, req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to modify this invitation.',
        });
      }

      req.params = { id: existingId };
      return updateInvitation(req, res, next);
    }

    const uniqueSlug = generateSlug(brideName, groomName, customSlug);
    // Never trust client-supplied userId: strictly derive from req.user
    const userId = req.user ? (req.user._id || req.user.id) : null;

    const inviteData = {
      slug: uniqueSlug,
      userId: userId || null,
      themeSlug: themeSlug || 'royal-udaipur-palace',
      brideName: brideName.trim(),
      groomName: groomName.trim(),
      weddingDate: weddingDate ? new Date(weddingDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      weddingTime: weddingTime || '07:30 PM',
      language: language || 'English',
      tagline: tagline || 'Two Souls, One Sacred Journey',
      familyMessage: familyMessage || 'We cordially invite you to celebrate our wedding.',
      venue: {
        name: venue?.name || 'Grand Palace Venue',
        address: venue?.address || '',
        mapUrl: venue?.mapUrl || '',
      },
      photos: Array.isArray(photos) ? photos : [],
      interactiveCards: Array.isArray(interactiveCards) && interactiveCards.length > 0 ? interactiveCards : sampleInvitation.interactiveCards,
      events: Array.isArray(events) && events.length > 0 ? events : sampleInvitation.events,
      status: status === 'published' ? 'published' : 'draft',
    };

    let saved = null;
    try {
      saved = await Invitation.create(inviteData);
    } catch (createErr) {
      if (createErr.code === 11000 && createErr.keyPattern?.slug) {
        inviteData.slug = generateSlug(brideName, groomName, `${brideName}-${groomName}-${Date.now()}`);
        saved = await Invitation.create(inviteData);
      } else {
        throw createErr;
      }
    }

    res.status(201).json({
      success: true,
      message: status === 'published' ? 'Invitation published successfully!' : 'Draft saved successfully!',
      data: saved,
      shareUrl: `/invite/${saved.slug}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing invitation (with ownership check and atomic claiming)
 * PUT /api/invitations/:id
 */
export const updateInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid invitation ID format.' });
    }

    const existing = await Invitation.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    // Clean update payload: prevent client-supplied userId, slug, _id tampering
    const updatePayload = { ...req.body };
    delete updatePayload._id;
    delete updatePayload.id;
    delete updatePayload.__v;
    delete updatePayload.userId;
    delete updatePayload.slug;

    // Case 1: Draft already has an owner
    if (existing.userId) {
      if (!isOwnerOrAdmin(existing, req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to modify this invitation.',
        });
      }

      const updated = await Invitation.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
      return res.json({
        success: true,
        message: 'Invitation updated successfully.',
        data: updated,
      });
    }

    // Case 2: Draft is currently unowned (anonymous draft)
    // If user is unauthenticated, allow updating the anonymous draft content without setting userId
    if (!req.user) {
      const updated = await Invitation.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
      return res.json({
        success: true,
        message: 'Draft updated successfully.',
        data: updated,
      });
    }

    // User is authenticated: Atomic conditional ownership claim
    // To prevent race conditions / concurrent claiming, use findOneAndUpdate({ _id: id, userId: null })
    const targetUserId = req.user._id || req.user.id;
    const claimPayload = { ...updatePayload, userId: targetUserId };

    const claimed = await Invitation.findOneAndUpdate(
      { _id: id, userId: null },
      { $set: claimPayload },
      { new: true, runValidators: true }
    );

    if (!claimed) {
      // Re-fetch to determine why atomic claim did not match
      const freshDoc = await Invitation.findById(id);
      if (!freshDoc) {
        return res.status(404).json({ success: false, message: 'Invitation not found.' });
      }

      const freshOwnerId = freshDoc.userId ? freshDoc.userId.toString() : null;
      if (freshOwnerId && freshOwnerId !== targetUserId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Draft is already owned by another customer and cannot be claimed.',
        });
      }

      // If already claimed by this user in a parallel request, update it
      const updated = await Invitation.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
      return res.json({
        success: true,
        message: 'Invitation updated successfully.',
        data: updated,
      });
    }

    return res.json({
      success: true,
      message: 'Invitation claimed and updated successfully.',
      data: claimed,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Explicitly publish an invitation
 * PATCH /api/invitations/:id/publish
 */
export const publishInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid invitation ID format.' });
    }

    const existing = await Invitation.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    // Ownership check: must be owner or admin
    if (!isOwnerOrAdmin(existing, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to publish this invitation.',
      });
    }

    // Validate required fields for publishing
    if (!existing.brideName || !existing.groomName || !existing.weddingDate) {
      return res.status(400).json({
        success: false,
        message: 'Bride name, Groom name, and Wedding date are required to publish.',
      });
    }

    const updated = await Invitation.findByIdAndUpdate(
      id,
      { status: 'published' },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Royal Invitation published successfully!',
      data: updated,
      shareUrl: `/invite/${updated.slug}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unpublish an invitation (return to draft)
 * PATCH /api/invitations/:id/unpublish
 */
export const unpublishInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid invitation ID format.' });
    }

    const existing = await Invitation.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    // Ownership check
    if (!isOwnerOrAdmin(existing, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to unpublish this invitation.',
      });
    }

    const updated = await Invitation.findByIdAndUpdate(
      id,
      { status: 'draft' },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Invitation unpublished. It is now a private draft.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an invitation draft
 * DELETE /api/invitations/:id
 */
export const deleteInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid invitation ID format.' });
    }

    const existing = await Invitation.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    // Ownership check
    if (!isOwnerOrAdmin(existing, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to delete this invitation.',
      });
    }

    await Invitation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Invitation deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
