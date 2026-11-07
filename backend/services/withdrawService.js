import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import HelperProfile from '../models/HelperProfile.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Process a withdrawal request for a helper.
 *
 * Validates balance, creates a withdrawal transaction,
 * deducts from wallet, and returns the result.
 *
 * @param {string} userId - Helper user ID
 * @param {Object} data - { amount, upiId, note }
 * @returns {Promise<Object>} { transaction, wallet }
 */
export async function requestWithdrawal(userId, data) {
  const { amount, upiId, note } = data;

  // Validate amount
  const withdrawalAmount = Math.round(parseFloat(amount) * 100) / 100;
  if (!withdrawalAmount || withdrawalAmount <= 0) {
    throw new ApiError(400, 'Withdrawal amount must be greater than 0.');
  }

  if (withdrawalAmount < 1) {
    throw new ApiError(400, 'Minimum withdrawal amount is ₹1.');
  }



  // Get or create wallet
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }

  // Check sufficient balance
  if (wallet.balance < withdrawalAmount) {
    throw new ApiError(400, `Insufficient wallet balance. Available: ₹${wallet.balance}, Requested: ₹${withdrawalAmount}`);
  }

  // Create withdrawal transaction (pending)
  const transaction = await Transaction.create({
    userId,
    type: 'withdrawal',
    amount: -withdrawalAmount,
    fee: 0,
    netAmount: -withdrawalAmount,
    status: 'pending',
    paymentMethod: 'upi',
    description: `Withdrawal of ₹${withdrawalAmount} to UPI ${upiId}${note ? `: ${note}` : ''}`,
    notes: {
      upiId,
      requestNote: note || '',
    },
  });

  // Deduct from wallet immediately (funds are held)
  wallet.balance -= withdrawalAmount;
  wallet.totalWithdrawn += withdrawalAmount;
  await wallet.save();

  logger.info('Withdrawal requested', {
    userId,
    amount: withdrawalAmount,
    upiId,
    transactionId: transaction._id,
    remainingBalance: wallet.balance,
  });

  return { transaction, wallet };
}

/**
 * Get withdrawal history for a user.
 *
 * @param {string} userId
 * @param {Object} query - { limit, skip, status }
 * @returns {Promise<Object>} { withdrawals, total }
 */
export async function getWithdrawalHistory(userId, query = {}) {
  const filter = { userId, type: 'withdrawal' };

  if (query.status) {
    filter.status = query.status;
  }

  const withdrawals = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(query.limit, 10) || 50, 100))
    .skip(parseInt(query.skip, 10) || 0);

  const total = await Transaction.countDocuments(filter);

  return { withdrawals, total };
}

export default {
  requestWithdrawal,
  getWithdrawalHistory,
};
