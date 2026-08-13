import mongoose from 'mongoose';

const AUDIT_ACTIONS = [
  'admin_login',
  'admin_logout',
  'user_blocked',
  'user_unblocked',
  'user_deleted',
  'helper_approved',
  'helper_suspended',
  'helper_unsuspended',
  'kyc_approved',
  'kyc_rejected',
  'booking_cancelled',
  'booking_reassigned',
  'refund_processed',
  'coupon_created',
  'coupon_edited',
  'coupon_disabled',
  'coupon_deleted',
  'ticket_assigned',
  'ticket_resolved',
  'ticket_closed',
  'support_note_added',
  'payment_report_exported',
  'settings_updated',
];

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: AUDIT_ACTIONS,
      required: true,
    },
    resource: {
      type: {
        type: String,
        enum: ['user', 'helper', 'booking', 'kyc', 'payment', 'coupon', 'ticket', 'system'],
        required: true,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      description: {
        type: String,
        default: '',
        maxlength: 500,
      },
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ admin: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ 'resource.type': 1, 'resource.id': 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export { AUDIT_ACTIONS };
export default AuditLog;
