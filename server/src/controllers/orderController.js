import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Theme } from '../models/Theme.js';
import { Invitation } from '../models/Invitation.js';
import { Coupon } from '../models/Coupon.js';
import { computeCouponDiscount } from './couponController.js';

/**
 * Generate human-friendly, unique order number (e.g. SV26108492)
 */
const generateOrderNumber = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  let orderNumber = '';
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    orderNumber = `SV${year}${rand}`;
    const found = await Order.exists({ orderNumber });
    if (!found) exists = false;
    attempts++;
  }

  return orderNumber || `SV${year}${Date.now().toString().slice(-6)}`;
};

/**
 * Safely parse numeric price from number or formatted string (e.g. "₹4,999", "4,999.00", 4999)
 * Returns a positive finite number, or null if invalid, missing, zero, or negative.
 */
export const parseAuthoritativePrice = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || isNaN(value) || value <= 0) return null;
    return value;
  }
  if (typeof value === 'string') {
    // Strip currency symbols (₹, $, etc.), commas, and extra whitespace
    const cleaned = value.replace(/[^0-9.-]+/g, '').trim();
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed) || isNaN(parsed) || parsed <= 0) return null;
    return parsed;
  }
  return null;
};

/**
 * Enforced Order Lifecycle State Machine
 */
