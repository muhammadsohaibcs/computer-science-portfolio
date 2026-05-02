# MongoDB Replica Set Setup Guide

## Overview

This guide provides comprehensive instructions for setting up and configuring MongoDB replica sets for the Hospital Management System (HMS). Replica sets provide high availability, automatic failover, and data redundancy through replication.

**Benefits of Replica Sets:**
- **High Availability**: Automatic failover when primary node fails
- **Data Redundancy**: Multiple copies of data across nodes
- **Read Scalability**: Distribute read operations across secondary nodes
- **Disaster Recovery**: Point-in-time recovery and backup capabilities
- **Transaction Support**: ACID transactions require replica sets

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Local Development Setup](#local-development-setup)
3. [MongoDB Atlas Setup](#mongodb-atlas-setup)
4. [Application Configuration](#application-configuration)
5. [Read Preferences](#read-preferences)
6. [Write Concerns](#write-concerns)
7. [Usage Examples](#usage-examples)
8. [Monitoring and Health Checks](#monitoring-and-health-checks)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The HMS uses a MongoDB replica set architecture with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Replica Set Architecture                │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         MongoDB Atlas (Cloud) - PRIMARY            │    │
│  │  - Handles all write operations                    │    │
│  │  - Serves strong consistency reads                 │    │
│  │  - Replicates to secondary nodes                   │    │
│  └────────────────┬───────────────────────────────────┘    │
│                   │                                         │
│                   │ Replication (Oplog)                     │
│                   ▼                                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │      Local MongoDB Instance - SECONDARY            │    │
│  │  - Read-only replica for local development         │    │
│  │  - Automatic sync from Atlas primary               │    │
│  │  - Fallback for read operations                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Replica Set Components

- **Primary Node**: Receives all write operations and replicates changes to secondaries
- **Secondary Nodes**: Maintain copies of primary's data set and can serve read operations
- **Arbiter** (optional): Participates in elections but doesn't hold data

---

## Local Development Setup

### Prerequisites

- MongoDB installed locally (version 4.4 or higher)
- Sufficient disk space for multiple data directories
- Administrative/root access to create directories

### Step 1: Create Data Directories

Create separate data directories for each replica set member:

```bash
# Linux/macOS
mkdir -p /data/db1 /data/db2 /data/db3

# Windows (PowerShell)
New-Item -ItemType Directory -Path C:\data\db1
New-Item -ItemType Directory -Path C:\data\db2
New-Item -ItemType Directory -Path C:\data\db3
```

### Step 2: Start MongoDB Instances

Start three MongoDB instances on different ports:

**Terminal 1 - Primary (Port 27017):**
```bash
mongod --replSet rs0 --port 27017 --dbpath /data/db1 --bind_ip localhost
```

**Terminal 2 - Secondary (Port 27018):**
```bash
mongod --replSet rs0 --port 27018 --dbpath /data/db2 --bind_ip localhost
```

**Terminal 3 - Secondary (Port 27019):**
```bash
mongod --replSet rs0 --port 27019 --dbpath /data/db3 --bind_ip localhost
```

**Windows Users:** Replace `/data/db1` with `C:\data\db1`, etc.

### Step 3: Initialize Replica Set

Connect to the primary instance and initialize the replica set:

```bash
# Connect to MongoDB shell
mongosh --port 27017
```

In the MongoDB shell, run:

```javascript
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})
```

Expected output:
```javascript
{ ok: 1 }
```

### Step 4: Verify Replica Set Status

Check the replica set status:

```javascript
rs.status()
```

Look for:
- One member with `stateStr: "PRIMARY"`
- Two members with `stateStr: "SECONDARY"`
- All members with `health: 1`

### Step 5: Configure Application

Update your `.env` file:

```env
# Local replica set connection string
MONGO_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/hms?replicaSet=rs0

# Enable replication features
ENABLE_REPLICATION=true
READ_PREFERENCE=strong
WRITE_CONCERN=majority
```

---

## MongoDB Atlas Setup

MongoDB Atlas automatically configures replica sets for all clusters, making setup much simpler.

### Prerequisites

- MongoDB Atlas account (free tier available)
- Network access configured (IP whitelist)
- Database user created

### Step 1: Create Atlas Cluster

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **"Build a Database"**
3. Choose cluster tier:
   - **M0 (Free)**: 3-node replica set, 512MB storage
   - **M10+**: Production-ready with more resources
4. Select cloud provider and region
5. Click **"Create Cluster"**

**Note:** Atlas automatically creates a 3-node replica set. You don't need to configure replication manually.

### Step 2: Configure Network Access

1. Navigate to **Network Access** in the left sidebar
2. Click **"Add IP Address"**
3. Options:
   - **Add Current IP Address**: For development
   - **Allow Access from Anywhere** (`0.0.0.0/0`): For testing (not recommended for production)
   - **Add Specific IP**: For production servers

### Step 3: Create Database User

1. Navigate to **Database Access**
2. Click **"Add New Database User"**
3. Choose authentication method (Username/Password recommended)
4. Set username and password
5. Assign privileges:
   - **Read and write to any database**: For application users
   - **Atlas admin**: For administrative tasks
6. Click **"Add User"**

### Step 4: Get Connection String

1. Navigate to **Databases** (Clusters view)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select driver: **Node.js** and version
5. Copy the connection string:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 5: Configure Application

Update your `.env` file with the Atlas connection string:

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://hms_user:your_password@cluster0.xxxxx.mongodb.net/hms?retryWrites=true&w=majority

# Enable replication features
ENABLE_REPLICATION=true
READ_PREFERENCE=strong
WRITE_CONCERN=majority
```

**Important:** Replace `<username>` and `<password>` with your actual credentials.

### Atlas Replica Set Features

Atlas provides additional features automatically:
- **Automatic Failover**: Elects new primary if current primary fails
- **Continuous Backup**: Point-in-time recovery
- **Monitoring**: Built-in performance metrics and alerts
- **Scaling**: Easy vertical and horizontal scaling

---

## Application Configuration

### Environment Variables

Configure replication behavior using environment variables in `.env`:

```env
# Replication Configuration
ENABLE_REPLICATION=true                    # Enable replica set features
MONGO_REPLICA_SET=rs0                      # Replica set name (default: rs0)

# Read Preferences
READ_PREFERENCE=strong                     # Options: strong, eventual, nearest

# Write Concerns
WRITE_CONCERN=majority                     # Options: majority, acknowledged, unacknowledged

# Health Monitoring
REPLICA_HEALTH_CHECK_INTERVAL=30000        # Health check interval (ms)
REPLICA_LAG_THRESHOLD=10000                # Max acceptable lag (ms)
```

### Configuration Options

#### Read Preferences

| Option | Mode | Description | Use Case |
|--------|------|-------------|----------|
| `strong` | `primary` | Always read from primary | Critical reads requiring latest data (authentication, financial) |
| `eventual` | `secondaryPreferred` | Prefer secondary, fallback to primary | Read-heavy operations tolerating slight staleness (reports, dashboards) |
| `nearest` | `nearest` | Read from lowest latency node | Geographically distributed applications |

#### Write Concerns

| Option | Config | Description | Use Case |
|--------|--------|-------------|----------|
| `majority` | `w: 'majority', j: true` | Wait for majority acknowledgment with journal | Critical writes requiring durability (patient records, billing) |
| `acknowledged` | `w: 1, j: true` | Wait for primary acknowledgment with journal | Standard writes balancing performance and durability |
| `unacknowledged` | `w: 0, j: false` | No acknowledgment required | Non-critical writes (logging, analytics) - use with caution |

---

## Read Preferences

Read preferences control where read operations are routed in a replica set.

### Using Read Preferences in Code

#### Repository Layer

The base repository provides `findWithReadPreference` method:

```javascript
const patientRepo = require('./repositories/patients.repo');

// Strong consistency - read from primary
const patient = await patientRepo.findWithReadPreference(
  { _id: patientId },
  null,
  {},
  'primary'
);

// Eventual consistency - read from secondary
const patients = await patientRepo.findWithReadPreference(
  { status: 'active' },
  null,
  { limit: 100, sort: { name: 1 } },
  'secondaryPreferred'
);

// Lowest latency - read from nearest node
const stats = await patientRepo.findWithReadPreference(
  {},
  { _id: 1, name: 1 },
  { limit: 1000 },
  'nearest'
);
```

#### Direct Mongoose Queries

```javascript
const Patient = require('./models/patient.model');

// Read from primary
const patient = await Patient
  .findById(patientId)
  .read('primary')
  .exec();

// Read from secondary
const patients = await Patient
  .find({ status: 'active' })
  .read('secondaryPreferred')
  .exec();
```

### Automatic Lag Detection

The repository automatically checks replication lag before reading from secondaries:

```javascript
// Repository checks lag automatically
const patients = await patientRepo.findWithReadPreference(
  filter,
  null,
  {},
  'secondaryPreferred'
);

// If lag > threshold, automatically falls back to primary
// Logs warning: "Replication lag too high, falling back to primary"
```

---

## Write Concerns

Write concerns control acknowledgment requirements for write operations.

### Using Write Concerns in Code

#### Repository Layer

The base repository provides `updateWithWriteConcern` method:

```javascript
const patientRepo = require('./repositories/patients.repo');

// Critical update - require majority acknowledgment
const updated = await patientRepo.updateWithWriteConcern(
  patientId,
  { $set: { diagnosis: 'Critical condition', status: 'urgent' } },
  {},
  'majority'
);

// Standard update - acknowledged write concern
const updated = await patientRepo.updateWithWriteConcern(
  patientId,
  { $set: { lastVisit: new Date() } },
  {},
  'acknowledged'
);

// Bulk operations with write concern
const operations = [
  { 
    updateOne: { 
      filter: { _id: id1 }, 
      update: { $set: { status: 'active' } } 
    } 
  },
  { 
    updateOne: { 
      filter: { _id: id2 }, 
      update: { $set: { status: 'inactive' } } 
    } 
  }
];

const result = await patientRepo.bulkWriteWithConcern(
  operations,
  'majority'
);
```

#### Direct Mongoose Operations

```javascript
const Patient = require('./models/patient.model');

// Update with majority write concern
const updated = await Patient.findByIdAndUpdate(
  patientId,
  { $set: { status: 'discharged' } },
  {
    new: true,
    w: 'majority',
    j: true,
    wtimeout: 5000
  }
);
```

### Write Concern Trade-offs

| Write Concern | Durability | Performance | Use Case |
|---------------|------------|-------------|----------|
| `majority` | Highest | Slower | Critical data (patient records, financial transactions) |
| `acknowledged` | Medium | Balanced | Standard operations (appointments, inventory updates) |
| `unacknowledged` | Lowest | Fastest | Non-critical data (logs, analytics) |

---

## Usage Examples

### Example 1: Patient Record Update (Critical Data)

```javascript
const patientRepo = require('./repositories/patients.repo');

async function updatePatientDiagnosis(patientId, diagnosis) {
  try {
    // Use majority write concern for critical medical data
    const updated = await patientRepo.updateWithWriteConcern(
      patientId,
      { 
        $set: { 
          diagnosis,
          lastUpdated: new Date(),
          updatedBy: userId
        } 
      },
      {},
      'majority'  // Ensure data is replicated to majority before acknowledging
    );
    
    return updated;
  } catch (err) {
    logger.error({ err, patientId }, 'Failed to update patient diagnosis');
    throw err;
  }
}
```

### Example 2: Dashboard Statistics (Eventual Consistency)

```javascript
const patientRepo = require('./repositories/patients.repo');

async function getDashboardStats() {
  try {
    // Use secondary reads for dashboard - slight staleness acceptable
    const activePatients = await patientRepo.findWithReadPreference(
      { status: 'active' },
      { _id: 1 },
      {},
      'secondaryPreferred'
    );
    
    const totalAppointments = await appointmentRepo.findWithReadPreference(
      { date: { $gte: new Date() } },
      { _id: 1 },
      {},
      'secondaryPreferred'
    );
    
    return {
      activePatients: activePatients.length,
      upcomingAppointments: totalAppointments.length
    };
  } catch (err) {
    logger.error({ err }, 'Failed to fetch dashboard stats');
    throw err;
  }
}
```

### Example 3: Transaction with Strong Consistency

```javascript
const mongoose = require('mongoose');
const patientRepo = require('./repositories/patients.repo');
const billRepo = require('./repositories/bills.repo');

async function dischargePatient(patientId, billAmount) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // All operations within transaction use primary (strong consistency)
      
      // Update patient status
      await patientRepo.updateById(
        patientId,
        { $set: { status: 'discharged', dischargeDate: new Date() } },
        { session }
      );
      
      // Create final bill
      await billRepo.create({
        patient: patientId,
        amount: billAmount,
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }, session);
      
    }, {
      readPreference: 'primary',
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority' }
    });
    
    logger.info({ patientId }, 'Patient discharged successfully');
  } catch (err) {
    logger.error({ err, patientId }, 'Failed to discharge patient');
    throw err;
  } finally {
    await session.endSession();
  }
}
```

### Example 4: Checking Replication Lag Before Reads

```javascript
const patientRepo = require('./repositories/patients.repo');

async function getPatientRecords(patientId) {
  try {
    // Check if we can safely read from secondary
    const canUseSecondary = await patientRepo.canReadFromSecondary(5000); // 5 second threshold
    
    const readPreference = canUseSecondary ? 'secondaryPreferred' : 'primary';
    
    const records = await medicalRecordRepo.findWithReadPreference(
      { patient: patientId },
      null,
      { sort: { visitDate: -1 }, limit: 50 },
      readPreference
    );
    
    return records;
  } catch (err) {
    logger.error({ err, patientId }, 'Failed to fetch patient records');
    throw err;
  }
}
```

---

## Monitoring and Health Checks

### Automatic Health Monitoring

The HMS automatically monitors replica set health when replication is enabled:

```javascript
// Health monitoring starts automatically on connection
// Configured in backend/src/database/mongo-connection.js

// Check monitoring status
const replicaHealthService = require('./services/replica-health.service');
const status = replicaHealthService.getMonitoringStatus();

console.log(status);
// {
//   isMonitoring: true,
//   checkIntervalMs: 30000,
//   lagThresholdMs: 10000
// }
```

### Manual Health Check

```javascript
const replicaHealthService = require('./services/replica-health.service');

async function checkReplicaHealth() {
  const health = await replicaHealthService.checkHealth();
  
  console.log(health);
  // {
  //   isReplicaSet: true,
  //   healthy: true,
  //   setName: 'rs0',
  //   members: {
  //     total: 3,
  //     primary: 1,
  //     secondary: 2,
  //     unhealthy: 0
  //   },
  //   replicationLag: {
  //     maxLagMs: 245,
  //     maxLagSeconds: '0.25',
  //     details: [...]
  //   },
  //   timestamp: '2024-11-24T10:30:00.000Z'
  // }
}
```

### Health Check Logs

The system automatically logs health issues:

```
// Unhealthy member detected
WARN: Unhealthy replica set member detected
  memberId: 2
  name: 'localhost:27019'
  state: 'RECOVERING'
  health: 0

// High replication lag
WARN: High replication lag detected
  maxLagMs: 15000
  maxLagSeconds: '15.00'
  threshold: 10000
  affectedMembers: [{ name: 'localhost:27018', lagMs: 15000 }]
```

### Monitoring Metrics

Key metrics tracked by the health service:

1. **Member Health**: Status of each replica set member
2. **Replication Lag**: Time difference between primary and secondaries
3. **Primary Availability**: Presence of a primary node
4. **Topology Changes**: Changes in replica set configuration

---

## Troubleshooting

### Issue: Replica Set Not Initializing

**Symptoms:**
- `rs.status()` returns error
- Members show as `STARTUP` or `UNKNOWN`

**Solutions:**

1. Check MongoDB instances are running:
```bash
ps aux | grep mongod  # Linux/macOS
Get-Process mongod    # Windows
```

2. Verify network connectivity:
```bash
mongosh --port 27017
mongosh --port 27018
mongosh --port 27019
```

3. Check replica set configuration:
```javascript
rs.conf()
```

4. Re-initialize if needed:
```javascript
rs.reconfig({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
}, { force: true })
```

### Issue: High Replication Lag

**Symptoms:**
- Warnings in logs about high replication lag
- Reads automatically falling back to primary

**Solutions:**

1. Check secondary member status:
```javascript
rs.status()
```

2. Check oplog size:
```javascript
db.oplog.rs.stats()
```

3. Increase oplog size if needed (requires restart):
```bash
mongod --replSet rs0 --port 27018 --dbpath /data/db2 --oplogSize 2048
```

4. Check network latency between nodes
5. Verify secondary members have sufficient resources (CPU, RAM, disk I/O)

### Issue: Primary Election Failure

**Symptoms:**
- No primary node in replica set
- All members show as `SECONDARY` or `RECOVERING`

**Solutions:**

1. Check replica set status:
```javascript
rs.status()
```

2. Check member priorities:
```javascript
rs.conf()
```

3. Force election (use with caution):
```javascript
rs.stepDown()  // On current primary
```

4. Reconfigure with priorities:
```javascript
cfg = rs.conf()
cfg.members[0].priority = 2  // Higher priority for preferred primary
rs.reconfig(cfg)
```

### Issue: Connection String Errors

**Symptoms:**
- Application fails to connect
- Error: "No suitable servers found"

**Solutions:**

1. Verify connection string format:
```
mongodb://host1:port1,host2:port2,host3:port3/database?replicaSet=rs0
```

2. Check replica set name matches:
```javascript
rs.conf()._id  // Should match replicaSet parameter
```

3. Verify all hosts are reachable:
```bash
ping host1
ping host2
ping host3
```

4. For Atlas, ensure IP is whitelisted in Network Access

### Issue: Transaction Failures

**Symptoms:**
- Error: "Transaction numbers are only allowed on a replica set member or mongos"
- Transactions not working

**Solutions:**

1. Verify replica set is properly configured:
```javascript
db.adminCommand({ ismaster: 1 })
```

2. Check application configuration:
```env
ENABLE_REPLICATION=true
```

3. Ensure using MongoDB 4.0+ for transactions
4. Verify connection string includes `replicaSet` parameter

### Issue: Atlas Connection Timeout

**Symptoms:**
- Connection timeout errors
- "Server selection timed out"

**Solutions:**

1. Check network access (IP whitelist) in Atlas dashboard
2. Verify credentials are correct
3. Check firewall settings on your machine
4. Try connection string with `retryWrites=true&w=majority`
5. Increase timeout in connection options:
```javascript
{
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 10000
}
```

---

## Additional Resources

### MongoDB Documentation

- [Replica Set Deployment](https://docs.mongodb.com/manual/tutorial/deploy-replica-set/)
- [Read Preference](https://docs.mongodb.com/manual/core/read-preference/)
- [Write Concern](https://docs.mongodb.com/manual/reference/write-concern/)
- [Replication](https://docs.mongodb.com/manual/replication/)

### Atlas Documentation

- [Getting Started with Atlas](https://docs.atlas.mongodb.com/getting-started/)
- [Atlas Replica Sets](https://docs.atlas.mongodb.com/reference/replica-set-configuration/)
- [Connection Strings](https://docs.atlas.mongodb.com/driver-connection/)

### HMS Documentation

- [Locking Guide](./LOCKING_GUIDE.md) - Optimistic and pessimistic locking
- [Sharding Setup](./SHARDING_SETUP.md) - Horizontal scaling configuration
- [Views Setup](./VIEWS_SETUP.md) - Role-based database views
- [Security Guide](../SECURITY.md) - Overall security features

---

## Summary

This guide covered:

✅ Local replica set setup for development  
✅ MongoDB Atlas replica set configuration  
✅ Application configuration for replication  
✅ Read preferences for controlling read routing  
✅ Write concerns for controlling write acknowledgment  
✅ Code examples for common scenarios  
✅ Health monitoring and troubleshooting  

For questions or issues, refer to the troubleshooting section or consult the MongoDB documentation.
