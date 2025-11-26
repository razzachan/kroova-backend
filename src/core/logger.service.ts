/**
 * Logger Service using Winston
 * 
 * Provides structured logging for the application with:
 * - Console output (development)
 * - File output (production)
 * - JSON formatting for log aggregation
 * - Error stack traces
 */

import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston about our colors
winston.addColors(colors);

// Determine log level from environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define which transports to use
const transports = [
  // Console transport for development
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => {
          const { timestamp, level, message, ...meta } = info;
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        }
      )
    ),
  }),
  
  // Error log file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: format,
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: format,
  }),
];

// Create logger instance
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Create specialized logging methods
export class Logger {
  /**
   * Log informational message
   */
  static info(message: string, meta?: Record<string, unknown>) {
    logger.info(message, meta);
  }

  /**
   * Log warning message
   */
  static warn(message: string, meta?: Record<string, unknown>) {
    logger.warn(message, meta);
  }

  /**
   * Log error message
   */
  static error(message: string, error?: Error | unknown, meta?: Record<string, unknown>) {
    if (error instanceof Error) {
      logger.error(message, {
        ...meta,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
    } else {
      logger.error(message, { ...meta, error });
    }
  }

  /**
   * Log HTTP request
   */
  static http(message: string, meta?: Record<string, unknown>) {
    logger.http(message, meta);
  }

  /**
   * Log debug message (development only)
   */
  static debug(message: string, meta?: Record<string, unknown>) {
    logger.debug(message, meta);
  }

  /**
   * Log wallet operation
   */
  static wallet(operation: string, userId: string, amount: number, meta?: Record<string, unknown>) {
    logger.info(`Wallet operation: ${operation}`, {
      userId,
      amount,
      ...meta,
    });
  }

  /**
   * Log marketplace operation
   */
  static market(operation: string, userId: string, meta?: Record<string, unknown>) {
    logger.info(`Market operation: ${operation}`, {
      userId,
      ...meta,
    });
  }

  /**
   * Log authentication event
   */
  static auth(event: string, userId?: string, meta?: Record<string, unknown>) {
    logger.info(`Auth event: ${event}`, {
      userId,
      ...meta,
    });
  }
}

export default Logger;
