
/**
 * src/database/mongo-connection.js
 *
 * Mongoose connection module with:
 *  - Automatic index creation (safe & configurable)
 *  - Replica set detection for enabling transactions (Lab 10)
 *  - Health-check helper for startup
 *  - Replica set event handlers for monitoring and failover
 *  - Automatic replica health monitoring
 *
 * Lab mapping:
 *  - Lab 01: Atlas connection & Compass usage. Use the MONGO_URI from .env.
 *  - Lab 06/07/08: create recommended indexes on startup and use explain() in dev to validate.
 *  - Lab 10: check replica set & only enable transactions if supported.
 *
 * Requirements: 9.1, 9.2, 10.1, 10.2
 *
 * See: /mnt/data/3. ADB Lab Manual CSC316 ADB.pdf for examples and step-by-step Atlas instructions. :contentReference[oaicite:6]{index=6}
 */

'use strict';

const mongoose = require('mongoose');
const dbConfig = require('../config/db.config');
const appConfig = require('../config/app.config');
const logger = require('../utils/logger');
const replicaHealthService = require('../services/replica-health.service');
const replicationConfig = require('./replication-config');

const uri = dbConfig.uri;
const options = Object.assign({}, dbConfig.options || {});

// Set up replica set event handlers before connecting
setupReplicaSetEventHandlers();

// connect
mongoose.connect(uri, options).then(() => {
  logger.info({ uri }, 'Mongoose connected');

  // After connection, optionally ensure indexes (careful on large collections)
  if (dbConfig.indexes && dbConfig.indexes.autoEnsureOnStartup) {
    try {
      ensureRecommendedIndexes();
    } catch (err) {
      logger.warn({ err }, 'Failed to auto-ensure indexes at startup');
    }
  }

  // If transactions are enabled in config, verify replica set
  if (appConfig.features.enableTransactions) {
    checkReplicaSetForTransactions().then((ok) => {
      if (!ok) {
        logger.warn('Replica set NOT ready for transactions. Transactions will be disabled at runtime.');
        appConfig.features.enableTransactions = false;
      } else {
        logger.info('Replica set supports transactions.');
      }
    }).catch(err => {
      logger.error({ err }, 'Error checking replica set status');
      // don't crash; transactions will be disabled
      appConfig.features.enableTransactions = false;
    });
  }

  // Start replica health monitoring if replication is enabled
  if (replicationConfig.isReplicationEnabled()) {
    logger.info('Replication enabled, starting health monitoring');
    replicaHealthService.startMonitoring();
  }
}).catch(err => {
  logger.error({ err }, 'Mongoose connection error');
  // Let server startup fail fast — server.js will exit if connection fails.
});

/**
 * Ensure recommended indexes defined in db.config.js
 * NOTE: This is safe for small dev clusters. For large production datasets use a migration mechanism.
 */
function ensureRecommendedIndexes() {
  const rec = dbConfig.indexes && dbConfig.indexes.recommended;
  if (!rec) return;

  // Example for patients
  if (rec.patients && rec.patients.length) {
    const Patient = require('../models/patient.model');
    rec.patients.forEach(idx => {
      logger.info({ idx }, 'Ensuring patients index');
      Patient.collection.createIndex(idx.key, idx.options).catch(err => {
        logger.warn({ err }, 'Could not create patients index (may already exist or be busy)');
      });
    });
  }

  // Appointments
  if (rec.appointments && rec.appointments.length) {
    const Appointment = require('../models/appointment.model');
    rec.appointments.forEach(idx => {
      logger.info({ idx }, 'Ensuring appointments index');
      Appointment.collection.createIndex(idx.key, idx.options).catch(err => {
        logger.warn({ err }, 'Could not create appointments index');
      });
    });
  }

  // Inventory example
  if (rec.inventory && rec.inventory.length) {
    const Inventory = require('../models/inventory.model');
    rec.inventory.forEach(idx => {
      logger.info({ idx }, 'Ensuring inventory index');
      Inventory.collection.createIndex(idx.key, idx.options).catch(err => {
        logger.warn({ err }, 'Could not create inventory index');
      });
    });
  }
}

/**
 * Check whether connected deployment supports transactions (i.e., is a replica set with PRIMARY)
 *
 * Returns: Promise<boolean>
 */
