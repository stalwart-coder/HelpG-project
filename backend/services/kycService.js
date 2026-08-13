import Kyc from '../models/Kyc.js';
import HelperProfile from '../models/HelperProfile.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Get KYC status for the current user.
 */
export async function getKycStatus(userId) {
  let kyc = await Kyc.findOne({ userId });
  if (!kyc) {
    kyc = await Kyc.create({ userId, status: 'pending' });
  }
  const profile = await HelperProfile.findOne({ userId });
  return {
    kyc: kyc.toJSON(),
    kycStatus: profile?.kycStatus || 'pending',
  };
}

/**
 * Submit KYC for the first time.
 * Only helpers can submit. Prevents duplicate submission while under review.
 */
export async function submitKyc(userId, data) {
  const user = await User.findById(userId);
  if (!user || user.role !== 'helper') {
    throw new ApiError(403, 'Only helpers can submit KYC');
  }

  let kyc = await Kyc.findOne({ userId });
  
  if (kyc && kyc.status === 'submitted') {
    throw new ApiError(400, 'KYC is already under review. Please wait for verification.');
  }

  if (kyc && kyc.status === 'verified') {
    throw new ApiError(400, 'KYC is already verified. No changes needed.');
  }

  if (!kyc) {
    kyc = new Kyc({ userId });
  }

  // Update fields
  if (data.personalInfo) {
    kyc.personalInfo = { ...kyc.personalInfo.toObject(), ...data.personalInfo };
  }
  if (data.aadhaar) {
    kyc.aadhaar = { ...kyc.aadhaar.toObject(), ...data.aadhaar };
  }
  if (data.pan) {
    kyc.pan = { ...kyc.pan.toObject(), ...data.pan };
  }
  if (data.selfie) {
    kyc.selfie = { ...kyc.selfie.toObject(), ...data.selfie };
  }
  if (data.bankDetails) {
    kyc.bankDetails = { ...kyc.bankDetails.toObject(), ...data.bankDetails };
  }

  kyc.status = 'submitted';
  kyc.submittedAt = new Date();
  kyc.rejectionReason = '';
  kyc.rejectedFields = [];
  kyc.previousSubmissionCount = (kyc.previousSubmissionCount || 0) + 1;

  await kyc.save();

  // Update HelperProfile kycStatus
  await HelperProfile.findOneAndUpdate(
    { userId },
    { kycStatus: 'submitted' },
    { new: true }
  );

  logger.info('KYC submitted', { userId, submissionCount: kyc.previousSubmissionCount });
  return kyc.toJSON();
}

/**
 * Re-submit rejected KYC.
 */
export async function resubmitKyc(userId, data) {
  const kyc = await Kyc.findOne({ userId });
  if (!kyc) {
    throw new ApiError(404, 'No KYC record found. Please submit KYC first.');
  }
  if (kyc.status !== 'rejected') {
    throw new ApiError(400, 'Can only re-submit if KYC was rejected. Current status: ' + kyc.status);
  }

  // Merge new data
  if (data.personalInfo) {
    kyc.personalInfo = { ...kyc.personalInfo.toObject(), ...data.personalInfo };
  }
  if (data.aadhaar) {
    kyc.aadhaar = { ...kyc.aadhaar.toObject(), ...data.aadhaar };
  }
  if (data.pan) {
    kyc.pan = { ...kyc.pan.toObject(), ...data.pan };
  }
  if (data.selfie) {
    kyc.selfie = { ...kyc.selfie.toObject(), ...data.selfie };
  }
  if (data.bankDetails) {
    kyc.bankDetails = { ...kyc.bankDetails.toObject(), ...data.bankDetails };
  }

  kyc.status = 'submitted';
  kyc.submittedAt = new Date();
  kyc.rejectionReason = '';
  kyc.rejectedFields = [];
  kyc.previousSubmissionCount = (kyc.previousSubmissionCount || 0) + 1;

  await kyc.save();

  await HelperProfile.findOneAndUpdate(
    { userId },
    { kycStatus: 'submitted' },
    { new: true }
  );

  logger.info('KYC re-submitted', { userId, submissionCount: kyc.previousSubmissionCount });
  return kyc.toJSON();
}

