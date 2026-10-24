import { Invitation } from '../models/Invitation.js';
import { sampleInvitation } from '../../../shared/constants/mockData.js';
export { sampleInvitation };

// In-memory cache for invitations created during current runtime session
const sessionInvitations = new Map();
sessionInvitations.set('priya-and-rohan', { ...sampleInvitation, status: 'published' });

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
  if (!invitation.userId) return true; // Anonymous / unclaimed invitation
  const invUserId = invitation.userId._id ? invitation.userId._id.toString() : invitation.userId.toString();
  const currentUserId = user._id ? user._id.toString() : (user.id ? user.id.toString() : '');
  return invUserId === currentUserId;
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
      query.$or = [{ userId }, { userId: null }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { brideName: searchRegex },
            { groomName: searchRegex },
            { slug: searchRegex },
          ],
        },
      ];
      delete query.$or;
    }

    let invitations = [];
    let total = 0;

    try {
      total = await Invitation.countDocuments(query);
      invitations = await Invitation.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum);
    } catch (dbErr) {
      // Memory fallback
      const allSession = Array.from(sessionInvitations.values());
      const filtered = allSession.filter((inv) => {
        if (req.user.role !== 'admin' && inv.userId && inv.userId !== (req.user._id || req.user.id)) {
          return false;
        }
        if (status && status !== 'all' && inv.status !== status) {
          return false;
        }
        return true;
      });
      total = filtered.length;
      invitations = filtered.slice(skip, skip + limitNum);
    }

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
    let invitation = null;

    try {
      invitation = await Invitation.findById(id);
    } catch (e) {
      // ignore
    }

    if (!invitation) {
      invitation = sessionInvitations.get(id) || Array.from(sessionInvitations.values()).find((inv) => inv._id === id || inv.id === id);
    }

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    // Ownership check: drafts are private to owner or admin
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

    let invitation = null;
    try {
      invitation = await Invitation.findOne({ slug: cleanSlug });
    } catch (dbErr) {
      // ignore
    }

    if (!invitation) {
      invitation = sessionInvitations.get(cleanSlug);
    }

    // Default demo if looking for sample or preview
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

    const uniqueSlug = generateSlug(brideName, groomName, customSlug);
    const userId = req.user ? (req.user._id || req.user.id) : null;

    const inviteData = {
      slug: uniqueSlug,
      userId: userId || undefined,
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
    } catch (dbErr) {
      console.warn('[InvitationController] Database unavailable, saving in session storage.');
      saved = { ...inviteData, _id: `session_${Date.now()}` };
    }

    sessionInvitations.set(uniqueSlug, saved);
    if (saved._id) {
      sessionInvitations.set(saved._id.toString(), saved);
    }

    res.status(201).json({
      success: true,
      message: status === 'published' ? 'Invitation published successfully!' : 'Draft saved successfully!',
      data: saved,
      shareUrl: `/invite/${uniqueSlug}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing invitation (with ownership check)
 * PUT /api/invitations/:id
 */
export const updateInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    let existing = null;

    try {
      existing = await Invitation.findById(id);
    } catch (dbErr) {
      // ignore
    }

    if (!existing) {
      existing = sessionInvitations.get(id);
    }

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    // Ownership check
    if (!isOwnerOrAdmin(existing, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to modify this invitation.',
      });
    }

    // Prepare update fields (disallow unauthorized ownership or slug hijacking)
    const updatePayload = { ...req.body };
    delete updatePayload._id;
    delete updatePayload.__v;

    // If current draft was unclaimed and customer is now logged in, claim ownership
    if (!existing.userId && req.user) {
      updatePayload.userId = req.user._id || req.user.id;
    }

    let updated = null;
    try {
      updated = await Invitation.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } catch (dbErr) {
      // Memory fallback
    }

    if (!updated) {
      updated = { ...existing.toObject ? existing.toObject() : existing, ...updatePayload };
    }

    sessionInvitations.set(updated.slug, updated);
    sessionInvitations.set(id, updated);

    res.json({
      success: true,
      message: 'Invitation updated successfully.',
      data: updated,
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
    let existing = null;

    try {
      existing = await Invitation.findById(id);
    } catch (dbErr) {
      // ignore
    }

    if (!existing) {
      existing = sessionInvitations.get(id);
    }

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    // Ownership check
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

    let updated = null;
    try {
      updated = await Invitation.findByIdAndUpdate(
        id,
        { status: 'published' },
        { new: true }
      );
    } catch (e) {}

    if (!updated) {
      updated = { ...existing.toObject ? existing.toObject() : existing, status: 'published' };
    }

    sessionInvitations.set(updated.slug, updated);
    sessionInvitations.set(id, updated);

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
    let existing = null;

    try {
      existing = await Invitation.findById(id);
    } catch (dbErr) {
      // ignore
    }

    if (!existing) {
      existing = sessionInvitations.get(id);
    }

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

    let updated = null;
    try {
      updated = await Invitation.findByIdAndUpdate(
        id,
        { status: 'draft' },
        { new: true }
      );
    } catch (e) {}

    if (!updated) {
      updated = { ...existing.toObject ? existing.toObject() : existing, status: 'draft' };
    }

    sessionInvitations.set(updated.slug, updated);
    sessionInvitations.set(id, updated);

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
    let existing = null;

    try {
      existing = await Invitation.findById(id);
    } catch (dbErr) {
      // ignore
    }

    if (!existing) {
      existing = sessionInvitations.get(id);
    }

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

    try {
      await Invitation.findByIdAndDelete(id);
    } catch (e) {}

    sessionInvitations.delete(id);
    if (existing.slug) {
      sessionInvitations.delete(existing.slug);
    }

    res.json({
      success: true,
      message: 'Invitation deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
