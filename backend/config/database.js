import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';
import { seedDemoData } from '../seeds/demoSeed.js';

let memoryServerInstance = null;

/**
 * Connect to MongoDB with automatic dev fallback and demo seeding.
 */
export default async function connectDatabase() {
  try {
    const conn = await mongoose.connect(env.mongodb.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 45000,
    });

    logger.info('MongoDB connected', {
      host: conn.connection.host,
      port: conn.connection.port,
      name: conn.connection.name,
    });

    // Auto-seed demo data in dev
    if (env.isDev) {
      await seedDemoData();
    }

    return conn;
  } catch (error) {
    if (env.isDev) {
      logger.warn(`Local MongoDB connection failed (${error.message}). Starting embedded MongoMemoryServer for development...`);
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        instance: { dbName: 'helpji' },
      });
      const uri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      });

      logger.info('Embedded MongoDB memory server connected successfully', { uri });
      await seedDemoData();
      return conn;
    }

    logger.error('MongoDB connection failed', { error: error.message });
    throw error;
  }
}

/**
 * Disconnect from MongoDB. Used by seed scripts and graceful shutdown.
 */
export async function disconnectDatabase() {
  try {
    await mongoose.connection.close();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('MongoDB disconnection failed', { error: error.message });
  }
}
