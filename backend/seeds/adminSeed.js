/**
 * Admin Seed Script
 * Run: node seeds/adminSeed.js
 */
import Admin from '../models/Admin.js';
import connectDatabase, { disconnectDatabase } from '../config/database.js';
import logger from '../utils/logger.js';

const ADMIN_SEEDS = [
  {
    name: 'Super Admin',
    email: 'admin@helpji.com',
    password: 'Admin@123',
    role: 'super_admin',
  },
  {
    name: 'Operations Manager',
    email: 'operations@helpji.com',
    password: 'Admin@123',
    role: 'operations_manager',
  },
  {
    name: 'Customer Support',
    email: 'support@helpji.com',
    password: 'Admin@123',
    role: 'customer_support',
  },
  {
    name: 'Finance Manager',
    email: 'finance@helpji.com',
    password: 'Admin@123',
    role: 'finance_manager',
  },
  {
    name: 'KYC Reviewer',
    email: 'kyc@helpji.com',
    password: 'Admin@123',
    role: 'kyc_reviewer',
  },
];

async function seedAdmins() {
  try {
    await connectDatabase();
    logger.info('Connected to MongoDB');

    for (const adminData of ADMIN_SEEDS) {
      const existing = await Admin.findOne({ email: adminData.email });
      if (existing) {
        logger.info(`Admin already exists: ${adminData.email}`);
        continue;
      }
      await Admin.create(adminData);
      logger.info(`Admin created: ${adminData.email} (${adminData.role})`);
    }

    logger.info('Admin seeding completed');
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('Admin seeding failed', { error: error.message });
    await disconnectDatabase();
    process.exit(1);
  }
}

seedAdmins();
