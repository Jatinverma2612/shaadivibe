import { resolveThemes } from './cartController.js';

/**
 * GET /api/wishlist
 * Returns wishlisted themes populated with trusted catalog data
 */
export const getWishlist = async (req, res, next) => {
  try {
    let themeIds = [];

    if (req.user) {
      themeIds = req.user.wishlist || [];
    } else if (req.query.items) {
      themeIds = req.query.items.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const { items } = await resolveThemes(themeIds);

    res.json({
      success: true,
      count: items.length,
      items,
      wishlist: themeIds,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/wishlist/toggle
 * Toggles a theme into or out of the authenticated user's wishlist
 */
export const toggleWishlist = async (req, res, next) => {
  try {
    const { themeId } = req.body;
    if (!themeId || typeof themeId !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid themeId is required.' });
    }

    if (!req.user.wishlist) {
      req.user.wishlist = [];
    }

    const index = req.user.wishlist.indexOf(themeId);
    let wishlisted = false;

    if (index > -1) {
      req.user.wishlist.splice(index, 1);
      wishlisted = false;
    } else {
      req.user.wishlist.push(themeId);
      wishlisted = true;
    }

    await req.user.save();

    res.json({
      success: true,
      wishlisted,
      message: wishlisted ? 'Added to wishlist.' : 'Removed from wishlist.',
      count: req.user.wishlist.length,
      wishlist: req.user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/wishlist/items/:themeId
 * Removes a theme from the user's wishlist
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { themeId } = req.params;

    if (!req.user.wishlist) {
      req.user.wishlist = [];
    }

    req.user.wishlist = req.user.wishlist.filter((id) => id !== themeId);
    await req.user.save();

    res.json({
      success: true,
      message: 'Theme removed from wishlist.',
      count: req.user.wishlist.length,
      wishlist: req.user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/wishlist/sync
 * Merges guest wishlist theme IDs into authenticated user's wishlist
 */
export const syncWishlist = async (req, res, next) => {
  try {
    const { themeIds } = req.body;

    if (!Array.isArray(themeIds)) {
      return res.status(400).json({ success: false, message: 'themeIds array is required.' });
    }

    if (!req.user.wishlist) {
      req.user.wishlist = [];
    }

    const currentSet = new Set(req.user.wishlist);

    themeIds.forEach((id) => {
      if (id && typeof id === 'string') {
        currentSet.add(id);
      }
    });

    req.user.wishlist = [...currentSet];
    await req.user.save();

    const { items } = await resolveThemes(req.user.wishlist);

    res.json({
      success: true,
      message: 'Wishlist synchronized successfully.',
      count: items.length,
      items,
      wishlist: req.user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};
