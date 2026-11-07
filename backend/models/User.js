import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'helper', 'admin'],
      default: 'customer',
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isKycVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
    fcmToken: { type: String, default: '' },
    refreshToken: { type: String, select: false },
    lastLoginAt: { type: Date },

    // ── Firebase / Social Auth ─────────────────────────────────────────────
    // firebaseUid is populated when user signs in via Google (Firebase)
    firebaseUid: { type: String, unique: true, sparse: true },
    googleEmail: { type: String, trim: true, lowercase: true },
    // 'local' = email/password, 'google' = Firebase Google Sign-In
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

    // ── Location (for helper radar) ───────────────────────────────────────
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    locality: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ─────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ location: '2dsphere' }); // for geospatial helper radar queries

// ── Pre-save hook: hash password ────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds);
  next();
});

// ── Instance methods ────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
