import mongoose from 'mongoose';
import { Theme } from '../models/Theme.js';
import { defaultThemes } from '../constants/mockData.js';

/**
 * Helper to resolve themes from database or default themes fallback
 * Calculates subtotal based on trusted database/server pricing
 */
export const resolveThemes = async (themeIds) => {
  if (!Array.isArray(themeIds) || themeIds.length === 0) {
    return { items: [], subtotal: 0 };
  }

  // Deduplicate IDs
  const uniqueIds = [...new Set(themeIds.filter(Boolean))];

  const validObjectIds = uniqueIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  // Query database for matching themes
  let dbThemes = [];
  try {
    dbThemes = await Theme.find({
      $or: [
        { slug: { $in: uniqueIds } },
        { _id: { $in: validObjectIds } },
      ],
      isPublished: true,
    });
  } catch (err) {
    console.warn('[Cart] Error querying database themes:', err.message);
  }

  // Resolve matching items preserving catalog data
  const resolvedItems = [];
  const foundIdentifiers = new Set();

  dbThemes.forEach((t) => {
    resolvedItems.push(t);
    foundIdentifiers.add(t.slug);
    foundIdentifiers.add(t._id.toString());
  });

  // Check fallback defaultThemes for any missing themes
  uniqueIds.forEach((id) => {
    if (!foundIdentifiers.has(id)) {
      const fallback = defaultThemes.find(
        (dt) => dt.slug === id || dt.id === id
      );
      if (fallback) {
        resolvedItems.push(fallback);
        foundIdentifiers.add(id);
      }
    }
  });

  // Calculate subtotal from trusted server pricing
  const subtotal = resolvedItems.reduce(
    (sum, item) => sum + (Number(item.priceDisplay) || 0),
    0
  );

  return { items: resolvedItems, subtotal };
};

/**
 * GET /api/cart
 * Fetches cart items with trusted pricing and calculated subtotal
 * Supports authenticated user cart or guest items via query parameter
 */
export const getCart = async (req, res, next) => {
  try {
    let themeIds = [];

    if (req.user) {
      themeIds = (req.user.cart || []).map((c) => c.themeId);
    } else if (req.query.items) {
      themeIds = req.query.items.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const { items, subtotal } = await resolveThemes(themeIds);

    res.json({
      success: true,
      count: items.length,
      items,
      subtotal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart/items
 * Adds a theme to the authenticated user's cart (prevents duplicates)
 */
export const addToCart = async (req, res, next) => {
  try {
    const { themeId } = req.body;
    if (!themeId || typeof themeId !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid themeId is required.' });
    }

    if (!req.user.cart) {
      req.user.cart = [];
    }

    // Prevent duplicate copies
    const alreadyExists = req.user.cart.some((c) => c.themeId === themeId);
    if (!alreadyExists) {
      req.user.cart.push({ themeId, addedAt: new Date() });
      await req.user.save();
    }

    const themeIds = req.user.cart.map((c) => c.themeId);
    const { items, subtotal } = await resolveThemes(themeIds);

    res.status(200).json({
      success: true,
      message: 'Theme added to cart.',
      count: items.length,
      items,
      subtotal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart/items/:themeId
 * Removes a theme from the authenticated user's cart
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { themeId } = req.params;

    if (!req.user.cart) {
      req.user.cart = [];
    }

    req.user.cart = req.user.cart.filter((c) => c.themeId !== themeId);
    await req.user.save();

    const themeIds = req.user.cart.map((c) => c.themeId);
    const { items, subtotal } = await resolveThemes(themeIds);

    res.json({
      success: true,
      message: 'Theme removed from cart.',
      count: items.length,
      items,
      subtotal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart/sync
 * Merges guest cart theme IDs into the authenticated user's cart
 */
export const syncCart = async (req, res, next) => {
  try {
    const { themeIds } = req.body;

    if (!Array.isArray(themeIds)) {
      return res.status(400).json({ success: false, message: 'themeIds array is required.' });
    }

    if (!req.user.cart) {
      req.user.cart = [];
    }

    const currentIds = new Set(req.user.cart.map((c) => c.themeId));

    themeIds.forEach((id) => {
      if (id && typeof id === 'string' && !currentIds.has(id)) {
        req.user.cart.push({ themeId: id, addedAt: new Date() });
        currentIds.add(id);
      }
    });

    await req.user.save();

    const allIds = req.user.cart.map((c) => c.themeId);
    const { items, subtotal } = await resolveThemes(allIds);

    res.json({
      success: true,
      message: 'Cart synchronized successfully.',
      count: items.length,
      items,
      subtotal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart
 * Clears the user's cart
 */
export const clearCart = async (req, res, next) => {
  try {
    req.user.cart = [];
    await req.user.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully.',
      count: 0,
      items: [],
      subtotal: 0,
    });
  } catch (error) {
    next(error);
  }
};
