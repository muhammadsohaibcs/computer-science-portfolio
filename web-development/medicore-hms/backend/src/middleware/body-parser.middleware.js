/**
 * body-parser.middleware.js
 * 
 * Configure body parsing with size limits to prevent DoS attacks
 */

const express = require('express');

// JSON body parser with size limit
const jsonParser = express.json({
  limit: '10mb', // Limit request body size
  strict: true,  // Only parse arrays and objects
  verify: (req, res, buf, encoding) => {
    // Store raw body for signature verification if needed
    req.rawBody = buf.toString(encoding || 'utf8');
  }
});

// URL-encoded body parser with size limit
const urlencodedParser = express.urlencoded({
  limit: '10mb',
  extended: true,
  parameterLimit: 10000 // Limit number of parameters
});

module.exports = {
  jsonParser,
  urlencodedParser
};
