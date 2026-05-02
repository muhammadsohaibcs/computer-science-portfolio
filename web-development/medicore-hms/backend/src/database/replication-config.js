/**
 * Replica Set Configuration and Management Utilities
 * 
 * This module provides configuration for MongoDB replica sets including:
 * - Read preferences for controlling read routing
 * - Write concerns for controlling write acknowledgment
 * - Connection options for replica set deployments
 * - Initialization commands for local and Atlas setups
 * 
 * Requirements: 9.3, 9.4, 9.5
 */

/**
 * Read Preference Configurations
 * 
 * Controls where read operations are routed in a replica set
 */
const READ_PREFERENCES = {
  // Strong consistency: always read from primary
  strong: {
    mode: 'primary',
    description: 'Read from primary only. Guarantees strong consistency.',
    useCase: 'Critical reads requiring latest data (e.g., financial transactions, user authentication)'
  },
  
  // Eventual consistency: prefer secondary, fallback to primary
  eventual: {
    mode: 'secondaryPreferred',
    description: 'Prefer secondary nodes, fallback to primary if no secondary available.',
    useCase: 'Read-heavy operations that can tolerate slight staleness (e.g., reports, dashboards)'
  },
  
  // Lowest latency: read from nearest node
  nearest: {
    mode: 'nearest',
    description: 'Read from the node with lowest network latency.',
    useCase: 'Geographically distributed applications prioritizing response time'
  }
};

/**
 * Write Concern Configurations
 * 
 * Controls acknowledgment requirements for write operations
 */
const WRITE_CONCERNS = {
  // Majority: wait for majority of replica set members
  majority: {
    w: 'majority',
    j: true,
    wtimeout: 5000,
    description: 'Wait for write to be acknowledged by majority of replica set members with journal.',
    useCase: 'Critical writes requiring durability (e.g., patient records, billing)'
  },
  
  // Acknowledged: wait for primary acknowledgment only
  acknowledged: {
    w: 1,
    j: true,
    wtimeout: 3000,
    description: 'Wait for primary node acknowledgment with journal.',
    useCase: 'Standard writes balancing performance and durability'
  },
  
  // Unacknowledged: fire and forget (not recommended for production)
  unacknowledged: {
    w: 0,
    j: false,
    description: 'No acknowledgment required. Fastest but least safe.',
    useCase: 'Non-critical writes like logging, analytics (use with caution)'
  }
};

/**
 * Replica Set Initialization Commands
 */
const INITIALIZATION_COMMANDS = {
  // Local development setup (single machine, multiple ports)
  local: {
    description: 'Initialize a local replica set for development',
    prerequisites: [
      'MongoDB installed locally',
      'Three MongoDB instances running on ports 27017, 27018, 27019',
      'Data directories created for each instance'
    ],
    steps: [
      {
        step: 1,
        description: 'Start MongoDB instances',
        commands: [
          'mongod --replSet rs0 --port 27017 --dbpath /data/db1 --bind_ip localhost',
          'mongod --replSet rs0 --port 27018 --dbpath /data/db2 --bind_ip localhost',
          'mongod --replSet rs0 --port 27019 --dbpath /data/db3 --bind_ip localhost'
        ]
      },
      {
        step: 2,
        description: 'Connect to primary and initialize replica set',
        shell: 'mongosh --port 27017',
        commands: [
          `rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})`
        ]
      },
      {
        step: 3,
        description: 'Verify replica set status',
        commands: ['rs.status()']
      }
    ],
    connectionString: 'mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0'
  },
  
  // MongoDB Atlas setup (cloud-hosted)
  atlas: {
    description: 'Configure MongoDB Atlas replica set',
    prerequisites: [
      'MongoDB Atlas account created',
      'Cluster deployed (M0 free tier or higher)',
      'Network access configured (IP whitelist)',
      'Database user created with appropriate permissions'
    ],
    steps: [
      {
        step: 1,
        description: 'Atlas automatically configures replica sets',
        note: 'Atlas clusters are replica sets by default (minimum 3 nodes)'
      },
      {
        step: 2,
        description: 'Get connection string from Atlas dashboard',
        location: 'Clusters > Connect > Connect your application'
      },
      {
        step: 3,
        description: 'Configure connection string in application',
        example: 'mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority'
      }
    ],
    connectionString: 'mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority',
    notes: [
      'Atlas handles replica set configuration automatically',
      'Default write concern is majority',
      'Automatic failover is enabled by default',
      'Use connection string from Atlas dashboard'
    ]
  }
};

