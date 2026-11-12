import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Invitation } from '../models/Invitation.js';

/**
 * List registered customers with search, pagination, and order/invitation aggregates (Admin)
 * GET /api/admin/customers
 */
export const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const query = { role: { $in: ['customer', 'user'] } };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const [customers, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    // Populate order count and total spent for each customer
    const customerIds = customers.map((c) => c._id);

    const [orderAggregates, invitationCounts] = await Promise.all([
      Order.aggregate([
        { $match: { customerId: { $in: customerIds } } },
        {
          $group: {
            _id: '$customerId',
            totalOrders: { $sum: 1 },
            totalSpent: {
              $sum: {
                $cond: [{ $in: ['$status', ['confirmed', 'processing', 'completed']] }, '$pricing.total', 0],
              },
            },
          },
        },
      ]),
      Invitation.aggregate([
        { $match: { userId: { $in: customerIds } } },
        { $group: { _id: '$userId', totalInvitations: { $sum: 1 } } },
      ]),
    ]);

    const orderMap = {};
    orderAggregates.forEach((oa) => {
      orderMap[oa._id.toString()] = oa;
    });

    const invMap = {};
    invitationCounts.forEach((ic) => {
      invMap[ic._id.toString()] = ic.totalInvitations;
    });

    const enrichedCustomers = customers.map((c) => {
      const idStr = c._id.toString();
      const ordInfo = orderMap[idStr] || { totalOrders: 0, totalSpent: 0 };
      const invCount = invMap[idStr] || 0;
      return {
        ...c,
        ordersCount: ordInfo.totalOrders,
        totalSpent: ordInfo.totalSpent,
        invitationsCount: invCount,
      };
    });

    res.json({
      success: true,
      data: {
        customers: enrichedCustomers,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      customers: enrichedCustomers,
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
 * Fetch detailed customer profile with order history and invitations (Admin)
 * GET /api/admin/customers/:id
 */
export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid customer ID format.' });
    }

    const customer = await User.findById(id).select('-password').lean();
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const [orders, invitations] = await Promise.all([
      Order.find({ customerId: customer._id })
        .sort({ createdAt: -1 })
        .select('orderNumber packageSnapshot pricing status createdAt')
        .lean(),
      Invitation.find({ userId: customer._id })
        .sort({ createdAt: -1 })
        .select('slug brideName groomName weddingDate status themeSlug createdAt')
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        ...customer,
        customer,
        orders,
        invitations,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Safe customer profile update (Admin)
 * PUT /api/admin/customers/:id
 * Strictly prevents privilege escalation and password tampering.
 */
export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid customer ID format.' });
    }

    // Privilege escalation prevention
    if (role && role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Security violation: Customers cannot be promoted to admin via customer management.',
      });
    }

    const customer = await User.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (name && typeof name === 'string' && name.trim()) {
      customer.name = name.trim();
    }

    await customer.save();

    const sanitized = customer.toJSON();
    res.json({
      success: true,
      message: 'Customer profile updated successfully.',
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

