import { SiteContent } from '../models/SiteContent.js';
import { defaultSiteContent } from '../constants/mockData.js';
export { defaultSiteContent };

export const getContentBySection = async (req, res, next) => {
  try {
    const { section } = req.params;
    const cleanSection = section.toLowerCase().trim();

    const content = await SiteContent.findOne({ section: cleanSection });

    if (!content) {
      const fallback = defaultSiteContent[cleanSection];
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

    const cleanSection = section.toLowerCase().trim();
    const updated = await SiteContent.findOneAndUpdate(
      { section: cleanSection },
      { data },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `Section "${section}" updated successfully.`,
      data: updated.data,
    });
  } catch (error) {
    next(error);
  }
};
