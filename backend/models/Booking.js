import mongoose from 'mongoose';

/**
 * Booking status lifecycle:
 *   pending → confirmed (helper accepts)
 *   pending → cancelled (customer cancels before acceptance)
 *   confirmed → in_progress (helper starts work)
 *   in_progress → completed (helper marks done)
 *   in_progress → cancelled (customer cancels mid-task)
 *   confirmed → rescheduled (customer changes time)
 */
const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
];

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
    by: {
      type: String,
      enum: ['customer', 'helper', 'system'],
      required: true,
    },
  },
  { _id: false }
);

const rescheduleEntrySchema = new mongoose.Schema(
  {
    previousDate: { type: Date, required: true },
    newDate: { type: Date, required: true },
    rescheduledAt: { type: Date, default: Date.now },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    helper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'pending',
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Service category is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Booking title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description must not exceed 1000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [77.6245, 12.9352] }, // [lng, lat]
    },
    startOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date/time is required'],
    },
    duration: {
      type: String,
      default: 'onetime',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
    },
    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    cancellation: {
      reason: { type: String, default: '' },
      notes: { type: String, default: '' },
      cancelledAt: { type: Date, default: null },
      cancelledBy: {
        type: String,
        enum: ['customer', 'helper', 'system'],
        default: null,
      },
    },
    rescheduleHistory: {
      type: [rescheduleEntrySchema],
      default: [],
    },
    timeline: {
      type: [timelineEntrySchema],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ─────────────────────────────────────────────────────────────────
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ helper: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ 'cancellation.cancelledAt': 1 });

// ── Pre-save: auto-add timeline entry on status change ──────────────────────
bookingSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    const by =
      this.status === 'pending'
        ? 'system'
        : this.status === 'cancelled' && this.cancellation?.cancelledBy
          ? this.cancellation.cancelledBy
          : 'system';

    // Avoid duplicates — only add if last entry has different status
    const lastEntry = this.timeline[this.timeline.length - 1];
    if (!lastEntry || lastEntry.status !== this.status) {
      this.timeline.push({
        status: this.status,
        timestamp: new Date(),
        note: '',
        by,
      });
    }
    next();
  } else {
    next();
  }
});

bookingSchema.index({ coordinates: '2dsphere' });

const Booking = mongoose.model('Booking', bookingSchema);

export { BOOKING_STATUSES };
export default Booking;

