import mongoose from 'mongoose';
import { Coupon } from '../models/Coupon.js';

/**
 * Reusable helper to validate and compute discount amount for an order amount
 */
export const computeCouponDiscount = (coupon, subtotal) => {
  const now = new Date();

  if (!coupon.isActive) {
    return { valid: false, reason: 'This coupon is currently inactive.' };
  }

  if (coupon.validFrom && new Date(coupon.validFrom) > now) {
    return { valid: false, reason: 'This coupon is not active yet.' };
  }

  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    return { valid: false, reason: 'This coupon has expired.' };
  }

  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, reason: 'This coupon has reached its maximum usage limit.' };
  }

  const numSubtotal = Number(subtotal) || 0;
  if (coupon.minOrderAmount > 0 && numSubtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      reason: `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required to use this coupon.`,
    };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (numSubtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    // Fixed discount
    discountAmount = Math.min(numSubtotal, coupon.discountValue);
  }

  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    valid: true,
    discountAmount,
    coupon,
  };
};

/**
 * Validate a coupon code for an order (Public / Checkout)
 * POST /api/coupons/validate
 */
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount = 0 } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const cleanCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Coupon code "${cleanCode}" is invalid or does not exist.`,
      });
    }

    const result = computeCouponDiscount(coupon, orderAmount);
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.reason,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: result.discountAmount,
        minOrderAmount: coupon.minOrderAmount,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all coupons (Admin)
 * GET /api/admin/coupons
 */
export const getCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (search && typeof search === 'string') {
      const term = search.trim();
      filter.$or = [
        { code: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    const now = new Date();
    if (status === 'active') {
      filter.isActive = true;
      filter.$and = [
        { $or: [{ validUntil: null }, { validUntil: { $gte: now } }] },
        { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
      ];
    } else if (status === 'inactive') {
      filter.isActive = false;
    } else if (status === 'expired') {
      filter.validUntil = { $lt: now };
    }

    const [coupons, total, totalActive, totalExpired] = await Promise.all([
      Coupon.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Coupon.countDocuments(filter),
      Coupon.countDocuments({ isActive: true }),
      Coupon.countDocuments({ validUntil: { $lt: now } }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        coupons,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        stats: {
          totalActive,
          totalExpired,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new coupon (Admin)
 * POST /api/admin/coupons
 */
export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description = '',
      discountType = 'percentage',
      discountValue,
      minOrderAmount = 0,
      maxDiscountAmount = null,
      validFrom,
      validUntil,
      usageLimit = null,
      isActive = true,
      applicableThemes = [],
    } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const cleanCode = code.toUpperCase().trim();

    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: 'Discount type must be either "percentage" or "fixed".',
      });
    }

    const numDiscountValue = Number(discountValue);
    if (isNaN(numDiscountValue) || numDiscountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount value must be a positive number.',
      });
    }

    if (discountType === 'percentage' && numDiscountValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%.',
      });
    }

    // Check code uniqueness
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Coupon code "${cleanCode}" already exists.`,
      });
    }

    // Validate date logic
    const startDate = validFrom ? new Date(validFrom) : new Date();
    const endDate = validUntil ? new Date(validUntil) : null;
    if (endDate && endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: 'Expiration date (validUntil) cannot be earlier than start date (validFrom).',
      });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      description: description.trim(),
      discountType,
      discountValue: numDiscountValue,
      minOrderAmount: Math.max(0, Number(minOrderAmount) || 0),
      maxDiscountAmount: maxDiscountAmount ? Math.max(0, Number(maxDiscountAmount)) : null,
      validFrom: startDate,
      validUntil: endDate,
      usageLimit: usageLimit ? Math.max(1, parseInt(usageLimit, 10)) : null,
      isActive: Boolean(isActive),
      applicableThemes: Array.isArray(applicableThemes) ? applicableThemes : [],
    });

    return res.status(201).json({
      success: true,
      message: `Coupon "${coupon.code}" created successfully.`,
      data: coupon,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing coupon (Admin)
 * PUT /api/admin/coupons/:id
 */
export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid coupon ID format.' });
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      isActive,
    } = req.body;

    if (code && typeof code === 'string') {
      const cleanCode = code.toUpperCase().trim();
      if (cleanCode !== coupon.code) {
        const conflict = await Coupon.findOne({ code: cleanCode });
        if (conflict) {
          return res.status(409).json({
            success: false,
            message: `Coupon code "${cleanCode}" already exists.`,
          });
        }
        coupon.code = cleanCode;
      }
    }

    if (description !== undefined) coupon.description = String(description).trim();
    if (discountType !== undefined) {
      if (!['percentage', 'fixed'].includes(discountType)) {
        return res.status(400).json({
          success: false,
          message: 'Discount type must be either "percentage" or "fixed".',
        });
      }
      coupon.discountType = discountType;
    }

    if (discountValue !== undefined) {
      const numVal = Number(discountValue);
      if (isNaN(numVal) || numVal <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Discount value must be a positive number.',
        });
      }
      if (coupon.discountType === 'percentage' && numVal > 100) {
        return res.status(400).json({
          success: false,
          message: 'Percentage discount cannot exceed 100%.',
        });
      }
      coupon.discountValue = numVal;
    }

    if (minOrderAmount !== undefined) {
      coupon.minOrderAmount = Math.max(0, Number(minOrderAmount) || 0);
    }

    if (maxDiscountAmount !== undefined) {
      coupon.maxDiscountAmount = maxDiscountAmount ? Math.max(0, Number(maxDiscountAmount)) : null;
    }

    if (validFrom !== undefined) coupon.validFrom = validFrom ? new Date(validFrom) : coupon.validFrom;
    if (validUntil !== undefined) coupon.validUntil = validUntil ? new Date(validUntil) : null;
    if (usageLimit !== undefined) {
      coupon.usageLimit = usageLimit ? Math.max(1, parseInt(usageLimit, 10)) : null;
    }
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" updated successfully.`,
      data: coupon,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle coupon active status (Admin)
 * PATCH /api/admin/coupons/:id/toggle
 */
export const toggleCouponStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid coupon ID format.' });
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" is now ${coupon.isActive ? 'active' : 'inactive'}.`,
      data: coupon,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a coupon (Admin)
 * DELETE /api/admin/coupons/:id
 */
export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid coupon ID format.' });
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    await Coupon.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

