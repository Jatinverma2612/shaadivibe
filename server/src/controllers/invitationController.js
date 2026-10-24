import { Invitation } from '../models/Invitation.js';

import { sampleInvitation } from '../../../shared/constants/mockData.js';
export { sampleInvitation };

// In-memory cache for invitations created during current runtime session
const sessionInvitations = new Map();
sessionInvitations.set('priya-and-rohan', sampleInvitation);

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
    if (!invitation && (cleanSlug === 'sample' || cleanSlug === 'demo')) {
      invitation = sampleInvitation;
    }

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Wedding invitation not found. Please verify the URL.',
      });
    }

    res.json({ success: true, data: invitation });
  } catch (error) {
    next(error);
  }
};

export const createInvitation = async (req, res, next) => {
  try {
    const {
      brideName,
      groomName,
      weddingDate,
      language,
      tagline,
      familyMessage,
      venue,
      photos,
      interactiveCards,
      events,
      themeSlug,
      customSlug,
    } = req.body;

    if (!brideName || !groomName || !weddingDate) {
      return res.status(400).json({
        success: false,
        message: 'Bride name, Groom name, and Wedding date are required.',
      });
    }

    // Generate unique slug
    const baseSlug = customSlug || `${brideName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-weds-${groomName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const inviteData = {
      slug: uniqueSlug,
      themeSlug: themeSlug || 'royal-udaipur-palace',
      brideName,
      groomName,
      weddingDate: new Date(weddingDate),
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
      status: 'published',
    };

    let saved = null;
    try {
      saved = await Invitation.create(inviteData);
    } catch (dbErr) {
      console.warn('[InvitationController] Database unavailable, saving in session storage.');
      saved = { ...inviteData, _id: `session_${Date.now()}` };
    }

    sessionInvitations.set(uniqueSlug, saved);

    res.status(201).json({
      success: true,
      message: 'Invitation created successfully!',
      data: saved,
      shareUrl: `/invite/${uniqueSlug}`,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updated = null;

    try {
      updated = await Invitation.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    } catch (dbErr) {
      // Session fallback
    }

    if (!updated && sessionInvitations.has(id)) {
      const existing = sessionInvitations.get(id);
      updated = { ...existing, ...req.body };
      sessionInvitations.set(id, updated);
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    res.json({ success: true, message: 'Invitation updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};
