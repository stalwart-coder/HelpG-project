import mongoose from 'mongoose';

const serviceAreaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Area name is required'],
      trim: true,
      maxlength: [100, 'Area name must not exceed 100 characters'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (val) {
            return val.length === 2 &&
              val[0] >= -180 && val[0] <= 180 &&
              val[1] >= -90 && val[1] <= 90;
          },
          message: 'Coordinates must be [longitude, latitude] within valid ranges',
        },
      },
    },
    radiusKm: {
      type: Number,
      required: true,
      min: [1, 'Radius must be at least 1 km'],
      max: [50, 'Radius must not exceed 50 km'],
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

serviceAreaSchema.index({ userId: 1 });
serviceAreaSchema.index({ location: '2dsphere' });

const ServiceArea = mongoose.model('ServiceArea', serviceAreaSchema);
export default ServiceArea;

