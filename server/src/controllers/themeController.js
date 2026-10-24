import { Theme } from '../models/Theme.js';

import { defaultThemes } from '../../../shared/constants/mockData.js';
export { defaultThemes };

export const getThemes = async (req, res, next) => {
  try {
    const { category, search, format, all } = req.query;
    let query = {};

    if (!all || all !== 'true') {
      query.isPublished = true;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (format && format !== 'All') {
      query.supportedFormats = format;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    let themes = [];
    try {
      themes = await Theme.find(query).sort({ createdAt: -1 });
    } catch (dbError) {
      // Fallback to defaultThemes if DB is not populated
      console.warn('[ThemeController] Falling back to curated default themes.');
    }

    if (!themes || themes.length === 0) {
      let filtered = [...defaultThemes];
      if (category && category !== 'All') {
        filtered = filtered.filter((t) => t.category.toLowerCase() === category.toLowerCase());
      }
      if (format && format !== 'All') {
        filtered = filtered.filter((t) => t.supportedFormats.includes(format));
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter((t) => t.name.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
      }
      return res.json({ success: true, count: filtered.length, data: filtered });
    }

    res.json({ success: true, count: themes.length, data: themes });
  } catch (error) {
    next(error);
  }
};

export const getThemeBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let theme = null;

    try {
      theme = await Theme.findOne({ slug: slug.toLowerCase() });
    } catch (err) {
      // ignore db error, check fallback
    }

    if (!theme) {
      theme = defaultThemes.find((t) => t.slug === slug.toLowerCase());
    }

    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found.' });
    }

    res.json({ success: true, data: theme });
  } catch (error) {
    next(error);
  }
};

export const createTheme = async (req, res, next) => {
  try {
    const { name, slug, description, category, coverImage, priceDisplay, features, tags, supportedFormats, colorPalette } = req.body;
    
    if (!name || !coverImage) {
      return res.status(400).json({ success: false, message: 'Theme name and cover image are required.' });
    }

    const generatedSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') : name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const theme = await Theme.create({
      name,
      slug: generatedSlug,
      description,
      category: category || 'Royal',
      coverImage,
      priceDisplay: Number(priceDisplay) || 0,
      features: Array.isArray(features) ? features : [],
      tags: Array.isArray(tags) ? tags : [],
      supportedFormats: Array.isArray(supportedFormats) ? supportedFormats : ['Interactive Website'],
      colorPalette: colorPalette || { primary: '#5C061D', secondary: '#D4AF37', accent: '#FAF7F2', background: '#FFFDF9' },
      isPublished: true,
    });

    res.status(201).json({ success: true, message: 'Theme created successfully.', data: theme });
  } catch (error) {
    next(error);
  }
};

export const updateTheme = async (req, res, next) => {
  try {
    const { id } = req.params;
    const theme = await Theme.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found.' });
    }

    res.json({ success: true, message: 'Theme updated successfully.', data: theme });
  } catch (error) {
    next(error);
  }
};

export const togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const theme = await Theme.findById(id);

    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found.' });
    }

    theme.isPublished = !theme.isPublished;
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
