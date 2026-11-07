import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import SupportTicket from '../models/SupportTicket.js';
import logger from '../utils/logger.js';

/**
 * Create a new support ticket.
 * POST /api/support/tickets
 */
export const createTicket = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { subject, description, category, bookingId, priority } = req.body;

  const ticket = await SupportTicket.create({
    user: userId,
    subject,
    description,
    category: category || 'general',
    booking: bookingId || null,
    priority: priority || 'normal',
    status: 'open',
  });

  logger.info('Support ticket created', { ticketId: ticket.ticketId, userId });

  res.status(201).json(new ApiResponse(201, ticket, 'Support ticket created successfully'));
});

/**
 * Get all tickets for the authenticated user.
 * GET /api/support/tickets
 */
export const getMyTickets = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const skip = parseInt(req.query.skip, 10) || 0;

  const filter = { user: userId, isActive: true };
  if (req.query.status) filter.status = req.query.status;

  const tickets = await SupportTicket.find(filter)
    .populate('booking', 'title category scheduledAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await SupportTicket.countDocuments(filter);

  res.json(new ApiResponse(200, { tickets, total }, 'Tickets fetched'));
});

/**
 * Get a single ticket by ID.
 * GET /api/support/tickets/:ticketId
 */
export const getTicketById = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user.id;

  // ticketId can be MongoDB _id or the human-readable TKT-xxx id
  const ticket = await SupportTicket.findOne({
    $or: [
      { _id: ticketId.match(/^[0-9a-fA-F]{24}$/) ? ticketId : null },
      { ticketId },
    ],
  }).populate('booking', 'title category scheduledAt status');

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  if (ticket.user.toString() !== userId) {
    throw new ApiError(403, 'You do not have access to this ticket');
  }

  res.json(new ApiResponse(200, ticket, 'Ticket fetched'));
});

/**
 * Add a reply to a ticket (stored in notes field).
 * POST /api/support/tickets/:ticketId/reply
 */
export const replyToTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user.id;
  const { content } = req.body;

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  if (ticket.user.toString() !== userId) {
    throw new ApiError(403, 'You do not have access to this ticket');
  }

  if (ticket.status === 'closed') {
    throw new ApiError(400, 'Cannot reply to a closed ticket. Please create a new one.');
  }

  // Use notes array as message thread (customer messages are stored here)
  ticket.notes.push({
    text: `[Customer] ${content.trim()}`,
    addedBy: null, // null = customer (admins have their ObjectId set)
    createdAt: new Date(),
  });

  // Reopen if resolved
  if (ticket.status === 'resolved') {
    ticket.status = 'open';
  }

  await ticket.save();

  res.json(new ApiResponse(200, ticket, 'Reply sent'));
});

/**
 * Close a ticket (by user).
 * PATCH /api/support/tickets/:ticketId/close
 */
export const closeTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user.id;

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  if (ticket.user.toString() !== userId) {
    throw new ApiError(403, 'You do not have access to this ticket');
  }

  ticket.status = 'closed';
  ticket.closedAt = new Date();
  await ticket.save();

  res.json(new ApiResponse(200, ticket, 'Ticket closed'));
});
