/**
 * Global test teardown.
 * Ensures MongoDB connection is closed and memory server stops.
 */
import mongoose from 'mongoose';

export default async function globalTeardown() {
  await mongoose.disconnect();
}
