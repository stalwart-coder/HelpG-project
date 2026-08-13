import mongoose from 'mongoose';

const TICKET_STATUSES = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
const TICKET_PRIORITIES = ['low', 'normal', 'high', 'urgent'];
const TICKET_CATEGORIES = [
  'booking_issue',
  'payment_issue',
  'helper_issue',
  'kyc_issue',
  'account_issue',
  'technical_issue',
  'general',
];

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: TICKET_CATEGORIES,
      default: 'general',
    },
    priority: {
      type: String,
      enum: TICKET_PRIORITIES,
      default: 'normal',
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: 'open',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    resolution: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    notes: [
      {
        text: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [
      {
        url: String,
        name: String,
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.pre('validate', function (next) {
  if (!this.ticketId) {
    this.ticketId = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
  next();
});

supportTicketSchema.index({ user: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, assignedTo: 1 });
supportTicketSchema.index({ priority: 1, status: 1 });
supportTicketSchema.index({ ticketId: 1 });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_CATEGORIES };
export default SupportTicket;