/**
 * Update bank details for an existing KYC record.
 */
export async function updateBankDetails(userId, bankData) {
  const kyc = await Kyc.findOne({ userId });
  if (!kyc) {
    throw new ApiError(404, 'No KYC record found. Please submit KYC first.');
  }

  kyc.bankDetails.accountNumber = bankData.accountNumber;
  kyc.bankDetails.ifscCode = bankData.ifscCode;
  kyc.bankDetails.accountHolderName = bankData.accountHolderName;
  kyc.bankDetails.bankName = bankData.bankName || '';
  kyc.bankDetails.upiId = '';

  await kyc.save();

  // Also update HelperProfile bankDetails
  await HelperProfile.findOneAndUpdate(
    { userId },
    {
      'bankDetails.accountNumber': bankData.accountNumber,
      'bankDetails.ifscCode': bankData.ifscCode,
      'bankDetails.accountHolderName': bankData.accountHolderName,
      'bankDetails.bankName': bankData.bankName || '',
    },
    { new: true }
  );

  logger.info('Bank details updated', { userId });
  return kyc.toJSON();
}

/**
 * Update UPI ID for an existing KYC record.
 */
export async function updateUpiDetails(userId, { upiId }) {
  const kyc = await Kyc.findOne({ userId });
  if (!kyc) {
    throw new ApiError(404, 'No KYC record found. Please submit KYC first.');
  }

  kyc.bankDetails.upiId = upiId;
  kyc.bankDetails.accountNumber = '';
  kyc.bankDetails.ifscCode = '';
  kyc.bankDetails.accountHolderName = '';
  kyc.bankDetails.bankName = '';

  await kyc.save();

  await HelperProfile.findOneAndUpdate(
    { userId },
    { 'bankDetails.upiId': upiId },
    { new: true }
  );

  logger.info('UPI details updated', { userId });
  return kyc.toJSON();
}

/**
 * Admin: Approve KYC
 */
export async function approveKyc(kycId, adminId) {
  const kyc = await Kyc.findById(kycId);
  if (!kyc) {
    throw new ApiError(404, 'KYC record not found');
  }
  if (kyc.status !== 'submitted') {
    throw new ApiError(400, 'Can only approve KYC in submitted status. Current: ' + kyc.status);
  }

  kyc.status = 'verified';
  kyc.verifiedBy = adminId;
  kyc.verifiedAt = new Date();
  kyc.rejectionReason = '';
  kyc.rejectedFields = [];

  await kyc.save();

  await HelperProfile.findOneAndUpdate(
    { userId: kyc.userId },
    { kycStatus: 'verified' },
    { new: true }
  );

  logger.info('KYC approved', { kycId, userId: kyc.userId, adminId });
  return kyc.toJSON();
}

/**
 * Admin: Reject KYC
 */
export async function rejectKyc(kycId, adminId, { reason, fields }) {
  const kyc = await Kyc.findById(kycId);
  if (!kyc) {
    throw new ApiError(404, 'KYC record not found');
  }
  if (kyc.status !== 'submitted') {
    throw new ApiError(400, 'Can only reject KYC in submitted status. Current: ' + kyc.status);
  }

  kyc.status = 'rejected';
  kyc.verifiedBy = adminId;
  kyc.rejectionReason = reason || 'Documents did not meet verification requirements';
  kyc.rejectedFields = fields || [];

  await kyc.save();

  await HelperProfile.findOneAndUpdate(
    { userId: kyc.userId },
    { kycStatus: 'rejected' },
    { new: true }
  );

  logger.info('KYC rejected', { kycId, userId: kyc.userId, adminId, reason });
  return kyc.toJSON();
}

/**
 * Admin: List all KYC submissions with optional status filter.
 */
export async function listKyc(query = {}) {
  const filter = {};
  if (query.status) filter.status = query.status;

  const kycs = await Kyc.find(filter)
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(query.limit, 10) || 50, 100))
    .skip(parseInt(query.skip, 10) || 0);

  const total = await Kyc.countDocuments(filter);
  return { kycs, total };
}
