import mongoose from 'mongoose';

const eventSubSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, default: '' },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Calendar' },
  },
  { _id: false }
);

const cardSubSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    content: { type: String, required: true },
    icon: { type: String, default: 'Heart' },
  },
  { _id: false }
);

const invitationSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    themeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theme',
      default: null,
    },
    themeSlug: {
      type: String,
      default: 'royal-udaipur-palace',
    },
    brideName: {
      type: String,
      required: [true, "Bride's name is required"],
      trim: true,
    },
    groomName: {
      type: String,
      required: [true, "Groom's name is required"],
      trim: true,
    },
    weddingDate: {
      type: Date,
      required: [true, 'Wedding date is required'],
    },
    language: {
      type: String,
      default: 'English',
    },
    tagline: {
      type: String,
      default: 'Two Souls, One Sacred Journey',
    },
    familyMessage: {
      type: String,
      default: 'With the blessings of our ancestors and family, we cordially invite you to celebrate this auspicious union.',
    },
    venue: {
      name: { type: String, required: true },
      address: { type: String, default: '' },
      mapUrl: { type: String, default: '' },
    },
    photos: [{ type: String }],
    interactiveCards: [cardSubSchema],
    events: [eventSubSchema],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

// slug is already unique-indexed
export const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);
