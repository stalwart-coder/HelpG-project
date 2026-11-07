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

// Trust reverse proxy (Render, Vercel, Nginx, AWS ALB) for accurate client IP detection & rate limiting
app.set('trust proxy', 1);

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  env.cors.frontendUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin === env.cors.frontendUrl ||
        (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        env.isDev
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
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
