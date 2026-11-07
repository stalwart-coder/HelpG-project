import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import logger from '../utils/logger.js';

/**
 * Create a review for a completed booking.
 * POST /api/reviews
 */
export const createReview = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const { bookingId, rating, comment, tags, photos } = req.body;

  // Verify booking exists and belongs to this customer
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.customer.toString() !== customerId) {
    throw new ApiError(403, 'You can only review your own bookings');
  }

  if (booking.status !== 'completed') {
    throw new ApiError(400, 'You can only review completed bookings');
  }

  if (!booking.helper) {
    throw new ApiError(400, 'This booking has no assigned helper to review');
  }

  // Prevent duplicate review
  const existing = await Review.findOne({ bookingId });
  if (existing) {
    throw new ApiError(409, 'You have already reviewed this booking');
  }

  const review = await Review.create({
    userId: customerId,
    helperId: booking.helper,
    bookingId,
    rating,
    comment: comment || '',
    tags: tags || [],
    photos: photos || [],
  });

  const populated = await review.populate([
    { path: 'userId', select: 'name avatar' },
    { path: 'helperId', select: 'name avatar' },
  ]);

  logger.info('Review created', { reviewId: review._id, bookingId, rating });

  res.status(201).json(
    new ApiResponse(201, populated, 'Review submitted successfully')
  );
});

/**
 * Get all reviews for a specific helper.
 * GET /api/reviews/helper/:helperId
 */
export const getHelperReviews = asyncHandler(async (req, res) => {
  const { helperId } = req.params;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const skip = parseInt(req.query.skip, 10) || 0;

  const reviews = await Review.find({ helperId, isVisible: true })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Review.countDocuments({ helperId, isVisible: true });

  // Compute rating distribution
  const ratingAgg = await Review.aggregate([
    { $match: { helperId: new mongoose.Types.ObjectId(helperId), isVisible: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);

  const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingAgg.forEach(({ _id, count }) => { ratingDist[_id] = count; });

  res.json(
    new ApiResponse(200, { reviews, total, ratingDistribution: ratingDist }, 'Reviews fetched successfully')
  );
});

/**
 * Get a review for a specific booking (by the customer or helper).
 * GET /api/reviews/booking/:bookingId
 */
export const getBookingReview = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const isCustomer = booking.customer.toString() === userId;
  const isHelper = booking.helper && booking.helper.toString() === userId;

  if (!isCustomer && !isHelper) {
    throw new ApiError(403, 'You do not have access to this review');
  }

  const review = await Review.findOne({ bookingId })
    .populate('userId', 'name avatar')
    .populate('helperId', 'name avatar');

  res.json(
    new ApiResponse(200, review, review ? 'Review found' : 'No review yet for this booking')
  );
});

/**
 * Helper adds a response to a review.
 * PATCH /api/reviews/:reviewId/respond
 */
export const respondToReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const helperId = req.user.id;
  const { response } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  if (review.helperId.toString() !== helperId) {
    throw new ApiError(403, 'You can only respond to reviews about yourself');
  }

  if (review.helperResponse) {
    throw new ApiError(400, 'You have already responded to this review');
  }

  review.helperResponse = response.trim();
  review.helperRespondedAt = new Date();
  await review.save();

  res.json(new ApiResponse(200, review, 'Response added successfully'));
});

/**
 * Get the authenticated user's reviews (as a customer).
 * GET /api/reviews/my
 */
export const getMyReviews = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const skip = parseInt(req.query.skip, 10) || 0;

  const reviews = await Review.find({ userId, isVisible: true })
    .populate('helperId', 'name avatar')
    .populate('bookingId', 'title category scheduledAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Review.countDocuments({ userId });

  res.json(new ApiResponse(200, { reviews, total }, 'Your reviews fetched'));
});
