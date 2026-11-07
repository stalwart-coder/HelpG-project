import mongoose from 'mongoose';

/**
 * KYC (Know Your Customer) Verification Model
 *
 * Stores all KYC documents and verification status for helpers.
 * Status lifecycle: pending -> submitted -> verified | rejected
 * Re-submit flow: rejected -> submitted -> verified | rejected
 */
const KYC_STATUSES = ['pending', 'submitted', 'verified', 'rejected'];

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: KYC_STATUSES,
      default: 'pending',
      index: true,
    },
    personalInfo: {
      fullName: { type: String, default: '' },
      dob: { type: String, default: '' },
      gender: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    aadhaar: {
      number: { type: String, default: '' },
      frontImage: { type: String, default: '' },
      backImage: { type: String, default: '' },
    },
    pan: {
      number: { type: String, default: '' },
      image: { type: String, default: '' },
      nameOnPan: { type: String, default: '' },
    },
    selfie: {
      url: { type: String, default: '' },
    },
    bankDetails: {
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
      bankName: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
    rejectionReason: { type: String, default: '' },
    rejectedFields: { type: [String], default: [] },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
    previousSubmissionCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

kycSchema.index({ status: 1, createdAt: -1 });
kycSchema.index({ userId: 1, status: 1 });

const Kyc = mongoose.model('Kyc', kycSchema);

export { KYC_STATUSES };
export default Kyc;
