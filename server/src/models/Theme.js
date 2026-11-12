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
      required: [true, 'Category is required'],
      trim: true,
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
      min: [0, 'Price must not be negative'],
    },
    offerPrice: {
      type: Number,
      default: 0,
      min: [0, 'Offer price must not be negative'],
    },
    features: [{ type: String }],
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    themeType: {
      type: String,
      enum: ['video', 'website', 'both'],
      default: 'website',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    videoDuration: {
      type: String,
      default: '00:30',
    },
    templateFile: {
      url: { type: String, default: '' },
      filename: { type: String, default: '' },
      size: { type: Number, default: 0 },
      uploadedAt: { type: Date },
    },
    customizationFields: [
      {
        key: { type: String },
        label: { type: String },
        type: { type: String, default: 'text' },
        required: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        placeholder: { type: String, default: '' },
      },
    ],
    hostingDurationMonths: {
      type: Number,
      default: 12,
    },
    maxFunctions: {
      type: Number,
      default: 5,
    },
    seoTitle: {
      type: String,
      default: '',
    },
    seoDescription: {
      type: String,
      default: '',
    },
    languages: [{ type: String, default: 'English' }],
    status: {
      type: String,
      enum: ['active', 'draft', 'inactive', 'archived'],
      default: 'active',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
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
themeSchema.index({ themeType: 1 });
themeSchema.index({ isFeatured: 1, displayOrder: 1 });

export const Theme = mongoose.models.Theme || mongoose.model('Theme', themeSchema);
