import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import SupportTicket from '../models/SupportTicket.js';
import logger from '../utils/logger.js';

function formatTicketResponse(ticket) {
  if (!ticket) return null;
  const ticketObj = ticket.toObject ? ticket.toObject() : { ...ticket };
  const replies = [
    {
      _id: `initial-${ticketObj._id || ticketObj.ticketId}`,
      content: ticketObj.description,
      from: 'user',
      isStaff: false,
      createdAt: ticketObj.createdAt,
    },
  ];

  if (Array.isArray(ticketObj.notes)) {
    ticketObj.notes.forEach((note) => {
      const isCustomer = note.text?.startsWith('[Customer]');
      replies.push({
        _id: note._id || String(Math.random()),
        content: isCustomer ? note.text.replace(/^\[Customer\]\s*/, '') : note.text,
        from: isCustomer ? 'user' : 'support',
        isStaff: !isCustomer,
        createdAt: note.createdAt,
      });
    });
  }

  ticketObj.replies = replies;
  return ticketObj;
}

/**
 * Create a new support ticket.
 * POST /api/support/tickets
 */
export const createTicket = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { subject, description, category, bookingId, priority } = req.body;

  let validBooking = null;
  if (bookingId && typeof bookingId === 'string' && bookingId.match(/^[0-9a-fA-F]{24}$/)) {
    validBooking = bookingId;
  }

  const normalizedCategory = category || 'general';
  const normalizedPriority = priority === 'medium' ? 'medium' : (priority || 'normal');

  const ticket = await SupportTicket.create({
    user: userId,
    subject,
    description,
    category: normalizedCategory,
    booking: validBooking,
    priority: normalizedPriority,
    status: 'open',
  });

  logger.info('Support ticket created', { ticketId: ticket.ticketId, userId });

  const formatted = formatTicketResponse(ticket);
  res.status(201).json(new ApiResponse(201, formatted, 'Support ticket created successfully'));
});

/**
 * Get all tickets for the authenticated user.
 * GET /api/support/tickets
 */
export const getMyTickets = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const skip = parseInt(req.query.skip, 10) || 0;

  const filter = { user: userId, isActive: true };
  if (req.query.status) filter.status = req.query.status;

  const rawTickets = await SupportTicket.find(filter)
    .populate('booking', 'title category scheduledAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await SupportTicket.countDocuments(filter);
  const tickets = rawTickets.map(formatTicketResponse);

  res.json(new ApiResponse(200, { tickets, total }, 'Tickets fetched'));
});

/**
 * Get a single ticket by ID.
 * GET /api/support/tickets/:ticketId
 */
export const getTicketById = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user.id || req.user._id;

  // ticketId can be MongoDB _id or human-readable TKT-xxx
  const ticket = await SupportTicket.findOne({
    $or: [
      { _id: ticketId.match(/^[0-9a-fA-F]{24}$/) ? ticketId : null },
      { ticketId },
    ],
  }).populate('booking', 'title category scheduledAt status');

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  if (ticket.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not have access to this ticket');
  }

  const formatted = formatTicketResponse(ticket);
  res.json(new ApiResponse(200, formatted, 'Ticket fetched'));
});

/**
 * Add a reply to a ticket (stored in notes field).
 * POST /api/support/tickets/:ticketId/reply
 */
export const replyToTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user.id || req.user._id;
  const { content } = req.body;

  const ticket = await SupportTicket.findOne({
    $or: [
      { _id: ticketId.match(/^[0-9a-fA-F]{24}$/) ? ticketId : null },
      { ticketId },
    ],
  });

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  if (ticket.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not have access to this ticket');
  }

  if (ticket.status === 'closed') {
    throw new ApiError(400, 'Cannot reply to a closed ticket. Please create a new one.');
  }

  // Use notes array as message thread
  ticket.notes.push({
    text: `[Customer] ${content.trim()}`,
    addedBy: null, // null = customer
    createdAt: new Date(),
  });

  // Reopen if resolved
  if (ticket.status === 'resolved') {
    ticket.status = 'open';
  }

  await ticket.save();

  const formatted = formatTicketResponse(ticket);
  res.json(new ApiResponse(200, formatted, 'Reply sent'));
});

/**
 * Close a ticket (by user).
 * PATCH /api/support/tickets/:ticketId/close
 */
export const closeTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user.id || req.user._id;

  const ticket = await SupportTicket.findOne({
    $or: [
      { _id: ticketId.match(/^[0-9a-fA-F]{24}$/) ? ticketId : null },
      { ticketId },
    ],
  });

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  if (ticket.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not have access to this ticket');
  }

  ticket.status = 'closed';
  ticket.closedAt = new Date();
  await ticket.save();

  const formatted = formatTicketResponse(ticket);
  res.json(new ApiResponse(200, formatted, 'Ticket closed'));
});
