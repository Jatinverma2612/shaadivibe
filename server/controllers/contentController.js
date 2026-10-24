import { SiteContent } from '../models/SiteContent.js';

// Default CMS content for Homepage
export const defaultSiteContent = {
  hero: {
    badge: 'India’s Premier Digital Wedding Invitation Suite',
    headline: 'Craft Unforgettable Royal Indian Wedding Invitations',
    subheadline: 'Celebrate sacred vows with 3D animated envelope reveals, personalized ceremony timelines, interactive cards, and live auspicious countdowns.',
    primaryCtaText: 'Browse Royal Themes',
    primaryCtaLink: '/themes',
    secondaryCtaText: 'Experience Live Sample',
    secondaryCtaLink: '/invite/priya-and-rohan',
    stats: [
      { label: 'Royal Celebrations', value: '12,000+' },
      { label: 'Auspicious Themes', value: '50+' },
      { label: 'Guest Happiness Rating', value: '4.9/5' },
    ],
  },
  features: {
    title: 'Why Modern Couples Choose ShaadiVibe',
    subtitle: 'Infusing centuries of regal Indian heritage with seamless, touch-friendly interactive web technology.',
    items: [
      {
        icon: 'MailOpen',
        title: '3D Envelope & Wax Seal',
        description: 'Guests tap a royal gold wax seal to witness their velvet envelope unwrap in cinematic 3D perspective.',
      },
      {
        icon: 'CalendarDays',
        title: 'Multi-Day Event Itinerary',
        description: 'Effortlessly showcase Haldi, Mehendi, Sangeet, Baraat, Pheras, and Reception with timings and map directions.',
      },
      {
        icon: 'Sparkles',
        title: 'Interactive Decorative Cards',
        description: 'Reveal Sacred Vows, Dress Code Color Palettes, and Accommodations with smooth touch-friendly cards.',
      },
      {
        icon: 'Clock',
        title: 'Auspicious Live Countdown',
        description: 'Ticking countdown timer down to the auspicious Muhurat seconds with celebration effects.',
      },
      {
        icon: 'Smartphone',
        title: '100% Mobile & WhatsApp Ready',
        description: 'Flawlessly optimized for smartphones with direct one-tap sharing to family WhatsApp groups.',
      },
      {
        icon: 'ShieldCheck',
        title: 'Zero Waste & Instant Edits',
        description: 'Update venues, timings, or photos instantly anytime without expensive paper reprint delays.',
      },
    ],
  },
  testimonials: {
    title: 'Cherished by Couples Across the Globe',
    subtitle: 'Real stories from brides, grooms, and families who invited their loved ones with ShaadiVibe.',
    items: [
      {
        id: 't-1',
        couple: 'Aanya & Kabir',
        city: 'New Delhi & London',
        theme: 'Royal Udaipur Palace',
        quote: 'Our guests in the UK and India were completely blown away when the gold wax seal opened! It felt like receiving a royal decree.',
        rating: 5,
      },
      {
        id: 't-2',
        couple: 'Meera & Siddharth',
        city: 'Mumbai & Jaipur',
        theme: 'Jaipur Jharokha Gold',
        quote: 'Managing 6 different ceremonies from Haldi to Reception was so clean. Guests knew exactly what colors to wear for each function.',
        rating: 5,
      },
      {
        id: 't-3',
        couple: 'Rhea & Dev',
        city: 'Bangalore & California',
        theme: 'Gulmohar Pastel Romance',
        quote: 'The falling petals and elegant typography created pure magic. The live countdown built so much anticipation among our cousins!',
        rating: 5,
      },
    ],
  },
  faqs: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about creating your royal digital wedding invitation.',
    items: [
      {
        question: 'How do guests open and view our digital wedding invitation?',
        answer: 'You will receive a unique personalized link (e.g., shaadivibe.com/invite/priya-and-rohan). You can share this link on WhatsApp, SMS, or Email. When guests tap the link, they are greeted by a closed royal envelope with a gold wax seal that unwraps on click!',
      },
      {
        question: 'Can I add multiple wedding ceremonies like Haldi, Mehendi, and Sangeet?',
        answer: 'Yes! ShaadiVibe includes a comprehensive multi-day ceremony itinerary. You can add, edit, or customize any number of functions with ceremony names, dates, times, venues, and descriptions.',
      },
      {
        question: 'Can I update the wedding details after sharing the invitation?',
        answer: 'Absolutely. You can edit your wedding details, timings, venue location, or photos at any time. When guests refresh the link, they immediately see the updated details.',
      },
      {
        question: 'Is ShaadiVibe mobile-friendly?',
        answer: 'Yes! Over 85% of wedding guests view invitations on mobile devices. ShaadiVibe is crafted mobile-first with silky-smooth animations and instant touch responses.',
      },
      {
        question: 'How many photos can I add to our invitation?',
        answer: 'In Phase 1, you can upload up to 6 high-resolution romantic photos of the couple to accompany the royal story.',
      },
    ],
  },
};

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
