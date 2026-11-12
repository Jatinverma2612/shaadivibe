import mongoose from 'mongoose';

const rsvpSchema = new mongoose.Schema(
  {
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
      required: [true, 'Invitation reference is required'],
      index: true,
    },
    ceremonyId: {
      type: String,
      required: [true, 'Ceremony identifier is required'],
      trim: true,
    },
    ceremonyTitle: {
      type: String,
      required: [true, 'Ceremony title is required'],
      trim: true,
    },
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
      maxlength: [100, 'Guest name cannot exceed 100 characters'],
    },
    guestEmail: {
      type: String,
      required: [true, 'Guest email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    guestPhone: {
      type: String,
      trim: true,
      default: '',
    },
    attendance: {
      type: String,
      enum: ['attending', 'declined', 'maybe'],
      default: 'attending',
      index: true,
    },
    guestCount: {
      type: Number,
      min: [1, 'Guest count must be at least 1'],
      max: [10, 'Guest count cannot exceed 10'],
      default: 1,
    },
    dietaryPreferences: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Dietary preferences cannot exceed 200 characters'],
    },
    message: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Blessings/message cannot exceed 500 characters'],
    },
    respondedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring idempotency: one RSVP per email per ceremony per invitation
rsvpSchema.index({ invitationId: 1, ceremonyId: 1, guestEmail: 1 }, { unique: true });
rsvpSchema.index({ invitationId: 1, attendance: 1 });
rsvpSchema.index({ createdAt: -1 });

export const Rsvp = mongoose.models.Rsvp || mongoose.model('Rsvp', rsvpSchema);

