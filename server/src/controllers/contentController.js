import { SiteContent } from '../models/SiteContent.js';

import { defaultSiteContent } from '../../../shared/constants/mockData.js';
export { defaultSiteContent };

// In-memory fallback
const memoryContent = new Map(Object.entries(defaultSiteContent));

export const getContentBySection = async (req, res, next) => {
  try {
    const { section } = req.params;
    let content = null;

    try {
      content = await SiteContent.findOne({ section: section.toLowerCase() });
    } catch (err) {
      // ignore
    }

    if (!content) {
      const fallback = memoryContent.get(section.toLowerCase()) || defaultSiteContent[section.toLowerCase()];
      if (fallback) {
        return res.json({ success: true, data: fallback });
      }
      return res.status(404).json({ success: false, message: 'Content section not found.' });
    }

    res.json({ success: true, data: content.data });
  } catch (error) {
    next(error);
  }
};

export const updateContentBySection = async (req, res, next) => {
  try {
    const { section } = req.params;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ success: false, message: 'Data is required.' });
    }

    let updated = null;
    try {
      updated = await SiteContent.findOneAndUpdate(
        { section: section.toLowerCase() },
        { data },
        { new: true, upsert: true }
      );
    } catch (dbErr) {
      console.warn('[ContentController] DB unavailable, updating memory content.');
    }

    memoryContent.set(section.toLowerCase(), data);

    res.json({
      success: true,
      message: `Section "${section}" updated successfully.`,
      data: updated ? updated.data : data,
    });
  } catch (error) {
    next(error);
  }
};
