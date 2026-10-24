import { create } from 'zustand';
import { sampleInvitation } from '../../server/controllers/invitationController.js';

export const useCustomizationStore = create((set, get) => ({
  activeStep: 1, // 1: Details & Itinerary, 2: Photos, 3: Final Preview
  selectedThemeId: 'theme-1',
  selectedThemeSlug: 'royal-udaipur-palace',

  // Wedding Details
  brideName: 'Priya Sharma',
  groomName: 'Rohan Mehra',
  weddingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  weddingTime: '07:30 PM',
  language: 'English',
  tagline: 'Two Souls, One Sacred Destiny',
  familyMessage:
    'Together with their families, Mr. & Mrs. Rajesh Sharma and Mr. & Mrs. Vikram Mehra cordially invite you to celebrate the joyous union of their beloved children.',
  venue: {
    name: 'The Oberoi Udaivilas Palace',
    address: 'Badi-Gorela-Mulla Talai Rd, Haridas Ji Ki Magri, Udaipur, Rajasthan 313001',
    mapUrl: 'https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur',
  },

  // Dynamic Event Itinerary
  events: [...sampleInvitation.events],

  // Photos
  photos: [
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
  ],

  // Interactive Cards
  interactiveCards: [...sampleInvitation.interactiveCards],

  // Actions
  setActiveStep: (step) => set({ activeStep: step }),
  setSelectedTheme: (theme) =>
    set({
      selectedThemeId: theme._id || theme.id,
      selectedThemeSlug: theme.slug,
    }),

  updateDetails: (details) => set((state) => ({ ...state, ...details })),

  // Event actions
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, { ...event, id: `evt-${Date.now()}` }],
    })),

  updateEvent: (id, updatedEvent) =>
    set((state) => ({
      events: state.events.map((evt) => (evt.id === id ? { ...evt, ...updatedEvent } : evt)),
    })),

  removeEvent: (id) =>
    set((state) => ({
      events: state.events.filter((evt) => evt.id !== id),
    })),

  // Photo actions
  addPhotos: (newPhotos) =>
    set((state) => {
      const combined = [...state.photos, ...newPhotos];
      return { photos: combined.slice(0, 6) }; // Max 6 photos
    }),

  removePhoto: (index) =>
    set((state) => ({
      photos: state.photos.filter((_, i) => i !== index),
    })),

  resetToDefault: () =>
    set({
      activeStep: 1,
      brideName: 'Priya Sharma',
      groomName: 'Rohan Mehra',
      weddingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weddingTime: '07:30 PM',
      language: 'English',
      tagline: 'Two Souls, One Sacred Destiny',
      venue: {
        name: 'The Oberoi Udaivilas Palace',
        address: 'Badi-Gorela-Mulla Talai Rd, Haridas Ji Ki Magri, Udaipur, Rajasthan 313001',
        mapUrl: 'https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur',
      },
      events: [...sampleInvitation.events],
      photos: [
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      ],
    }),
}));
