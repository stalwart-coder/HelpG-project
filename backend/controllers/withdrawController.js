import * as withdrawService from '../services/withdrawService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Wallet from '../models/Wallet.js';
import Kyc from '../models/Kyc.js';

/**
 * POST /api/helpers/withdraw
 * Request a withdrawal from wallet.
 */
export const requestWithdrawal = asyncHandler(async (req, res) => {
  const result = await withdrawService.requestWithdrawal(req.user._id, req.body);
  return new ApiResponse(201, result, 'Withdrawal request submitted successfully').send(res);
});

/**
 * GET /api/helpers/withdraw/history
 * Get withdrawal history.
 */
export const getWithdrawalHistory = asyncHandler(async (req, res) => {
  const data = await withdrawService.getWithdrawalHistory(req.user._id, req.query);
  return new ApiResponse(200, data, 'Withdrawal history retrieved successfully').send(res);
});

/**
 * GET /api/helpers/wallet
 * Get wallet balance + bank account details from KYC.
 */
export const getWalletBalance = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }

  // Also fetch bank/UPI details from KYC for display
  const kyc = await Kyc.findOne({ userId }).select('bankDetails');

  const bankDetails = kyc?.bankDetails || {};

  return new ApiResponse(200, {
    balance: wallet.balance,
    totalEarned: wallet.totalEarned || 0,
    totalWithdrawn: wallet.totalWithdrawn || 0,
    upiId: bankDetails.upiId || '',
    accountNumber: bankDetails.accountNumber || '',
    ifscCode: bankDetails.ifscCode || '',
    accountHolderName: bankDetails.accountHolderName || '',
    bankName: bankDetails.bankName || '',
  }, 'Wallet data retrieved').send(res);
});