/**
 * Get connection options for replica set deployment
 * 
 * @param {Object} config - Configuration options
 * @param {string} config.readPreference - Read preference mode (strong, eventual, nearest)
 * @param {string} config.writeConcern - Write concern level (majority, acknowledged, unacknowledged)
 * @param {boolean} config.retryWrites - Enable automatic retry of write operations
 * @param {number} config.serverSelectionTimeoutMS - Timeout for server selection
 * @param {number} config.heartbeatFrequencyMS - Frequency of replica set health checks
 * @returns {Object} MongoDB connection options
 */
function getConnectionOptions(config = {}) {
  const {
    readPreference = 'strong',
    writeConcern = 'majority',
    retryWrites = true,
    serverSelectionTimeoutMS = 30000,
    heartbeatFrequencyMS = 10000
  } = config;
  
  // Validate read preference
  if (!READ_PREFERENCES[readPreference]) {
    throw new Error(
      `Invalid read preference: ${readPreference}. Valid options: ${Object.keys(READ_PREFERENCES).join(', ')}`
    );
  }
  
  // Validate write concern
  if (!WRITE_CONCERNS[writeConcern]) {
    throw new Error(
      `Invalid write concern: ${writeConcern}. Valid options: ${Object.keys(WRITE_CONCERNS).join(', ')}`
    );
  }
  
  const readPrefConfig = READ_PREFERENCES[readPreference];
  const writeConcernConfig = WRITE_CONCERNS[writeConcern];
  
  return {
    // Replica set options
    replicaSet: process.env.MONGO_REPLICA_SET || 'rs0',
    
    // Read preference
    readPreference: readPrefConfig.mode,
    
    // Write concern
    w: writeConcernConfig.w,
    journal: writeConcernConfig.j,
    wtimeout: writeConcernConfig.wtimeout,
    
    // Retry configuration
    retryWrites,
    retryReads: true,
    
    // Server selection and monitoring
    serverSelectionTimeoutMS,
    heartbeatFrequencyMS,
    
    // Connection pool settings
    maxPoolSize: 10,
    minPoolSize: 2,
    
    // Timeouts
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    
    // Additional options for replica sets
    readConcern: { level: 'majority' },
    
    // Metadata
    appName: 'HMS-Backend',
    
    // Enable monitoring events
    monitorCommands: process.env.NODE_ENV === 'development'
  };
}

/**
 * Get initialization commands for a specific environment
 * 
 * @param {string} environment - Environment type (local or atlas)
 * @returns {Object} Initialization commands and instructions
 */
function getInitializationCommands(environment = 'local') {
  if (!INITIALIZATION_COMMANDS[environment]) {
    throw new Error(
      `Invalid environment: ${environment}. Valid options: ${Object.keys(INITIALIZATION_COMMANDS).join(', ')}`
    );
  }
  
  return INITIALIZATION_COMMANDS[environment];
}

/**
 * Get read preference configuration
 * 
 * @param {string} preference - Read preference name
 * @returns {Object} Read preference configuration
 */
function getReadPreference(preference = 'strong') {
  if (!READ_PREFERENCES[preference]) {
    throw new Error(
      `Invalid read preference: ${preference}. Valid options: ${Object.keys(READ_PREFERENCES).join(', ')}`
    );
  }
  
  return READ_PREFERENCES[preference];
}

/**
 * Get write concern configuration
 * 
 * @param {string} concern - Write concern name
 * @returns {Object} Write concern configuration
 */
function getWriteConcern(concern = 'majority') {
  if (!WRITE_CONCERNS[concern]) {
    throw new Error(
      `Invalid write concern: ${concern}. Valid options: ${Object.keys(WRITE_CONCERNS).join(', ')}`
    );
  }
  
  return WRITE_CONCERNS[concern];
}

/**
 * Check if replication is enabled
 * 
 * @returns {boolean} True if replication is enabled
 */
function isReplicationEnabled() {
  return process.env.ENABLE_REPLICATION === 'true';
}

module.exports = {
  READ_PREFERENCES,
  WRITE_CONCERNS,
  INITIALIZATION_COMMANDS,
  getConnectionOptions,
  getInitializationCommands,
  getReadPreference,
  getWriteConcern,
  isReplicationEnabled
};