const ALLOWED_TRANSITIONS = {
  draft: ['pending', 'confirmed', 'cancelled'],
  pending: ['confirmed', 'processing', 'cancelled'],
  confirmed: ['processing', 'completed', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: ['cancelled'],
  cancelled: [],
};

/**
 * List orders with search, pagination, status filtering, and dynamic tab counts (Admin)
 * GET /api/orders
 */
export const getOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15, sort = 'latest' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by orderNumber, customer name/email, package name
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customerSnapshot.name': searchRegex },
        { 'customerSnapshot.email': searchRegex },
        { 'packageSnapshot.name': searchRegex },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'amount-asc') sortOption = { 'pricing.total': 1 };
    if (sort === 'amount-desc') sortOption = { 'pricing.total': -1 };

    const [orders, total, counts] = await Promise.all([
      Order.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Order.countDocuments(query),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Build dynamic tab counts from real database records
    const stats = {
      all: 0,
      pending: 0,
      confirmed: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
      draft: 0,
    };

    counts.forEach((c) => {
      if (stats[c._id] !== undefined) {
        stats[c._id] = c.count;
      }
      stats.all += c.count;
    });

    res.json({
      success: true,
      data: orders,
      stats,
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
 * Fetch single order by ID with full snapshots and lifecycle audit (Admin or Owner)
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { orderNumber: id }] }
      : { orderNumber: id };

    const order = await Order.findOne(query)
      .populate('customerId', 'name email role')
      .populate('themeId', 'name slug priceDisplay offerPrice status isPublished')
      .populate('invitationId', 'slug brideName groomName status');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Authorization: Admin can view any order; Customer can only view their own
    if (req.user.role !== 'admin') {
      const orderCustId = order.customerId?._id
        ? order.customerId._id.toString()
        : order.customerId?.toString();
      const currentUserId = req.user._id ? req.user._id.toString() : req.user.id?.toString();

      if (orderCustId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to view this order.',
        });
      }
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new Order or Order Draft (Admin)
 * POST /api/orders
 * Strictly verifies customer, validates theme availability, and derives pricing server-side.
 */
export const createOrder = async (req, res, next) => {
  try {
    const { customerId, themeId, invitationId, notes, status, source, couponCode } = req.body;

    // Idempotency check: if client retries saving an existing draft/pending order
    const existingId = req.body._id || req.body.id;
    if (existingId && mongoose.Types.ObjectId.isValid(existingId)) {
      const existingOrder = await Order.findById(existingId);
      if (existingOrder && (existingOrder.status === 'draft' || existingOrder.status === 'pending')) {
        if (notes !== undefined) existingOrder.notes = String(notes).trim().slice(0, 1000);
        const nextStatus = status && ['draft', 'pending', 'confirmed'].includes(status) ? status : existingOrder.status;
        if (nextStatus && nextStatus !== existingOrder.status) {
          const allowed = ALLOWED_TRANSITIONS[existingOrder.status] || [];
          if (allowed.includes(nextStatus)) {
            existingOrder.status = nextStatus;
            if (nextStatus === 'confirmed' && !existingOrder.confirmedAt) existingOrder.confirmedAt = new Date();
          }
        }
        await existingOrder.save();
        return res.status(200).json({
          success: true,
          message: `Order ${existingOrder.orderNumber} updated successfully.`,
          data: existingOrder,
        });
      }
    }

    // 1. Validate Customer
    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ success: false, message: 'A valid customer ID is required.' });
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer record not found in system.' });
    }

    // 2. Validate Theme
    if (!themeId || !mongoose.Types.ObjectId.isValid(themeId)) {
      return res.status(400).json({ success: false, message: 'A valid theme ID is required.' });
    }

    const theme = await Theme.findById(themeId);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Selected theme does not exist.' });
    }

    // Check theme availability: archived or unreleased themes cannot be selected for new orders
    if (theme.isArchived || theme.status === 'archived' || !theme.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'The selected theme is archived or inactive and cannot be ordered for new invitations.',
      });
    }

    // 3. Authoritative Server-Side Pricing Calculation
    const basePrice = parseAuthoritativePrice(theme.priceDisplay);
    if (basePrice === null) {
      return res.status(400).json({
        success: false,
        message: 'The selected theme has an invalid or missing price configuration and cannot be ordered.',
      });
    }

    const parsedOffer = parseAuthoritativePrice(theme.offerPrice);
    const offerPrice = (parsedOffer !== null && parsedOffer > 0 && parsedOffer < basePrice) ? parsedOffer : 0;
    const effectivePrice = offerPrice > 0 ? offerPrice : basePrice;

    const subtotal = effectivePrice;
    let discount = 0;
    let appliedCouponSnapshot = null;
    let couponToUpdate = null;

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const cleanCode = couponCode.toUpperCase().trim();
      const coupon = await Coupon.findOne({ code: cleanCode });
      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: `Coupon "${cleanCode}" is invalid or does not exist.`,
        });
      }

      const couponRes = computeCouponDiscount(coupon, subtotal);
      if (!couponRes.valid) {
        return res.status(400).json({
          success: false,
          message: couponRes.reason,
        });
      }

      discount = couponRes.discountAmount;
      appliedCouponSnapshot = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      };
      couponToUpdate = coupon;
    }

    const tax = 0;
    const total = Math.max(0, subtotal - discount + tax);

    // 4. Create Historical Snapshots
    const customerSnapshot = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
    };

    let packageType = 'Complete Wedding Suite';
    if (theme.themeType === 'video') packageType = 'Video Only';
    else if (theme.themeType === 'website') packageType = 'Interactive Website';
    else if (theme.themeType === 'both') packageType = 'Video + Website';

    const packageSnapshot = {
      name: theme.name,
      slug: theme.slug,
      themeType: theme.themeType || 'website',
      supportedFormats: Array.isArray(theme.supportedFormats) ? theme.supportedFormats : ['Interactive Website'],
      coverImage: theme.coverImage || '',
      basePrice,
      offerPrice,
      packageType,
    };

    // 5. Optional Invitation Linking
    let invitationSnapshot = {};
    let linkedInvitationId = null;

    if (invitationId && mongoose.Types.ObjectId.isValid(invitationId)) {
      const invitation = await Invitation.findById(invitationId);
      if (invitation) {
        linkedInvitationId = invitation._id;
        invitationSnapshot = {
          brideName: invitation.brideName,
          groomName: invitation.groomName,
          weddingDate: invitation.weddingDate,
          slug: invitation.slug,
        };
      }
    }

    // 6. Generate Unique Order Number
    const orderNumber = await generateOrderNumber();

    const targetStatus = status && ['draft', 'pending', 'confirmed'].includes(status) ? status : 'draft';
    const now = new Date();

    const orderData = {
      orderNumber,
      customerId: customer._id,
      customerSnapshot,
      themeId: theme._id,
      packageSnapshot,
      pricing: {
        subtotal,
        discount,
        tax,
        total,
        currency: 'INR',
      },
      status: targetStatus,
      paymentStatus: 'unpaid',
      invitationId: linkedInvitationId,
      invitationSnapshot,
      couponSnapshot: appliedCouponSnapshot,
      notes: notes ? String(notes).trim().slice(0, 1000) : '',
      source: source || 'admin_manual',
      confirmedAt: targetStatus === 'confirmed' ? now : null,
    };

    const order = await Order.create(orderData);

    if (couponToUpdate) {
      await Coupon.findByIdAndUpdate(couponToUpdate._id, { $inc: { usedCount: 1 } });
    }

    res.status(201).json({
      success: true,
      message: `Order ${order.orderNumber} created successfully as ${order.status}.`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing draft order (Admin)
 * PUT /api/orders/:id
 * Only drafts (or pending) orders can be modified.
 */
export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customerId, themeId, invitationId, notes, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'draft' && order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Orders in "${order.status}" status cannot have items or customer details altered.`,
      });
    }

    // Update customer if provided
    if (customerId && customerId !== order.customerId.toString()) {
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(400).json({ success: false, message: 'Invalid customer ID.' });
      }
      const customer = await User.findById(customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer record not found.' });
      }
      order.customerId = customer._id;
      order.customerSnapshot = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
      };
    }

    // Update theme if provided
    if (themeId && themeId !== order.themeId.toString()) {
      if (!mongoose.Types.ObjectId.isValid(themeId)) {
        return res.status(400).json({ success: false, message: 'Invalid theme ID.' });
      }
      const theme = await Theme.findById(themeId);
      if (!theme) {
        return res.status(404).json({ success: false, message: 'Theme record not found.' });
      }
      if (theme.isArchived || theme.status === 'archived' || !theme.isPublished) {
        return res.status(400).json({
          success: false,
          message: 'Selected theme is archived or inactive.',
        });
      }

      const basePrice = parseAuthoritativePrice(theme.priceDisplay);
      if (basePrice === null) {
        return res.status(400).json({
          success: false,
          message: 'The selected theme has an invalid or missing price configuration and cannot be ordered.',
        });
      }

      const parsedOffer = parseAuthoritativePrice(theme.offerPrice);
      const offerPrice = (parsedOffer !== null && parsedOffer > 0 && parsedOffer < basePrice) ? parsedOffer : 0;
      const effectivePrice = offerPrice > 0 ? offerPrice : basePrice;

      order.themeId = theme._id;
      order.packageSnapshot = {
        name: theme.name,
        slug: theme.slug,
        themeType: theme.themeType || 'website',
        supportedFormats: Array.isArray(theme.supportedFormats) ? theme.supportedFormats : ['Interactive Website'],
        coverImage: theme.coverImage || '',
        basePrice,
        offerPrice,
        packageType: theme.themeType === 'video' ? 'Video Only' : theme.themeType === 'website' ? 'Interactive Website' : 'Complete Wedding Suite',
      };
      order.pricing = {
        subtotal: effectivePrice,
        discount: 0,
        tax: 0,
        total: effectivePrice,
        currency: 'INR',
      };
    }

    // Update notes
    if (notes !== undefined) {
      order.notes = String(notes).trim().slice(0, 1000);
    }

    // Update invitation link if provided
    if (invitationId !== undefined) {
      if (invitationId && mongoose.Types.ObjectId.isValid(invitationId)) {
        const inv = await Invitation.findById(invitationId);
        if (inv) {
          order.invitationId = inv._id;
          order.invitationSnapshot = {
            brideName: inv.brideName,
            groomName: inv.groomName,
            weddingDate: inv.weddingDate,
            slug: inv.slug,
          };
        }
      } else {
        order.invitationId = null;
        order.invitationSnapshot = {};
      }
    }

    // Status transition if requested
    if (status && status !== order.status) {
      const allowed = ALLOWED_TRANSITIONS[order.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot transition order from "${order.status}" to "${status}". Allowed: ${allowed.join(', ') || 'none'}`,
        });
      }
      order.status = status;
      if (status === 'confirmed' && !order.confirmedAt) order.confirmedAt = new Date();
      if (status === 'completed' && !order.completedAt) order.completedAt = new Date();
      if (status === 'cancelled') {
        order.cancelledAt = new Date();
        if (order.paymentStatus === 'paid') order.paymentStatus = 'refunded';
      }
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order updated successfully.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Transition order lifecycle status (Admin)
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status transition. Cannot change order from "${order.status}" to "${status}". Allowed transitions: ${allowed.join(', ') || 'None (terminal state)'}.`,
      });
    }

    order.status = status;
    const now = new Date();

    if (status === 'confirmed') {
      order.confirmedAt = order.confirmedAt || now;
    } else if (status === 'completed') {
      order.completedAt = now;
    } else if (status === 'cancelled') {
      order.cancelledAt = now;
      if (order.paymentStatus === 'paid') {
        order.paymentStatus = 'refunded';
      }
    }

    if (notes) {
      order.notes = String(notes).trim().slice(0, 1000);
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status transitioned to "${status}" successfully.`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete order draft (Admin)
 * DELETE /api/orders/:id
 * Strictly allows deleting ONLY draft orders. Non-draft orders cannot be deleted.
 */
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: `Orders in "${order.status}" status cannot be deleted to preserve audit and transaction history. Please transition the order to "cancelled" instead.`,
      });
    }

    await Order.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Draft order deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer orders retrieval (Customer)
 * GET /api/orders/my-orders
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const orders = await Order.find({ customerId: userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch available customers for admin order creation (Admin)
 * GET /api/orders/customers/lookup
 */
export const getCustomersLookup = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { role: { $in: ['customer', 'user'] } };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const customers = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .select('name email phone createdAt');

    res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