async function checkReplicaSetForTransactions() {
  // skip check if feature disabled
  if (!appConfig.features.enableReplicaChecks) return false;

  const admin = mongoose.connection.db.admin();
  const info = await admin.serverStatus().catch(err => {
    logger.warn({ err }, 'serverStatus unavailable');
    return null;
  });
  // If serverStatus provided, we can inspect replication info
  // But the more reliable method is runCommand({ isMaster: 1 }) or replSetGetStatus
  const isMaster = await mongoose.connection.db.command({ ismaster: 1 }).catch(() => null);
  if (!isMaster) {
    logger.warn('isMaster command not available; assuming no replica set');
    return false;
  }

  // if ismaster has setName it is a replica set member
  if (isMaster.setName) {
    logger.info({ setName: isMaster.setName }, 'Connected to replica set');
    // also ensure we are primary or there is a primary available
    if (isMaster.ismaster || isMaster.ismaster === true) {
      logger.info('This node is primary (can start transactions).');
      return true;
    }
    // if not primary but replica set exists, transactions can still be used by drivers when connected to primary
    // for safety return true to indicate replica set exists (application should still open sessions on primary)
    return true;
  }

  logger.warn('Connected deployment is not a replica set (transactions unavailable).');
  return false;
}

/**
 * Set up replica set event handlers
 * 
 * Monitors connection state changes and replica set topology events
 * Requirements: 9.1, 9.2, 10.1, 10.2
 */
function setupReplicaSetEventHandlers() {
  const connection = mongoose.connection;

  // Event: connected
  // Fired when initial connection is established
  connection.on('connected', () => {
    logger.info({
      host: connection.host,
      port: connection.port,
      name: connection.name
    }, 'MongoDB connection established');
  });

  // Event: disconnected
  // Fired when connection is lost
  connection.on('disconnected', () => {
    logger.warn('MongoDB connection lost');
    
    // Stop health monitoring when disconnected
    if (replicaHealthService.getMonitoringStatus().isMonitoring) {
      logger.info('Stopping replica health monitoring due to disconnection');
      replicaHealthService.stopMonitoring();
    }
  });

  // Event: reconnected
  // Fired when connection is re-established after being lost
  connection.on('reconnected', () => {
    logger.info('MongoDB connection re-established');
    
    // Restart health monitoring if replication is enabled
    if (replicationConfig.isReplicationEnabled() && 
        !replicaHealthService.getMonitoringStatus().isMonitoring) {
      logger.info('Restarting replica health monitoring after reconnection');
      replicaHealthService.startMonitoring();
    }
  });

  // Event: error
  // Fired when an error occurs on the connection
  connection.on('error', (err) => {
    logger.error({ 
      err,
      code: err.code,
      name: err.name 
    }, 'MongoDB connection error');
  });

  // Event: fullsetup (replica set specific)
  // Fired when all servers in the replica set are connected
  connection.on('fullsetup', () => {
    logger.info('All replica set members connected (fullsetup event)');
  });

  // Event: all (replica set specific)
  // Fired when all servers specified in the connection string are connected
  connection.on('all', () => {
    logger.info('All specified MongoDB servers connected (all event)');
  });

  // Additional replica set topology events
  if (mongoose.connection.client) {
    const client = mongoose.connection.client;
    
    // Topology events for replica set monitoring
    client.on('serverDescriptionChanged', (event) => {
      logger.debug({
        address: event.address,
        previousType: event.previousDescription.type,
        newType: event.newDescription.type
      }, 'Replica set server description changed');
    });

    client.on('topologyDescriptionChanged', (event) => {
      logger.debug({
        previousType: event.previousDescription.type,
        newType: event.newDescription.type,
        servers: event.newDescription.servers.size
      }, 'Replica set topology changed');
    });
  }
}

/**
 * Handle graceful shutdown
 * 
 * Stops monitoring and closes database connections cleanly
 */
async function gracefulShutdown(signal) {
  logger.info({ signal }, 'Received shutdown signal, closing MongoDB connection');
  
  try {
    // Stop replica health monitoring
    if (replicaHealthService.getMonitoringStatus().isMonitoring) {
      logger.info('Stopping replica health monitoring');
      replicaHealthService.stopMonitoring();
    }
    
    // Close mongoose connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed successfully');
    
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error during graceful shutdown');
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception');
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled promise rejection');
});

module.exports = mongoose;

