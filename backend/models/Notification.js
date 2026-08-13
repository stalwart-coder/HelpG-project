import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'booking_confirmed',
        'booking_cancelled',
        'booking_completed',
        'helper_assigned',
        'payment_received',
        'payment_refunded',
        'review_received',
        'kyc_approved',
        'kyc_rejected',
        'promo_credit',
        'system_alert',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    channel: {
      type: String,
      enum: ['push', 'email', 'sms', 'in_app'],
      default: 'in_app',
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
