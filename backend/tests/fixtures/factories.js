/**
 * Test data factories for generating mock MongoDB documents.
 */
import mongoose from 'mongoose';
import User from '../../models/User.js';
import Booking from '../../models/Booking.js';
import Otp from '../../models/Otp.js';
import HelperProfile from '../../models/HelperProfile.js';
import Transaction from '../../models/Transaction.js';
import Wallet from '../../models/Wallet.js';
import Conversation from '../../models/Conversation.js';
import Message from '../../models/Message.js';
import Notification from '../../models/Notification.js';

/**
 * Create a test user.
 * @param {Object} overrides - Override default fields
 * @returns {Promise<Object>} User document
 */
export async function createUser(overrides = {}) {
  const defaults = {
    name: 'Test User',
    phone: `+919000000${Math.floor(Math.random() * 9000 + 1000)}`,
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    role: 'customer',
    isPhoneVerified: true,
    isActive: true,
  };
  return User.create({ ...defaults, ...overrides });
}

/**
 * Create a test helper user with profile.
 * @param {Object} overrides - Override default fields
 * @returns {Promise<{user: Object, profile: Object}>}
 */
export async function createHelper(overrides = {}) {
  const user = await createUser({
    role: 'helper',
    isKycVerified: true,
    name: 'Helper Test',
    ...overrides,
  });
  const profile = await HelperProfile.create({
    userId: user._id,
    gender: 'male',
    skills: [{ categoryId: new mongoose.Types.ObjectId(), experience: 2 }],
    experienceYears: 2,
    languages: ['English', 'Hindi'],
    isAvailable: true,
    kycStatus: 'verified',
    averageRating: 4.5,
    totalCompletedJobs: 10,
    totalEarnings: 5000,
  });
  return { user, profile };
}

/**
 * Create a test booking.
 * @param {Object} overrides - Override default fields
 * @returns {Promise<Object>} Booking document
 */
export async function createBooking(overrides = {}) {
  const customer = overrides.customer || (await createUser());
  const defaults = {
    customer: customer._id,
    category: 'iron',
    title: 'Test steam press 12 shirts',
    description: 'Need ironing service',
    location: 'Koramangala, Bengaluru',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: 'onetime',
    price: 500,
    platformFee: 25,
    totalAmount: 525,
    status: 'pending',
    timeline: [{
      status: 'pending',
      timestamp: new Date(),
      note: 'Booking created',
      by: 'customer',
    }],
  };
  return Booking.create({ ...defaults, ...overrides });
}

/**
 * Create a test OTP entry.
 * @param {Object} overrides
 * @returns {Promise<Object>}
 */
export async function createOtp(overrides = {}) {
  const defaults = {
    phone: '+919000000001',
    purpose: 'login',
    otp: '123456',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    isUsed: false,
    attempts: 0,
  };
  return Otp.create({ ...defaults, ...overrides });
}

/**
 * Create a test transaction.
 * @param {Object} overrides
 * @returns {Promise<Object>}
 */
export async function createTransaction(overrides = {}) {
  const user = overrides.user || (await createUser());
  const defaults = {
    userId: user._id,
    type: 'payment',
    amount: 525,
    fee: 25,
    netAmount: 500,
    status: 'completed',
    paymentMethod: 'razorpay',
    description: 'Test payment',
  };
  return Transaction.create({ ...defaults, ...overrides });
}

/**
 * Create a test wallet.
 * @param {Object} overrides
 * @returns {Promise<Object>}
 */
export async function createWallet(overrides = {}) {
  const user = overrides.user || (await createUser());
  const defaults = {
    userId: user._id,
    balance: 10000,
    totalEarned: 20000,
    totalWithdrawn: 10000,
  };
  return Wallet.create({ ...defaults, ...overrides });
}

/**
 * Create a test conversation between two users.
 * @param {Object} overrides
 * @returns {Promise<Object>}
 */
export async function createConversation(overrides = {}) {
  const user1 = overrides.user1 || (await createUser());
  const user2 = overrides.user2 || (await createUser({ phone: '+919000000002', email: 'test2@example.com' }));
  const defaults = {
    participants: [user1._id, user2._id],
    isActive: true,
  };
  return Conversation.create({ ...defaults, ...overrides });
}

/**
 * Create a test message in a conversation.
 * @param {Object} overrides
 * @returns {Promise<Object>}
 */
export async function createMessage(overrides = {}) {
  const conv = overrides.conversation || (await createConversation());
  const sender = overrides.sender || conv.participants[0];
  const defaults = {
    conversationId: conv._id,
    senderId: sender,
    content: 'Hello, this is a test message',
    messageType: 'text',
  };
  return Message.create({ ...defaults, ...overrides });
}

/**
 * Create a test notification.
 * @param {Object} overrides
 * @returns {Promise<Object>}
 */
export async function createNotification(overrides = {}) {
  const user = overrides.user || (await createUser());
  const defaults = {
    userId: user._id,
    type: 'booking_update',
    title: 'Test notification',
    body: 'This is a test notification body',
  };
  return Notification.create({ ...defaults, ...overrides });
}
