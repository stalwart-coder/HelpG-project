import mongoose from 'mongoose';

const DISCOUNT_TYPES = ['percentage', 'fixed'];
const COUPON_STATUSES = ['active', 'disabled', 'expired'];

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    discountType: {
      type: String,
      enum: DISCOUNT_TYPES,
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount must be non-negative'],
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    applicableCategories: {
      type: [String],
      default: [],
    },
    applicableUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startsAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: COUPON_STATUSES,
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ status: 1, expiresAt: 1 });
couponSchema.index({ startsAt: 1, expiresAt: 1 });

couponSchema.methods.isValid = function () {
  if (this.status !== 'active') return false;
  const now = new Date();
  if (this.startsAt && now < this.startsAt) return false;
  if (this.expiresAt && now > this.expiresAt) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  return true;
};

const Coupon = mongoose.model('Coupon', couponSchema);
export { DISCOUNT_TYPES, COUPON_STATUSES };
export default Coupon;
