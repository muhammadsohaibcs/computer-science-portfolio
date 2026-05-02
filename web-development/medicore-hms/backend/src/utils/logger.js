/**
 * logger.js
 *
 * Winston-based logger with console and file transports.
 * In production you may want to ship logs to ELK / Datadog.
 */

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, json } = format;
const path = require('path');

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const m = typeof message === 'object' ? JSON.stringify(message) : message;
  const extra = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `${timestamp} [${level}]: ${m} ${extra}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), json()),
  transports: [
    new transports.File({ filename: path.join('logs','error.log'), level: 'error' }),
    new transports.File({ filename: path.join('logs','combined.log') })
  ]
});

// During development, log to console with colors & readable format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(colorize(), timestamp(), logFormat)
  }));
}

module.exports = logger;