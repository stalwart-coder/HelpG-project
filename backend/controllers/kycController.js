import * as kycService from '../services/kycService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * GET /api/kyc/status
 * Get current user's KYC status.
 */
export const getKycStatus = asyncHandler(async (req, res) => {
  const result = await kycService.getKycStatus(req.user._id);
  return new ApiResponse(200, result, 'KYC status retrieved').send(res);
});

/**
 * POST /api/kyc/submit
 * Submit KYC documents.
 */
export const submitKyc = asyncHandler(async (req, res) => {
  const kyc = await kycService.submitKyc(req.user._id, req.body);
  return new ApiResponse(201, kyc, 'KYC submitted successfully').send(res);
});

/**
 * POST /api/kyc/resubmit
 * Re-submit rejected KYC.
 */
export const resubmitKyc = asyncHandler(async (req, res) => {
  const kyc = await kycService.resubmitKyc(req.user._id, req.body);
  return new ApiResponse(200, kyc, 'KYC re-submitted successfully').send(res);
});

/**
 * PUT /api/kyc/bank-details
 * Update bank account details.
 */
export const updateBankDetails = asyncHandler(async (req, res) => {
  const kyc = await kycService.updateBankDetails(req.user._id, req.body);
  return new ApiResponse(200, kyc, 'Bank details updated').send(res);
});

/**
 * PUT /api/kyc/upi
 * Update UPI details.
 */
export const updateUpi = asyncHandler(async (req, res) => {
  const kyc = await kycService.updateUpiDetails(req.user._id, req.body);
  return new ApiResponse(200, kyc, 'UPI details updated').send(res);
});

/**
 * POST /api/kyc/approve/:id
 * Admin: Approve KYC.
 */
export const approveKyc = asyncHandler(async (req, res) => {
  const kyc = await kycService.approveKyc(req.params.id, req.user._id);
  return new ApiResponse(200, kyc, 'KYC approved').send(res);
});

/**
 * POST /api/kyc/reject/:id
 * Admin: Reject KYC.
 */
export const rejectKyc = asyncHandler(async (req, res) => {
  const { reason, fields } = req.body;
  const kyc = await kycService.rejectKyc(req.params.id, req.user._id, { reason, fields });
  return new ApiResponse(200, kyc, 'KYC rejected').send(res);
});

/**
 * GET /api/kyc/all
 * Admin: List all KYC submissions.
 */
export const listKyc = asyncHandler(async (req, res) => {
  const result = await kycService.listKyc(req.query);
  return new ApiResponse(200, result, 'KYC list retrieved').send(res);
});
