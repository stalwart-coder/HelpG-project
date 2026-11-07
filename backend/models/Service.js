import mongoose from 'mongoose';

/**
 * Service / Category model for HelpJi marketplace.
 * Represents a service category available on the platform (e.g. Ironing, Grocery Pickup).
 */
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name must not exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Service slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    icon: {
      type: String, // emoji or icon name
      default: '🔧',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    // Base price range for UI display
    basePriceMin: {
      type: Number,
      default: 0,
      min: 0,
    },
    basePriceMax: {
      type: Number,
      default: 0,
      min: 0,
    },
    pricingUnit: {
      type: String,
      enum: ['per_task', 'per_hour', 'per_item', 'negotiable'],
      default: 'per_task',
    },
    // Tags for search and filtering
    tags: {
      type: [String],
      default: [],
    },
    // Popularity / sort order
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // How many tasks posted under this category (denormalized for performance)
    totalBookings: {
      type: Number,
      default: 0,
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
serviceSchema.index({ isActive: 1, sortOrder: 1 });
serviceSchema.index({ isFeatured: 1 });
serviceSchema.index({ tags: 1 });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
