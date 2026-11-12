import mongoose from 'mongoose';

const ticketCustomerSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    customerSnapshot: {
      type: ticketCustomerSnapshotSchema,
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Ticket subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
      trim: true,
      maxlength: [4000, 'Description cannot exceed 4000 characters'],
    },
    category: {
      type: String,
      enum: [
        'general',
        'order_inquiry',
        'invitation_customization',
        'technical_issue',
        'billing_refund',
        'other',
      ],
      default: 'general',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
      default: null,
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Admin notes cannot exceed 2000 characters'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ customerId: 1, createdAt: -1 });

export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

