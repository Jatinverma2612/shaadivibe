import mongoose from 'mongoose';
import { Rsvp } from '../models/Rsvp.js';
import { Invitation } from '../models/Invitation.js';

/**
 * Submit or update guest RSVP response (Public)
 * POST /api/rsvp
 * Atomically upserts response to guarantee idempotency.
 */
export const submitRsvp = async (req, res, next) => {
  try {
    const {
      invitationSlug,
      ceremonyId,
      guestName,
      guestEmail,
      guestPhone,
      attendance = 'attending',
      guestCount = 1,
      dietaryPreferences,
      message,
    } = req.body;

    if (!invitationSlug || typeof invitationSlug !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid invitation slug is required.' });
    }

    if (!ceremonyId || typeof ceremonyId !== 'string') {
      return res.status(400).json({ success: false, message: 'Ceremony selection is required.' });
    }

    if (!guestName || typeof guestName !== 'string' || !guestName.trim()) {
      return res.status(400).json({ success: false, message: 'Guest name is required.' });
    }

    if (!guestEmail || typeof guestEmail !== 'string' || !/^\S+@\S+\.\S+$/.test(guestEmail.trim())) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const cleanAttendance = ['attending', 'declined', 'maybe'].includes(attendance)
      ? attendance
      : 'attending';

    const cleanCount = Math.max(1, Math.min(10, parseInt(guestCount, 10) || 1));

    // 1. Verify Invitation exists and is published
    const invitation = await Invitation.findOne({
      slug: invitationSlug.toLowerCase().trim(),
      status: 'published',
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Published wedding invitation not found.',
      });
    }

    // 2. Validate selected ceremony exists in invitation.events
    const ceremony = (invitation.events || []).find(
      (ev) => ev.id === ceremonyId || ev._id?.toString() === ceremonyId
    );
    if (!ceremony) {
      return res.status(400).json({
        success: false,
        message: 'The selected ceremony is not part of this wedding itinerary.',
      });
    }

    const cleanEmail = guestEmail.toLowerCase().trim();

    // 3. Atomic Upsert to ensure duplicate submissions update the existing RSVP
    const filter = {
      invitationId: invitation._id,
      ceremonyId,
      guestEmail: cleanEmail,
    };

    const update = {
      invitationId: invitation._id,
      ceremonyId,
      ceremonyTitle: ceremony.title,
      guestName: guestName.trim(),
      guestEmail: cleanEmail,
      guestPhone: guestPhone ? String(guestPhone).trim().slice(0, 20) : '',
      attendance: cleanAttendance,
      guestCount: cleanAttendance === 'attending' ? cleanCount : 1,
      dietaryPreferences: dietaryPreferences ? String(dietaryPreferences).trim().slice(0, 200) : '',
      message: message ? String(message).trim().slice(0, 500) : '',
      respondedAt: new Date(),
    };

    const rsvp = await Rsvp.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    res.status(200).json({
      success: true,
      message: `Thank you, ${rsvp.guestName}! Your RSVP for "${rsvp.ceremonyTitle}" has been recorded.`,
      data: rsvp,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all RSVPs for an invitation (Owner or Admin)
 * GET /api/rsvp/invitation/:invitationId
 */
export const getInvitationRsvps = async (req, res, next) => {
  try {
    const { invitationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
      return res.status(400).json({ success: false, message: 'Invalid invitation ID format.' });
    }

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    // Authorization check: User must own the invitation, or be an admin
    if (req.user.role !== 'admin') {
      const invOwnerId = invitation.userId ? invitation.userId.toString() : '';
      const currentUserId = req.user._id ? req.user._id.toString() : req.user.id?.toString();

      if (invOwnerId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view RSVPs for this invitation.',
        });
      }
    }

    const rsvps = await Rsvp.find({ invitationId: invitation._id }).sort({ createdAt: -1 });

    const stats = {
      total: rsvps.length,
      attending: rsvps.filter((r) => r.attendance === 'attending').length,
      declined: rsvps.filter((r) => r.attendance === 'declined').length,
      maybe: rsvps.filter((r) => r.attendance === 'maybe').length,
      totalHeadcount: rsvps.reduce(
        (sum, r) => (r.attendance === 'attending' ? sum + (r.guestCount || 1) : sum),
        0
      ),
    };

    res.json({
      success: true,
      invitation: {
        _id: invitation._id,
        slug: invitation.slug,
        brideName: invitation.brideName,
        groomName: invitation.groomName,
      },
      stats,
      summary: stats,
      data: rsvps,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin overview of all RSVPs across the platform
 * GET /api/admin/rsvp
 */
export const getAdminRsvps = async (req, res, next) => {
  try {
    const { attendance, search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (attendance && ['attending', 'declined', 'maybe'].includes(attendance)) {
      query.attendance = attendance;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { guestName: searchRegex },
        { guestEmail: searchRegex },
        { ceremonyTitle: searchRegex },
      ];
    }

    const [rsvps, total, counts] = await Promise.all([
      Rsvp.find(query)
        .populate('invitationId', 'slug brideName groomName weddingDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Rsvp.countDocuments(query),
      Rsvp.aggregate([
        {
          $group: {
            _id: '$attendance',
            count: { $sum: 1 },
            headcount: {
              $sum: {
                $cond: [{ $eq: ['$attendance', 'attending'] }, '$guestCount', 0],
              },
            },
          },
        },
      ]),
    ]);

    const stats = {
      total: 0,
      attending: 0,
      declined: 0,
      maybe: 0,
      totalHeadcount: 0,
    };

    counts.forEach((c) => {
      if (stats[c._id] !== undefined) {
        stats[c._id] = c.count;
      }
      stats.total += c.count;
      stats.totalHeadcount += c.headcount || 0;
    });

    res.json({
      success: true,
      stats,
      data: {
        rsvps,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      rsvps,
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
