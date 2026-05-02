/**
 * src/server.js
 * Connect to MongoDB, Redis and start the server with comprehensive security
 */

"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const appConfig = require("./config/app.config");
const dbConfig = require("./config/db.config");
const logger = require("./utils/logger");
const { connectRedis, disconnectRedis } = require("./database/redis-connection");

const PORT = process.env.PORT ? Number(process.env.PORT) : (appConfig.port || 4000);

/**
 * Connect to MongoDB using config from /config/db.config.js
 */
async function connectDB() {
  try {
    if (!dbConfig || !dbConfig.url) {
      logger.error("Database URL not configured. Check src/config/db.config.js and .env");
      throw new Error("Missing DB URL");
    }

    // Use Mongoose recommended options with connection pooling
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: dbConfig.options?.maxPoolSize || 20,
      serverSelectionTimeoutMS: dbConfig.options?.serverSelectionTimeoutMS || 5000,
      socketTimeoutMS: dbConfig.options?.socketTimeoutMS || 45000
    };
    
    await mongoose.connect(dbConfig.url, options);

    logger.info("✅ MongoDB connected");
  } catch (err) {
    logger.error("❌ MongoDB connection error:", err);
    // exit so orchestrator (or you) can restart
    process.exit(1);
  }
}

/**
 * Initialize Redis connection (optional - app continues without it)
 */
async function initRedis() {
  try {
    await connectRedis();
  } catch (err) {
    logger.warn("Redis connection failed - continuing without cache:", err.message);
  }
}

async function start() {
  await connectDB();
  await initRedis();

  // Start HTTP server
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server started on port ${PORT} (${process.env.NODE_ENV || 'dev'})`);
    console.log(`Server listening on http://localhost:${PORT}`);
  });

  // Graceful shutdown handlers
  const graceful = async (signal) => {
    try {
      logger.info(`Received ${signal}. Closing server...`);
      server.close(async () => {
        try {
          await mongoose.connection.close();
          logger.info("MongoDB connection closed");
          
          await disconnectRedis();
          logger.info("Redis connection closed");
          
          process.exit(0);
        } catch (err) {
          logger.error("Error during shutdown:", err);
          process.exit(1);
        }
      });
    } catch (err) {
      logger.error("Error during graceful shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => graceful("SIGTERM"));
  process.on("SIGINT", () => graceful("SIGINT"));
}

start();
