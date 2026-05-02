/**
 * cors.middleware.js
 * 
 * CORS configuration middleware
 * Controls cross-origin resource sharing
 */

const cors = require('cors');
const logger = require('../utils/logger');

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  'http://localhost:3000', // React default
  'http://localhost:3001', // Alternative React port
  'http://localhost:5173', // Vite default
  'http://localhost:5174',
  'http://127.0.0.1:5500', // Live Server for test HTML
  'http://localhost:5500',  // Live Server alternative
  'null' // For local file:// protocol
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
};

module.exports = cors(corsOptions);
