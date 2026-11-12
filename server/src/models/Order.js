import mongoose from 'mongoose';

const customerSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const packageSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    themeType: {
      type: String,
      enum: ['video', 'website', 'both'],
      default: 'website',
    },
    supportedFormats: [{ type: String }],
    coverImage: { type: String, default: '' },
    basePrice: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, default: 0, min: 0 },
    packageType: { type: String, default: 'Complete Wedding Suite' },
  },
  { _id: false }
);

const pricingSchema = new mongoose.Schema(
  {
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
  },
  { _id: false }
);

const invitationSnapshotSchema = new mongoose.Schema(
  {
    brideName: { type: String, trim: true, default: '' },
    groomName: { type: String, trim: true, default: '' },
    weddingDate: { type: Date, default: null },
    slug: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const couponSnapshotSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true, uppercase: true, default: '' },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    customerSnapshot: {
      type: customerSnapshotSchema,
      required: true,
    },
    themeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theme',
      required: [true, 'Theme / Package reference is required'],
      index: true,
    },
    packageSnapshot: {
      type: packageSnapshotSchema,
      required: true,
    },
    pricing: {
      type: pricingSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'confirmed', 'processing', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'refunded'],
      default: 'unpaid',
      index: true,
    },
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
      default: null,
      index: true,
    },
    invitationSnapshot: {
      type: invitationSnapshotSchema,
      default: () => ({}),
    },
    couponSnapshot: {
      type: couponSnapshotSchema,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    source: {
      type: String,
      enum: ['admin_manual', 'admin_panel', 'customer_checkout', 'draft_wizard'],
      default: 'admin_manual',
    },
    confirmedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast dashboard and listing lookups
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
