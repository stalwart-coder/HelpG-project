import winston from 'winston';
import env from '../config/env.js';

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  }),
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: env.logLevel,
  format: env.isProd ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});

logger.exceptions.handle(new winston.transports.Console());
logger.rejections.handle(new winston.transports.Console());

export default logger;
