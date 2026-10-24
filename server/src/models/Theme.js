import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theme name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['Royal', 'Traditional', 'Floral', 'Minimal', 'Modern', 'Cartoon', 'Destination', 'Regional'],
      default: 'Royal',
    },
    tags: [{ type: String }],
    coverImage: {
      type: String,
      required: true,
    },
    previewImages: [{ type: String }],
    supportedFormats: [
      {
        type: String,
        enum: ['Interactive Website', 'Video Invitation'],
        default: 'Interactive Website',
      },
    ],
    priceDisplay: {
      type: Number,
      default: 0,
    },
    features: [{ type: String }],
    isPublished: {
      type: Boolean,
      default: true,
    },
    colorPalette: {
      primary: { type: String, default: '#5C061D' },
      secondary: { type: String, default: '#D4AF37' },
      accent: { type: String, default: '#FAF7F2' },
      background: { type: String, default: '#FFFDF9' },
    },
  },
  {
    timestamps: true,
  }
);

themeSchema.index({ category: 1, isPublished: 1 });

export const Theme = mongoose.models.Theme || mongoose.model('Theme', themeSchema);
