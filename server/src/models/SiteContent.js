import mongoose from 'mongoose';

const siteContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// section is already unique-indexed
export const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', siteContentSchema);
