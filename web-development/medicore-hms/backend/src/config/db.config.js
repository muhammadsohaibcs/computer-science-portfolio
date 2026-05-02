/**
 * db.config.js
 *
 * Database connection configuration. This file centralizes DB options and
 * explains settings needed for:
 *  - connecting to Atlas (Lab 01)
 *  - enabling transactions (requires replica set; Lab 10)
 *  - using indexes & explain plans (Lab 07 & Lab 08)
 *  - replica set configuration with read preferences and write concerns
 *
 * IMPORTANT:
 * - Put the real connection URI in environment variables (MONGO_URI).
 * - If you plan to use transactions locally, run a local replica set (see replica-setup.md).
 * - For replication features, set ENABLE_REPLICATION=true and configure READ_PREFERENCE and WRITE_CONCERN.
 *
 * See lab manual:
 * - Lab 01 Atlas setup & Compass. :contentReference[oaicite:3]{index=3}
 * - Lab 07 Indexing & Lab 08 Query Optimization (use these options and later call explain()). 
 * 
 * Requirements: 9.1, 9.4, 9.5
 */

const replicationConfig = require('../database/replication-config');



/**
 * Build connection options with optional replication support
 */
function buildConnectionOptions() {
  const baseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Pool size for concurrency — adjust for production (avoid huge pool sizes).
    maxPoolSize: process.env.DB_MAX_POOL_SIZE ? Number(process.env.DB_MAX_POOL_SIZE) : 20,
    // More settings can be tuned based on explain results (see Lab 08)
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  };

  // If replication is enabled, merge replication-specific options
  if (replicationConfig.isReplicationEnabled()) {
    const readPreference = process.env.READ_PREFERENCE || 'strong';
    const writeConcern = process.env.WRITE_CONCERN || 'majority';
    
    const replicationOptions = replicationConfig.getConnectionOptions({
      readPreference,
      writeConcern,
      retryWrites: true,
      serverSelectionTimeoutMS: baseOptions.serverSelectionTimeoutMS,
      heartbeatFrequencyMS: 10000
    });

    // Merge replication options with base options
    // Replication options take precedence for overlapping keys
    return {
      ...baseOptions,
      ...replicationOptions,
      // Preserve base maxPoolSize if not overridden
      maxPoolSize: baseOptions.maxPoolSize
    };
  }

  return baseOptions;
}

module.exports = {
  uri: process.env.MONGO_URI ,
  url: process.env.MONGO_URI ,

  // Mongoose / driver options (with optional replication support)
  options: buildConnectionOptions(),

  // Replication configuration
  replication: {
    enabled: replicationConfig.isReplicationEnabled(),
    readPreference: process.env.READ_PREFERENCE || 'strong',
    writeConcern: process.env.WRITE_CONCERN || 'majority',
    replicaSet: process.env.MONGO_REPLICA_SET || 'rs0'
  },

  // Health checks & transaction readiness
  healthCheck: {
    // If your deployment supports transactions, we check the replica set config
    replicaSetRequiredForTransactions: true,
    // Timeout for checking replica config
    checkTimeoutMs: 3000
  },

  // Index management settings (used by repo / startup script)
  indexes: {
    autoEnsureOnStartup: true,   // set to false in very large clusters; used for dev/testing
    // Recommended indexes for HMS collections (create programmatically on start or via migrations)
    recommended: {
      patients: [
        { key: { 'name': 1 }, options: { name: 'patients_name_idx' } },
        { key: { 'contact.phone': 1 }, options: { name: 'patients_phone_idx' } },
        { key: { createdAt: -1 }, options: { name: 'patients_createdAt_idx' } }
      ],
      appointments: [
        { key: { doctor: 1, appointmentDate: 1 }, options: { name: 'appointments_doctor_date_cidx' } }
      ],
      inventory: [
        { key: { itemCode: 1 }, options: { unique: true, name: 'inventory_itemCode_uidx' } }
      ]
    }
  }

};
