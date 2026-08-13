import mongoose from 'mongoose';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';

/**
 * GET /api/health
 * Returns server health status.
 */
const getHealth = asyncHandler(async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.nodeEnv,
    mongodb: {
      status: dbStatusMap[dbState] || 'unknown',
      readyState: dbState,
    },
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
    },
    version: process.version,
    platform: process.platform,
  };

  const statusCode = dbState === 1 ? 200 : 503;
  return new ApiResponse(statusCode, healthData).send(res);
});

export { getHealth };
