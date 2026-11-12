import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative'],
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount amount cannot be negative'],
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1 if set'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    applicableThemes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theme',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Helpful index for active coupons
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

