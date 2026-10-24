import { Theme } from '../models/Theme.js';

// Curated Indian Royal & Traditional Themes
export const defaultThemes = [
  {
    id: 'theme-1',
    name: 'Royal Udaipur Palace',
    slug: 'royal-udaipur-palace',
    category: 'Royal',
    description: 'Inspired by the regal heritage of Lake Pichola palace courtyards with deep burgundy velvet tones, gold leaf motifs, and royal arches.',
    coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
    ],
    supportedFormats: ['Interactive Website', 'Video Invitation'],
    priceDisplay: 2499,
    tags: ['Royal', 'Burgundy', 'Palace', 'Trending'],
    features: ['3D Envelope Unwrapping', 'Staggered Typography Reveal', 'Multi-day Ceremony Itinerary', 'Interactive Cards', 'Auspicious Live Countdown'],
    isPublished: true,
    colorPalette: {
      primary: '#5C061D',
      secondary: '#D4AF37',
      accent: '#FAF7F2',
      background: '#FFFDF9',
    },
  },
  {
    id: 'theme-2',
    name: 'Vedic Marigold Heritage',
    slug: 'vedic-marigold-heritage',
    category: 'Traditional',
    description: 'An auspicious celebration adorned with vibrant marigold garlands, sacred brass kalash, temple bells, and Sanskrit invocations.',
    coverImage: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
    ],
    supportedFormats: ['Interactive Website'],
    priceDisplay: 1999,
    tags: ['Traditional', 'Marigold', 'Vedic', 'Mandap'],
    features: ['3D Wax Seal Animation', 'Ceremony Timeline with Icons', 'Photo Gallery', 'Google Maps Directions'],
    isPublished: true,
    colorPalette: {
      primary: '#B85805',
      secondary: '#E67A15',
      accent: '#FAF7F2',
      background: '#FFFDF9',
    },
  },
  {
    id: 'theme-3',
    name: 'Gulmohar Pastel Romance',
    slug: 'gulmohar-pastel-romance',
    category: 'Floral',
    description: 'Soft blush pinks and mint accents interwoven with hand-drawn botanical blossoms for the modern fairytale Indian wedding.',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    ],
    supportedFormats: ['Interactive Website', 'Video Invitation'],
    priceDisplay: 2199,
    tags: ['Floral', 'Pastel', 'Blush', 'Romantic'],
    features: ['Gentle Petal Fall Animation', 'Interactive Vows Card', 'Real-time RSVP Countdown', 'High-Res Photo Reel'],
    isPublished: true,
    colorPalette: {
      primary: '#8E3E53',
      secondary: '#D4AF37',
      accent: '#FDF2F4',
      background: '#FFFDF9',
    },
  },
  {
    id: 'theme-4',
    name: 'Jaipur Jharokha Gold',
    slug: 'jaipur-jharokha-gold',
    category: 'Royal',
    description: 'Intricate architectural archways of the Pink City gilded in royal gold leafing, Diya illuminations, and regal peacock aesthetics.',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    ],
    supportedFormats: ['Interactive Website'],
    priceDisplay: 2799,
    tags: ['Jaipur', 'Jharokha', 'Gold Leaf', 'Architectural'],
    features: ['3D Envelope Opening', 'Staggered Royal Reveal', 'Multi-day Itinerary', 'Interactive Dress Code Guide'],
    isPublished: true,
    colorPalette: {
      primary: '#6B1226',
      secondary: '#C79E26',
      accent: '#FAF4DC',
      background: '#FFFDF9',
    },
  },
  {
    id: 'theme-5',
    name: 'Ivory Simplicity & Serenity',
    slug: 'ivory-simplicity-serenity',
    category: 'Minimal',
    description: 'Minimalist luxury focusing on refined typography, subtle gold foil embossed lines, and generous serene breathing room.',
    coverImage: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=1200&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=1200&q=80',
    ],
    supportedFormats: ['Interactive Website'],
    priceDisplay: 1799,
    tags: ['Minimal', 'Ivory', 'Modern', 'Clean'],
    features: ['Minimalist Card Unfold', 'Clean Event Schedule', 'Couple Story', 'Countdown Timer'],
    isPublished: true,
    colorPalette: {
      primary: '#2A1810',
      secondary: '#D4AF37',
      accent: '#FAF7F2',
      background: '#FFFFFF',
    },
  },
  {
    id: 'theme-6',
    name: 'Goa Coastal Sundowner',
    slug: 'goa-coastal-sundowner',
    category: 'Destination',
    description: 'Sunset beach vibes with turquoise waves, golden sand accents, tropical palm fronds, and breezy sundowner party styling.',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
    supportedFormats: ['Interactive Website', 'Video Invitation'],
    priceDisplay: 2399,
    tags: ['Destination', 'Beach', 'Sundowner', 'Goa'],
    features: ['Seaside Aesthetic', 'Party Itinerary with Map Pin', 'Dress Code Palette', 'RSVP Countdown'],
    isPublished: true,
    colorPalette: {
      primary: '#0B4F6C',
      secondary: '#D4AF37',
      accent: '#EBF4F6',
      background: '#FFFDF9',
    },
  },
];

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
