/**
 * Test database helper.
 * Provides setup/teardown for MongoDB Memory Server.
 * Each test file should import and use these in beforeAll/afterAll.
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

/**
 * Start an in-memory MongoDB and connect.
 * Call in beforeAll() of each test file.
 */
export async function connectTestDb() {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'test',
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });
  // Verify connection is ready
  await mongoose.connection.db.admin().ping();
}

/**
 * Disconnect and stop the in-memory MongoDB.
 * Call in afterAll() of each test file.
 */
export async function disconnectTestDb() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

/**
 * Clear all collections.
 * Call in beforeEach() of each test file if needed.
 */
export async function clearTestDb() {
  if (mongoose.connection.readyState !== 1) return;
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
