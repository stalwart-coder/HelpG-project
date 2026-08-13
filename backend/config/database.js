import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

/**
 * Connect to MongoDB.
 */
export default async function connectDatabase() {
  try {
    const conn = await mongoose.connect(env.mongodb.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('MongoDB connected', {
      host: conn.connection.host,
      port: conn.connection.port,
      name: conn.connection.name,
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
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
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('MongoDB disconnection failed', { error: error.message });
  }
}
