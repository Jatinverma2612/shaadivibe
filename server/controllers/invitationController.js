import { Invitation } from '../models/Invitation.js';

// Pre-configured rich demo royal invitation
export const sampleInvitation = {
  id: 'invite-sample-1',
  slug: 'priya-and-rohan',
  themeSlug: 'royal-udaipur-palace',
  brideName: 'Priya Sharma',
  groomName: 'Rohan Mehra',
  weddingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days in future
  language: 'English',
  tagline: 'Two Souls, One Sacred Destiny',
  familyMessage: 'Together with their families, Mr. & Mrs. Rajesh Sharma and Mr. & Mrs. Vikram Mehra cordially invite you to celebrate the joyous union of their beloved children.',
  venue: {
    name: 'The Oberoi Udaivilas Palace',
    address: 'Badi-Gorela-Mulla Talai Rd, Haridas Ji Ki Magri, Udaipur, Rajasthan 313001',
    mapUrl: 'https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur',
  },
  photos: [
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
  ],
  interactiveCards: [
    {
      id: 'card-1',
      title: 'The Sacred Vows',
      subtitle: 'Seven Pheras, Seven Lifetimes',
      icon: 'HeartHandshake',
      content: 'Under the sacred Vedic fire, we pledge to walk through life as equals, cherishing love, honor, companionship, and spiritual harmony through every season.',
    },
    {
      id: 'card-2',
      title: 'Royal Dress Code',
      subtitle: 'Color Palette & Etiquette',
      icon: 'Sparkles',
      content: 'We invite our esteemed guests to grace the celebrations in Royal Indian Ethnic attire. Preferred tones: Regal Burgundy, Warm Ochre, Pastel Pinks, and Antique Gold.',
    },
    {
      id: 'card-3',
      title: 'Accommodations & Travel',
      subtitle: 'Your Regal Palace Stay',
      icon: 'MapPin',
      content: 'Arrangements for your royal stay have been made at The Palace Suites. Airport concierge and palace ferry transfers will welcome you upon arrival in Udaipur.',
    },
  ],
  events: [
    {
      id: 'evt-1',
      title: 'Auspicious Haldi Ceremony',
      date: 'Day 1 — Morning',
      time: '10:30 AM onwards',
      venue: 'The Courtyard Pavilion',
      description: 'Anointing the couple with golden turmeric, fragrant sandalwood, and joyful floral showers.',
      icon: 'Sun',
    },
    {
      id: 'evt-2',
      title: 'Mehendi & High Tea',
      date: 'Day 1 — Afternoon',
      time: '04:00 PM onwards',
      venue: 'Lakeside Lawn Promenade',
      description: 'Intricate henna designs, live folk music, Rajasthani delicacies, and colorful swings.',
      icon: 'Palette',
    },
    {
      id: 'evt-3',
      title: 'Sangeet & Royal Gala',
      date: 'Day 1 — Evening',
      time: '08:00 PM onwards',
      venue: 'The Grand Mewar Ballroom',
      description: 'An evening of scintillating family performances, celebration, and royal dining under chandeliers.',
      icon: 'Music',
    },
    {
      id: 'evt-4',
      title: 'Royal Baraat & Varmala',
      date: 'Day 2 — Evening',
      time: '05:30 PM onwards',
      venue: 'Palace Main Gate to Lake Deck',
      description: 'The groom arrives in regal procession with dhol beats, followed by the auspicious floral garland exchange.',
      icon: 'Crown',
    },
    {
      id: 'evt-5',
      title: 'Sacred Pheras & Wedding Rituals',
      date: 'Day 2 — Twilight',
      time: '07:30 PM onwards',
      venue: 'The Heritage Mandap by Lake Pichola',
      description: 'The sacred Vedic union solemnized amidst Sanskrit chants, seven vows, and ancestral blessings.',
      icon: 'Flame',
    },
    {
      id: 'evt-6',
      title: 'Grand Reception Dinner',
      date: 'Day 2 — Night',
      time: '09:30 PM onwards',
      venue: 'The Royal Poolside Amphitheatre',
      description: 'A lavish feast celebrating the newlyweds with live instrumental ragas and midnight fireworks.',
      icon: 'UtensilsCrossed',
    },
  ],
  status: 'published',
};

// In-memory cache for invitations created during current runtime session
const sessionInvitations = new Map();
sessionInvitations.set('priya-and-rohan', sampleInvitation);

export const getInvitationBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slug.toLowerCase().trim();

    let invitation = null;
    try {
      invitation = await Invitation.findOne({ slug: cleanSlug });
    } catch (dbErr) {
      // ignore
    }

    if (!invitation) {
      invitation = sessionInvitations.get(cleanSlug);
    }

    // Default demo if looking for sample or preview
    if (!invitation && (cleanSlug === 'sample' || cleanSlug === 'demo')) {
      invitation = sampleInvitation;
    }

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Wedding invitation not found. Please verify the URL.',
      });
    }

    res.json({ success: true, data: invitation });
  } catch (error) {
    next(error);
  }
};

export const createInvitation = async (req, res, next) => {
  try {
    const {
      brideName,
      groomName,
      weddingDate,
      language,
      tagline,
      familyMessage,
      venue,
      photos,
      interactiveCards,
      events,
      themeSlug,
      customSlug,
    } = req.body;

    if (!brideName || !groomName || !weddingDate) {
      return res.status(400).json({
        success: false,
        message: 'Bride name, Groom name, and Wedding date are required.',
      });
    }

    // Generate unique slug
    const baseSlug = customSlug || `${brideName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-weds-${groomName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const inviteData = {
      slug: uniqueSlug,
      themeSlug: themeSlug || 'royal-udaipur-palace',
      brideName,
      groomName,
      weddingDate: new Date(weddingDate),
      language: language || 'English',
      tagline: tagline || 'Two Souls, One Sacred Journey',
      familyMessage: familyMessage || 'We cordially invite you to celebrate our wedding.',
      venue: {
        name: venue?.name || 'Grand Palace Venue',
        address: venue?.address || '',
        mapUrl: venue?.mapUrl || '',
      },
      photos: Array.isArray(photos) ? photos : [],
      interactiveCards: Array.isArray(interactiveCards) && interactiveCards.length > 0 ? interactiveCards : sampleInvitation.interactiveCards,
      events: Array.isArray(events) && events.length > 0 ? events : sampleInvitation.events,
      status: 'published',
    };

    let saved = null;
    try {
      saved = await Invitation.create(inviteData);
    } catch (dbErr) {
      console.warn('[InvitationController] Database unavailable, saving in session storage.');
      saved = { ...inviteData, _id: `session_${Date.now()}` };
    }

    sessionInvitations.set(uniqueSlug, saved);

    res.status(201).json({
      success: true,
      message: 'Invitation created successfully!',
      data: saved,
      shareUrl: `/invite/${uniqueSlug}`,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updated = null;

    try {
      updated = await Invitation.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    } catch (dbErr) {
      // Session fallback
    }

    if (!updated && sessionInvitations.has(id)) {
      const existing = sessionInvitations.get(id);
      updated = { ...existing, ...req.body };
      sessionInvitations.set(id, updated);
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    res.json({ success: true, message: 'Invitation updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};
