import { Category } from '../models/Category.js';
import { Theme } from '../models/Theme.js';

export const DEFAULT_CATEGORIES = [
  { name: 'Royal', description: 'Regal palaces, gold foil motifs, and majestic heritage designs', displayOrder: 1 },
  { name: 'Traditional', description: 'Time-honored Vedic rituals, mandap arches, and cultural heritage', displayOrder: 2 },
  { name: 'Floral', description: 'Romantic blossoms, delicate pastel roses, and botanical elegance', displayOrder: 3 },
  { name: 'Minimal', description: 'Clean modern lines, subtle typography, and contemporary sophistication', displayOrder: 4 },
  { name: 'Modern', description: 'Sleek luxury aesthetics, animated elements, and chic wedding styling', displayOrder: 5 },
  { name: 'Cartoon', description: 'Playful illustrated caricatures, cute animations, and joyous wedding humor', displayOrder: 6 },
  { name: 'Destination', description: 'Palace lakes, coastal beaches, and destination celebration vibes', displayOrder: 7 },
  { name: 'Regional', description: 'Authentic regional ceremonies (Punjabi, South Indian, Marwari, Bengali)', displayOrder: 8 },
];

/**
 * Seed default categories if collection is currently empty
 */
export const seedDefaultCategoriesIfNeeded = async () => {
  try {
    const count = await Category.countDocuments({});
    if (count === 0) {
      const docs = DEFAULT_CATEGORIES.map((c) => ({
        name: c.name,
        slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: c.description,
        displayOrder: c.displayOrder,
        isActive: true,
      }));
      await Category.insertMany(docs);
      console.log('[Category] Seeded 8 default wedding categories into MongoDB.');
    }
  } catch (err) {
    console.warn('[Category] Default seeding notice:', err.message);
  }
};

/**
 * GET /api/categories
 * Public endpoint to list all active categories along with assigned theme counts
 */
export const getCategories = async (req, res, next) => {
  try {
    await seedDefaultCategoriesIfNeeded();

    const includeAll = req.query.all === 'true' || (req.user && req.user.role === 'admin');
    const filter = includeAll ? {} : { isActive: true };

    const categories = await Category.find(filter).sort({ displayOrder: 1, name: 1 }).lean();

    // Aggregate theme counts per category
    const themeCounts = await Theme.aggregate([
      { $match: { isArchived: { $ne: true } } },
      { $group: { _id: '$category', total: { $sum: 1 } } },
    ]);

    const countMap = {};
    themeCounts.forEach((tc) => {
      if (tc._id) countMap[tc._id.toLowerCase()] = tc.total;
    });

    const result = categories.map((cat) => ({
      ...cat,
      themeCount: countMap[cat.name.toLowerCase()] || 0,
    }));

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/categories
 * Admin-protected: Create a new category
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description = '', displayOrder = 0, isActive = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const cleanName = name.trim();
    const cleanSlug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check for existing category with same name or slug
    const existing = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
        { slug: cleanSlug },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A category named "${cleanName}" already exists.`,
      });
    }

    const newCategory = await Category.create({
      name: cleanName,
      slug: cleanSlug,
      description: description.trim(),
      displayOrder: Number(displayOrder) || 0,
      isActive: Boolean(isActive),
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: {
        ...newCategory.toObject(),
        themeCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/categories/:id
 * Admin-protected: Update an existing category
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, displayOrder, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    const oldName = category.name;

    if (name && name.trim() && name.trim().toLowerCase() !== oldName.toLowerCase()) {
      const cleanName = name.trim();
      const existing = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${cleanName}$`, 'i') },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Another category named "${cleanName}" already exists.`,
        });
      }
      category.name = cleanName;
      category.slug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Sync existing themes to new category name
      await Theme.updateMany({ category: oldName }, { $set: { category: cleanName } });
    }

    if (description !== undefined) category.description = String(description).trim();
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder) || 0;
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    // Get current theme count
    const themeCount = await Theme.countDocuments({ category: category.name, isArchived: { $ne: true } });

    return res.json({
      success: true,
      message: 'Category updated successfully.',
      data: {
        ...category.toObject(),
        themeCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/categories/:id
 * Admin-protected: Delete category with safe integrity guard
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // Safety guard: Check if themes are currently assigned to this category
    const assignedThemesCount = await Theme.countDocuments({
      category: category.name,
      isArchived: { $ne: true },
    });

    if (assignedThemesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because ${assignedThemesCount} theme(s) are currently assigned to it. Please reassign or delete those themes first.`,
      });
    }

    await Category.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: `Category "${category.name}" deleted successfully.`,
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

