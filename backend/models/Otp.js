import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
    },
    purpose: {
      type: String,
      enum: ['signup', 'login', 'password-reset', 'phone-verification'],
      required: [true, 'OTP purpose is required'],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index for TTL auto-expiry ──────────────────────────────────────────────
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ── Index for lookups ───────────────────────────────────────────────────────
otpSchema.index({ phone: 1, purpose: 1, isUsed: 1 });

// ── Instance method: check if OTP is expired ───────────────────────────────
otpSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;

