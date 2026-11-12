import mongoose from 'mongoose';
import { Ticket } from '../models/Ticket.js';
import { User } from '../models/User.js';

/**
 * Generate human-friendly, unique ticket number (e.g. TKT-2610-8492)
 */
const generateTicketNumber = async () => {
  const yearMonth = new Date().toISOString().slice(2, 7).replace('-', '');
  let ticketNumber = '';
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    ticketNumber = `TKT-${yearMonth}-${rand}`;
    const found = await Ticket.exists({ ticketNumber });
    if (!found) exists = false;
    attempts++;
  }

  return ticketNumber || `TKT-${Date.now()}`;
};

/**
 * Create a new support ticket (Customer or Guest)
 * POST /api/tickets
 */
export const createTicket = async (req, res, next) => {
  try {
    const {
      subject,
      description,
      category = 'general',
      priority = 'medium',
      name,
      email,
      phone,
      orderId,
      invitationId,
    } = req.body;

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Ticket subject is required.' });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Ticket description is required.' });
    }

    let customerId = null;
    let customerSnapshot = null;

    if (req.user) {
      customerId = req.user._id;
      customerSnapshot = {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || phone || '',
      };
    } else {
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Your name is required to submit a ticket.' });
      }
      if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'A valid email address is required.' });
      }
      customerSnapshot = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? String(phone).trim() : '',
      };

      // Check if user exists with this email
      const existingUser = await User.findOne({ email: customerSnapshot.email });
      if (existingUser) {
        customerId = existingUser._id;
      }
    }

    const ticketNumber = await generateTicketNumber();

    const ticket = await Ticket.create({
      ticketNumber,
      customerId,
      customerSnapshot,
      subject: subject.trim().slice(0, 200),
      description: description.trim().slice(0, 4000),
      category: [
        'general',
        'order_inquiry',
        'invitation_customization',
        'technical_issue',
        'billing_refund',
        'other',
      ].includes(category)
        ? category
        : 'general',
      priority: ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium',
      status: 'open',
      orderId: orderId && mongoose.Types.ObjectId.isValid(orderId) ? orderId : null,
      invitationId: invitationId && mongoose.Types.ObjectId.isValid(invitationId) ? invitationId : null,
    });

    return res.status(201).json({
      success: true,
      message: `Support ticket ${ticket.ticketNumber} created successfully.`,
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch authenticated customer's own tickets
 * GET /api/tickets/my
 */
export const getMyTickets = async (req, res, next) => {
  try {
    const customerId = req.user._id;
    const tickets = await Ticket.find({ customerId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch single ticket by ID or ticketNumber (Admin or Owner)
 * GET /api/tickets/:id
 */
export const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { ticketNumber: id }] }
      : { ticketNumber: id };

    const ticket = await Ticket.findOne(query)
      .populate('customerId', 'name email role')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    // IDOR protection
    if (req.user.role !== 'admin') {
      const ticketCustId = ticket.customerId?._id
        ? ticket.customerId._id.toString()
        : ticket.customerId?.toString();
      const currentUserId = req.user._id.toString();

      if (ticketCustId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to view this ticket.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch all platform tickets with filtering and search (Admin)
 * GET /api/admin/tickets
 */
export const getAdminTickets = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = 'all',
      priority = 'all',
      category = 'all',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search && typeof search === 'string') {
      const term = search.trim();
      filter.$or = [
        { ticketNumber: { $regex: term, $options: 'i' } },
        { subject: { $regex: term, $options: 'i' } },
        { 'customerSnapshot.name': { $regex: term, $options: 'i' } },
        { 'customerSnapshot.email': { $regex: term, $options: 'i' } },
      ];
    }

    const [tickets, total, counts] = await Promise.all([
      Ticket.find(filter)
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Ticket.countDocuments(filter),
      Ticket.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats = {
      all: 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };

    counts.forEach((c) => {
      if (stats[c._id] !== undefined) {
        stats[c._id] = c.count;
      }
      stats.all += c.count;
    });

    const urgentCount = await Ticket.countDocuments({ priority: 'urgent', status: { $in: ['open', 'in_progress'] } });

    return res.status(200).json({
      success: true,
      data: {
        tickets,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        stats: {
          ...stats,
          urgent: urgentCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update support ticket status, priority, or admin notes (Admin)
 * PATCH /api/admin/tickets/:id
 */
export const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID format.' });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const { status, priority, adminNotes, assignedTo } = req.body;

    if (status !== undefined) {
      if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ticket status.',
        });
      }
      ticket.status = status;
      if (status === 'resolved' && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
      } else if (status !== 'resolved') {
        ticket.resolvedAt = null;
      }
    }

    if (priority !== undefined) {
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ticket priority.',
        });
      }
      ticket.priority = priority;
    }

    if (adminNotes !== undefined) {
      ticket.adminNotes = String(adminNotes).trim().slice(0, 2000);
    }

    if (assignedTo !== undefined) {
      if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
        ticket.assignedTo = assignedTo;
      } else {
        ticket.assignedTo = null;
      }
    }

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: `Ticket ${ticket.ticketNumber} updated successfully.`,
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
};

