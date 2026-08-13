import mongoose from 'mongoose';

const helperProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    skills: [
      {
        categoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
        },
        experience: { type: Number, default: 0 },
      },
    ],
    experienceYears: {
      type: Number,
      default: 0,
    },
    languages: {
      type: [String],
      default: [],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'submitted', 'verified', 'rejected'],
      default: 'pending',
    },
    kycDocuments: {
      aadhaarFront: { type: String, default: '' },
      aadhaarBack: { type: String, default: '' },
      panCard: { type: String, default: '' },
      policeVerification: { type: String, default: '' },
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalCompletedJobs: {
      type: Number,
      default: 0,
    },
    totalRejectedJobs: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    acceptanceRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    bankDetails: {
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
      bankName: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

helperProfileSchema.index({ 'location': '2dsphere' });
helperProfileSchema.index({ isOnline: 1, isAvailable: 1 });
helperProfileSchema.index({ averageRating: -1 });
helperProfileSchema.index({ totalCompletedJobs: -1 });

const HelperProfile = mongoose.model('HelperProfile', helperProfileSchema);
export default HelperProfile;
