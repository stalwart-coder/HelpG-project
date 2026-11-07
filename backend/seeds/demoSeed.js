import User from '../models/User.js';
import HelperProfile from '../models/HelperProfile.js';
import Admin from '../models/Admin.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Wallet from '../models/Wallet.js';
import logger from '../utils/logger.js';

export async function seedDemoData() {
  try {
    // 1. Seed Admin
    const existingAdmin = await Admin.findOne({ email: 'admin@helpji.com' });
    if (!existingAdmin) {
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@helpji.com',
        password: 'Admin@123',
        role: 'super_admin',
      });
      logger.info('Demo Super Admin created: admin@helpji.com / Admin@123');
    }

    // 2. Seed Customer
    let customer = await User.findOne({ email: 'customer@helpji.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Aarav Sharma (Customer)',
        email: 'customer@helpji.com',
        phone: '+919876543210',
        password: 'Password@123',
        role: 'customer',
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
      });
      logger.info('Demo Customer created: customer@helpji.com / Password@123');
    }

    // 3. Seed Helper
    let helper = await User.findOne({ email: 'helper@helpji.com' });
    if (!helper) {
      helper = await User.create({
        name: 'Ramesh Kumar (Pro Helper)',
        email: 'helper@helpji.com',
        phone: '+919876543211',
        password: 'Password@123',
        role: 'helper',
        isEmailVerified: true,
        isPhoneVerified: true,
        isKycVerified: true,
        isActive: true,
      });
      logger.info('Demo Helper created: helper@helpji.com / Password@123');
    }

    // 4. Seed Helper Profile
    let helperProfile = await HelperProfile.findOne({ userId: helper._id });
    if (!helperProfile) {
      helperProfile = await HelperProfile.create({
        userId: helper._id,
        gender: 'male',
        kycStatus: 'verified',
        isAvailable: true,
        averageRating: 4.9,
        totalReviews: 36,
        totalCompletedJobs: 118,
        totalEarnings: 38500,
        serviceAreas: [
          { name: 'Koramangala, Bengaluru', radiusKm: 10, isActive: true },
          { name: 'HSR Layout, Bengaluru', radiusKm: 8, isActive: true },
          { name: 'Indiranagar, Bengaluru', radiusKm: 12, isActive: true },
        ],
        languages: ['English', 'Hindi', 'Kannada'],
        experienceYears: 4,
        bio: 'Professional local helper with 4+ years of experience in rapid home errands, laundry, car detailing, and appliance maintenance.',
      });
      logger.info('Demo Helper Profile verified & active');
    }

    // 5. Seed Helper Wallet
    const existingWallet = await Wallet.findOne({ userId: helper._id });
    if (!existingWallet) {
      await Wallet.create({
        userId: helper._id,
        balance: 4250,
        totalEarned: 38500,
        totalWithdrawn: 34250,
        isActive: true,
      });
    }

    // 6. Seed Services Catalog
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany([
        {
          name: 'Home Cleaning & Tidying',
          category: 'cleaning',
          slug: 'home-cleaning',
          description: 'Deep and regular residential tidying, kitchen and washroom sanitation.',
          basePrice: 499,
          unit: 'session',
          isActive: true,
          tags: ['cleaning', 'home', 'sanitization'],
        },
        {
          name: 'Express Steam Ironing',
          category: 'iron',
          slug: 'express-ironing',
          description: 'Quick door-to-door garment steam pressing and fold delivery.',
          basePrice: 199,
          unit: 'session',
          isActive: true,
          tags: ['ironing', 'laundry', 'clothes'],
        },
        {
          name: 'Eco Car & Bike Detail Wash',
          category: 'vehicle',
          slug: 'car-bike-wash',
          description: 'Water-efficient foam wash, interior vacuuming, and dashboard polish.',
          basePrice: 349,
          unit: 'session',
          isActive: true,
          tags: ['car', 'bike', 'wash', 'vehicle'],
        },
        {
          name: 'Medicine & Urgent Grocery Pickup',
          category: 'groceries',
          slug: 'urgent-errands',
          description: 'Hyperlocal 20-minute pickup & doorstep drop-off from local stores.',
          basePrice: 99,
          unit: 'session',
          isActive: true,
          tags: ['errand', 'delivery', 'pharmacy', 'groceries'],
        },
        {
          name: 'Security & Premises Guard',
          category: 'guard',
          slug: 'premises-guard',
          description: 'Trained neighborhood security and event access monitoring.',
          basePrice: 799,
          unit: 'session',
          isActive: true,
          tags: ['security', 'guard', 'premises'],
        },
      ]);
      logger.info('Demo Services Catalog populated');
    }

    // 7. Seed Sample Bookings
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0) {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const pastDate = new Date(Date.now() - 48 * 60 * 60 * 1000);

      // Active In-Progress Booking
      const activeBooking = await Booking.create({
        customer: customer._id,
        helper: helper._id,
        category: 'iron',
        title: 'Express Steam Press (15 Garments)',
        description: 'Need urgent pressing for office shirts and formal trousers.',
        location: '4th Block, Koramangala, Bengaluru',
        scheduledAt: tomorrow,
        status: 'in_progress',
        price: 299,
        platformFee: 15,
        totalAmount: 314,
        timeline: [
          { status: 'pending', timestamp: new Date(Date.now() - 3600000), note: 'Booking created', by: 'customer' },
          { status: 'confirmed', timestamp: new Date(Date.now() - 1800000), note: 'Accepted by helper', by: 'helper' },
          { status: 'in_progress', timestamp: new Date(), note: 'Task started at location', by: 'helper' },
        ],
      });

      // Pending Booking (Available for any helper)
      await Booking.create({
        customer: customer._id,
        category: 'groceries',
        title: 'Urgent Pharmacy Pickup (Apollo Pharmacy)',
        description: 'Pick up prescription medicines from 5th Block and deliver to flat 302.',
        location: '5th Block, Koramangala, Bengaluru',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'pending',
        price: 149,
        platformFee: 10,
        totalAmount: 159,
        timeline: [
          { status: 'pending', timestamp: new Date(), note: 'Booking created and waiting for helper', by: 'customer' },
        ],
      });

      // Completed Booking with Review
      const completedBooking = await Booking.create({
        customer: customer._id,
        helper: helper._id,
        category: 'vehicle',
        title: 'Premium Sedan Foam Wash & Vacuum',
        description: 'Full exterior foam wash and interior vacuum cleaning.',
        location: 'HSR Layout Sector 2, Bengaluru',
        scheduledAt: pastDate,
        status: 'completed',
        price: 499,
        platformFee: 25,
        totalAmount: 524,
        timeline: [
          { status: 'pending', timestamp: pastDate, note: 'Booking created', by: 'customer' },
          { status: 'confirmed', timestamp: pastDate, note: 'Accepted by helper', by: 'helper' },
          { status: 'in_progress', timestamp: pastDate, note: 'Wash started', by: 'helper' },
          { status: 'completed', timestamp: pastDate, note: 'Service completed to satisfaction', by: 'helper' },
        ],
      });

      await Review.create({
        bookingId: completedBooking._id,
        userId: customer._id,
        helperId: helper._id,
        rating: 5,
        comment: 'Exceptional service! Ramesh arrived on time, was extremely polite, and cleaned the car spotless.',
        tags: ['Punctual', 'Great Quality', 'Polite'],
        isVerified: true,
      });

      logger.info('Demo Bookings & Reviews populated');
    }

    logger.info('Demo seed finished successfully');
  } catch (error) {
    logger.error('Demo seed error:', { error: error.message });
  }
}
