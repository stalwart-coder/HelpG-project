import mongoose from 'mongoose';

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday',
  'friday', 'saturday', 'sunday',
];

const scheduleEntrySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: DAYS_OF_WEEK,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    schedule: {
      type: [scheduleEntrySchema],
      default: DAYS_OF_WEEK.map((day) => ({
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        isActive: day !== 'sunday',
      })),
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    lastToggledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

availabilitySchema.index({ userId: 1 });
availabilitySchema.index({ isAvailable: 1 });

const Availability = mongoose.model('Availability', availabilitySchema);
export { DAYS_OF_WEEK };
export default Availability;

