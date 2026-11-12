import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: [true, 'Transaction identifier is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
      index: true,
    },
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
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
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, trim: true, default: '' },
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    method: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'bank_transfer', 'cash', 'other'],
      default: 'upi',
      index: true,
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'manual_admin', 'direct_upi'],
      default: 'manual_admin',
    },
    gatewayPaymentId: {
      type: String,
      trim: true,
      default: '',
    },
    gatewayOrderId: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['captured', 'pending', 'failed', 'refunded'],
      default: 'captured',
      index: true,
    },
    refundDetails: {
      amount: { type: Number, default: 0 },
      reason: { type: String, default: '', trim: true },
      refundedAt: { type: Date, default: null },
      refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

