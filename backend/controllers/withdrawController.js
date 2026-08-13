import * as withdrawService from '../services/withdrawService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

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
