import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { createServer } from 'http';
import { fileURLToPath } from 'url';

import env from './config/env.js';
import logger from './utils/logger.js';
import connectDatabase from './config/database.js';
import apiRoutes from './routes/apiRoutes.js';
import { errorConverter, errorHandler } from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { sanitizeInput } from './middleware/sanitize.js';
import { initSocketServer } from './socketServer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Graceful shutdown helper ────────────────────────────────────────────────
let server;

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  if (server) server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  if (server) server.close(() => process.exit(0));
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: reason?.message || reason });
});

// ── Express app setup ────────────────────────────────────────────────────────
const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.cors.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ── Body parsing (reduced limits for security) ───────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ── XSS Sanitization ─────────────────────────────────────────────────────────
app.use(sanitizeInput);

// ── Cookie parsing ───────────────────────────────────────────────────────────
app.use(cookieParser());

// ── HTTP request logging ─────────────────────────────────────────────────────
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// ── Rate limiting ────────────────────────────────────────────────────────────
app.use(globalLimiter);

// ── Static files (uploaded assets) ───────────────────────────────────────────
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null,
  });
});

// ── Error handling ───────────────────────────────────────────────────────────
app.use(errorConverter);
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Create HTTP server and attach Socket.IO
    const httpServer = createServer(app);
    initSocketServer(httpServer);

    httpServer.listen(env.port, () => {
      logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
      logger.info(`Frontend URL: ${env.cors.frontendUrl}`);
      logger.info(`Health check: http://localhost:${env.port}/api/health`);
    });

    server = httpServer;
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();

export default app;
