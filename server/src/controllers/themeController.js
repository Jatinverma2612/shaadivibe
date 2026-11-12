import mongoose from 'mongoose';
import { Theme } from '../models/Theme.js';
import { Invitation } from '../models/Invitation.js';
import { defaultThemes } from '../constants/mockData.js';
export { defaultThemes };

/**
 * Get themes with rich filtering, search, sorting, and format tabs
 * GET /api/themes
 */
export const getThemes = async (req, res, next) => {
  try {
    const { category, search, format, themeType, status, sort, all } = req.query;
    let query = {};

    const isAdmin = Boolean(req.user && req.user.role === 'admin');

    if (!isAdmin) {
      // Public visitors MUST ONLY retrieve active, published themes.
      // Query parameters like ?status=draft or ?all=true are strictly ignored for non-admins.
      query.isPublished = true;
      query.status = { $ne: 'archived' };
    } else {
      // Admin requests: support explicit status filtering and full inventory visibility
      if (status && status !== 'All') {
        if (status === 'active' || status === 'published') {
          query.isPublished = true;
          query.status = { $ne: 'archived' };
        } else if (status === 'draft' || status === 'inactive') {
          query.isPublished = false;
          query.status = { $ne: 'archived' };
        } else if (status === 'archived') {
          query.status = 'archived';
        }
      } else if (all !== 'true') {
        // By default, if admin does not specify ?all=true or a specific status filter, show active published themes
        query.isPublished = true;
        query.status = { $ne: 'archived' };
      }
      // When admin passes ?all=true without a status filter, show all themes (including drafts & archived)
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Format filter
    if (format && format !== 'All') {
      query.supportedFormats = format;
    }

    // Theme Type tabs (All / Video Themes / Website Themes)
    if (themeType && themeType !== 'All') {
      if (themeType === 'video') {
        query.$or = [
          { themeType: 'video' },
          { themeType: 'both' },
          { supportedFormats: 'Video Invitation' },
        ];
      } else if (themeType === 'website') {
        query.$or = [
          { themeType: 'website' },
          { themeType: 'both' },
          { supportedFormats: 'Interactive Website' },
        ];
      }
    }

    // Text search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchConditions = [
        { name: searchRegex },
        { slug: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') {
      sortOption = { priceDisplay: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { priceDisplay: -1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    } else if (sort === 'featured') {
      sortOption = { isFeatured: -1, displayOrder: 1, createdAt: -1 };
    }

    const themes = await Theme.find(query).sort(sortOption);
    res.json({ success: true, count: themes.length, data: themes });
  } catch (error) {
    next(error);
  }
};

/**
 * Get theme by unique slug or ID
 * GET /api/themes/:slug
 */
export const getThemeBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slug.toLowerCase().trim();
    const isAdmin = Boolean(req.user && req.user.role === 'admin');

    const query = mongoose.Types.ObjectId.isValid(cleanSlug)
      ? { $or: [{ slug: cleanSlug }, { _id: cleanSlug }] }
      : { slug: cleanSlug };

    let theme = await Theme.findOne(query);

    // Fallback to default catalog themes if not yet written to Mongo Atlas
    if (!theme) {
      const fallback = defaultThemes.find((t) => t.slug === cleanSlug);
      if (fallback) {
        if (!fallback.isPublished && !isAdmin) {
          return res.status(404).json({ success: false, message: 'Theme not found.' });
        }
        return res.json({ success: true, data: fallback });
      }
      return res.status(404).json({ success: false, message: 'Theme not found.' });
    }

    // Unauthenticated or non-admin visitors cannot view unpublished, draft, or archived themes
    if ((!theme.isPublished || theme.status === 'archived') && !isAdmin) {
      return res.status(404).json({ success: false, message: 'Theme not found.' });
    }

    res.json({ success: true, data: theme });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new theme (Admin)
 * POST /api/themes
 */
export const createTheme = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      category,
      coverImage,
      previewImages,
      priceDisplay,
      offerPrice,
      features,
      tags,
      supportedFormats,
      themeType,
      videoUrl,
      videoDuration,
      templateFile,
      customizationFields,
      isFeatured,
      displayOrder,
      hostingDurationMonths,
      maxFunctions,
      seoTitle,
      seoDescription,
      languages,
      status,
      isPublished,
      colorPalette,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Theme name is required.' });
    }

    if (!coverImage || !coverImage.trim()) {
      return res.status(400).json({ success: false, message: 'Theme cover image thumbnail is required.' });
    }

    // Format & validate slug
    const cleanSlug = slug
      ? slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-')
      : name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');

    const existingTheme = await Theme.findOne({ slug: cleanSlug });
    if (existingTheme) {
      return res.status(400).json({
        success: false,
        message: 'A theme with this slug already exists. Please choose a unique slug.',
      });
    }

    // Determine publication status
    let publishedState = true;
    if (isPublished !== undefined) {
      publishedState = Boolean(isPublished);
    } else if (status === 'draft' || status === 'inactive') {
      publishedState = false;
    }

    // Supported formats calculation
    let formats = Array.isArray(supportedFormats) ? [...supportedFormats] : [];
    if (formats.length === 0) {
      if (themeType === 'video') {
        formats = ['Video Invitation'];
      } else if (themeType === 'both') {
        formats = ['Interactive Website', 'Video Invitation'];
      } else {
        formats = ['Interactive Website'];
      }
    }

    const themeData = {
      name: name.trim(),
      slug: cleanSlug,
      description: description || '',
      category: category || 'Royal',
      coverImage: coverImage.trim(),
      previewImages: Array.isArray(previewImages) ? previewImages : [],
      supportedFormats: formats,
      priceDisplay: Math.max(0, Number(priceDisplay) || 0),
      offerPrice: Math.max(0, Number(offerPrice) || 0),
      features: Array.isArray(features) ? features : [],
      tags: Array.isArray(tags) ? tags : [],
      themeType: themeType || (formats.includes('Video Invitation') && formats.includes('Interactive Website') ? 'both' : formats.includes('Video Invitation') ? 'video' : 'website'),
      videoUrl: videoUrl || '',
      videoDuration: videoDuration || '00:30',
      templateFile: templateFile || { url: '', filename: '', size: 0, uploadedAt: new Date() },
      customizationFields: Array.isArray(customizationFields) ? customizationFields : [],
      isFeatured: Boolean(isFeatured),
      displayOrder: Number(displayOrder) || 0,
      hostingDurationMonths: Number(hostingDurationMonths) || 12,
      maxFunctions: Number(maxFunctions) || 5,
      seoTitle: seoTitle || `${name.trim()} Wedding Invitation | ShaadiVibe`,
      seoDescription: seoDescription || description || '',
      languages: Array.isArray(languages) && languages.length > 0 ? languages : ['English'],
      status: publishedState ? 'active' : 'draft',
      isPublished: publishedState,
      colorPalette: colorPalette || {
        primary: '#5C061D',
        secondary: '#D4AF37',
        accent: '#FAF7F2',
        background: '#FFFDF9',
      },
    };

    const theme = await Theme.create(themeData);
    res.status(201).json({
      success: true,
      message: 'Theme created successfully.',
      data: theme,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update theme (Admin)
 * PUT /api/themes/:id
 */
export const updateTheme = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid theme ID format.' });
    }

    // Check slug uniqueness if slug is being updated
    if (req.body.slug) {
      const cleanSlug = req.body.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
      const conflict = await Theme.findOne({ slug: cleanSlug, _id: { $ne: id } });
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Another theme is already using this slug. Please select a unique slug.',
        });
      }
      req.body.slug = cleanSlug;
    }

    // Synchronize isPublished with status if status was modified
    if (req.body.status) {
      if (req.body.status === 'active') {
        req.body.isPublished = true;
      } else if (req.body.status === 'draft' || req.body.status === 'inactive') {
        req.body.isPublished = false;
      }
    } else if (req.body.isPublished !== undefined) {
      req.body.status = req.body.isPublished ? 'active' : 'draft';
    }

    if (req.body.priceDisplay !== undefined) {
      req.body.priceDisplay = Math.max(0, Number(req.body.priceDisplay) || 0);
    }
    if (req.body.offerPrice !== undefined) {
      req.body.offerPrice = Math.max(0, Number(req.body.offerPrice) || 0);
    }

    const theme = await Theme.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found.' });
    }

    res.json({
      success: true,
      message: 'Theme updated successfully.',
      data: theme,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete theme (Admin)
 * DELETE /api/themes/:id
 * Safeguard: If existing invitations reference this theme (by themeId or themeSlug),
 * archive and unpublish the theme rather than hard deleting to preserve historical data.
 * Files in server/uploads/ are preserved.
 */
export const deleteTheme = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid theme ID format.' });
    }

    const theme = await Theme.findById(id);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found.' });
    }

    // Check if any invitations reference this theme
    const isReferenced = await Invitation.exists({
      $or: [{ themeId: theme._id }, { themeSlug: theme.slug }],
    });

    if (isReferenced) {
      theme.isPublished = false;
      theme.status = 'archived';
      theme.isArchived = true;
      theme.archivedAt = new Date();
      await theme.save();

      return res.json({
        success: true,
        message: 'Theme is referenced by existing invitations. It has been safely archived and unpublished rather than deleted.',
        archived: true,
        data: theme,
      });
    }

    // Unreferenced themes can be safely hard-deleted from the database
    await Theme.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Theme deleted successfully.',
      archived: false,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle theme publish status (Admin)
 * PATCH /api/themes/:id/publish
 */
export const togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid theme ID format.' });
    }

    const theme = await Theme.findById(id);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found.' });
    }

    theme.isPublished = !theme.isPublished;
    theme.status = theme.isPublished ? 'active' : 'inactive';
    if (theme.isPublished) {
      theme.isArchived = false;
      theme.archivedAt = null;
    }
    await theme.save();

    res.json({
      success: true,
      message: `Theme ${theme.isPublished ? 'published' : 'unpublished'} successfully.`,
      data: theme,
    });
  } catch (error) {
    next(error);
  }
};
