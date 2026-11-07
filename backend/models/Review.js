import mongoose from 'mongoose';

/**
 * Review model for customer ratings of helpers after task completion.
 */
const reviewSchema = new mongoose.Schema(
  {
    // The customer who left the review
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer (userId) is required'],
    },
    // The helper being reviewed
    helperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Helper (helperId) is required'],
    },
    // The booking this review is linked to
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking (bookingId) is required'],
      unique: true, // One review per booking
      index: true,
    },
    // Star rating 1–5
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    // Written review text
    comment: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Comment must not exceed 1000 characters'],
    },
    // Quick tags (e.g. "Punctual", "Professional", "Friendly")
    tags: {
      type: [String],
      default: [],
    },
    // Optional photos attached to the review
    photos: {
      type: [String], // URLs
      default: [],
    },
    // Optional helper response to the review
    helperResponse: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Response must not exceed 500 characters'],
    },
    helperRespondedAt: {
      type: Date,
      default: null,
    },
    // Admin moderation
    isVisible: {
      type: Boolean,
      default: true,
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    moderationNote: {
      type: String,
      default: '',
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

// ── Indexes ───────────────────────────────────────────────────────────────────
reviewSchema.index({ helperId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isVisible: 1 });

// ── Post-save: update helper's average rating ─────────────────────────────────
reviewSchema.post('save', async function () {
  try {
    const HelperProfile = mongoose.model('HelperProfile');
    const agg = await mongoose.model('Review').aggregate([
      { $match: { helperId: this.helperId, isVisible: true } },
      {
        $group: {
          _id: '$helperId',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (agg.length > 0) {
      const { avgRating, totalReviews } = agg[0];
      await HelperProfile.findOneAndUpdate(
        { userId: this.helperId },
        {
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews,
        }
      );
    }
  } catch (err) {
    // Non-fatal — don't crash if rating aggregation fails
    console.error('Review post-save rating update failed:', err.message);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
