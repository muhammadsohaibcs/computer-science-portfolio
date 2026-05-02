# MongoDB Sharding Setup Guide

## Overview

This guide provides step-by-step instructions for enabling and configuring MongoDB sharding for the Hospital Management System (HMS). Sharding enables horizontal scaling by distributing data across multiple servers (shards), allowing the system to handle growing data volumes and increased throughput.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding Sharding](#understanding-sharding)
3. [Cluster Requirements](#cluster-requirements)
4. [Shard Key Selection Rationale](#shard-key-selection-rationale)
5. [Setup Instructions](#setup-instructions)
6. [Verification](#verification)
7. [Query Optimization](#query-optimization)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **MongoDB Version**: 4.4 or higher (5.0+ recommended)
- **Deployment Type**: Sharded cluster (minimum 3 config servers, 2+ shard replica sets)
- **Network**: All cluster components must be able to communicate
- **Storage**: Sufficient disk space on each shard for data distribution

### Knowledge Requirements

- Basic understanding of MongoDB architecture
- Familiarity with MongoDB shell (mongosh)
- Understanding of your application's query patterns
- Access to MongoDB cluster with administrative privileges

### Environment Setup

Before enabling sharding, ensure:

1. **Config Servers**: At least 3 config servers deployed as a replica set
2. **Mongos Routers**: At least 2 mongos instances for high availability
3. **Shard Replica Sets**: At least 2 replica sets to serve as shards
4. **Backup**: Complete backup of all data before enabling sharding

## Understanding Sharding

### What is Sharding?

Sharding is MongoDB's approach to horizontal scaling. It distributes data across multiple machines (shards) based on a shard key. Each shard contains a subset of the data, and mongos routers direct queries to the appropriate shards.

### Sharding Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Mongos Routers                            │
│  (Query routing, request distribution, result aggregation)  │
└────────┬────────────────────────────────────────┬───────────┘
         │                                        │
         ▼                                        ▼
┌──────────────────┐                    ┌──────────────────┐
│   Shard 1        │                    │   Shard 2        │
│  (Replica Set)   │                    │  (Replica Set)   │
│  - Primary       │                    │  - Primary       │
│  - Secondary     │                    │  - Secondary     │
│  - Secondary     │                    │  - Secondary     │
└──────────────────┘                    └──────────────────┘
         │                                        │
         └────────────────┬───────────────────────┘
                          │
                          ▼
                ┌──────────────────┐
                │  Config Servers  │
                │  (Replica Set)   │
                │  - Metadata      │
                │  - Chunk info    │
                └──────────────────┘
```

### Benefits of Sharding

- **Horizontal Scalability**: Add more shards to increase capacity
- **Improved Performance**: Distribute read/write load across shards
- **Geographic Distribution**: Place shards closer to users
- **High Availability**: Combined with replica sets for redundancy

## Cluster Requirements

### Minimum Production Configuration

```
Component          | Minimum | Recommended | Purpose
-------------------|---------|-------------|---------------------------
Config Servers     | 3       | 3           | Store cluster metadata
Mongos Routers     | 2       | 3+          | Route queries to shards
Shard Replica Sets | 2       | 3+          | Store actual data
Members per Shard  | 3       | 3           | Primary + 2 secondaries
```

### MongoDB Atlas

If using MongoDB Atlas:
- Select **M10 or higher** cluster tier (sharding not available on M0/M2/M5)
- Sharding is managed automatically by Atlas
- Config servers and mongos routers are handled by Atlas
- You only need to configure shard keys

### Self-Hosted Cluster

For self-hosted deployments:
- Deploy config server replica set first
- Deploy shard replica sets
- Deploy mongos routers
- Connect mongos to config servers
- Add shards to the cluster

## Shard Key Selection Rationale

Choosing the right shard key is critical for performance and scalability. The HMS uses different strategies based on collection access patterns.

### General Principles

1. **High Cardinality**: Shard key should have many distinct values
2. **Even Distribution**: Data should distribute evenly across shards
3. **Query Patterns**: Include shard key in common queries for targeted routing
4. **Immutability**: Shard key values cannot be changed after document creation
5. **Monotonicity**: Avoid monotonically increasing keys (timestamps, auto-increment IDs) without hashing

### Collection-Specific Rationale

#### 1. Patients Collection

**Shard Key**: `{ _id: "hashed" }`

**Rationale**:
- Patients are primarily accessed by their unique ID
- Hashed _id provides even distribution across shards
- Prevents hotspots from sequential ID generation
- Most queries include patient ID in the filter

**Trade-offs**:
- Range queries on _id are scatter-gather (hit all shards)
- Acceptable because patient lookups are by exact ID

**Query Pattern**:
```javascript
// Targeted query (includes shard key)
db.patients.findOne({ _id: ObjectId("...") })

// Scatter-gather query (no shard key)
db.patients.find({ name: "John Doe" })
```

#### 2. Appointments Collection

**Shard Key**: `{ doctor: 1, appointmentDate: 1 }`

**Rationale**:
- Common query: "Get all appointments for doctor X on date Y"
- Compound key supports doctor schedule queries
- Range queries on date work efficiently within a doctor's shard
- Doctors have relatively even appointment distribution

**Trade-offs**:
- Queries must include doctor field for targeted routing
- Patient-centric queries (all appointments for patient) are scatter-gather

**Query Pattern**:
```javascript
// Targeted query (includes shard key prefix)
db.appointments.find({ 
  doctor: ObjectId("..."),
  appointmentDate: { $gte: ISODate("2024-01-01") }
})

// Scatter-gather query (no shard key)
db.appointments.find({ patient: ObjectId("...") })
```

**Important**: Always include `doctor` field in queries to enable targeted shard routing.

#### 3. Medical Records Collection

**Shard Key**: `{ patient: 1, createdAt: 1 }`

**Rationale**:
- Medical records are always queried by patient
- createdAt provides range-based distribution within patient records
- Prevents single patient's records from overwhelming one shard
- Supports chronological queries efficiently

**Trade-offs**:
- Queries must include patient field for targeted routing
- Doctor-centric queries are scatter-gather

**Query Pattern**:
```javascript
// Targeted query (includes shard key prefix)
db.medicalRecords.find({ 
  patient: ObjectId("..."),
  createdAt: { $gte: ISODate("2024-01-01") }
})
```

#### 4. Inventory Collection

**Shard Key**: `{ itemCode: "hashed" }`

**Rationale**:
- Inventory items accessed by unique item code
- Hashed key provides even distribution
- Prevents hotspots from popular items
- Item codes have high cardinality

**Trade-offs**:
- Range queries on itemCode are scatter-gather
- Acceptable because inventory lookups are by exact code

**Query Pattern**:
```javascript
// Targeted query (includes shard key)
db.inventory.findOne({ itemCode: "MED-12345" })

// Scatter-gather query (no shard key)
db.inventory.find({ category: "Medications" })
```

#### 5. Bills Collection

**Shard Key**: `{ patient: 1, createdAt: 1 }`

**Rationale**:
- Bills are queried by patient for billing history
- createdAt enables time-based queries and distribution
- Similar pattern to medical records for consistency
- Supports patient billing reports efficiently

**Trade-offs**:
- Queries must include patient field for targeted routing
- Financial reports across all patients are scatter-gather

**Query Pattern**:
```javascript
// Targeted query (includes shard key prefix)
db.bills.find({ 
  patient: ObjectId("..."),
  createdAt: { $gte: ISODate("2024-01-01") }
})
```

## Setup Instructions

### Step 1: Connect to Mongos Router

Connect to a mongos instance (not directly to a shard):

```bash
mongosh "mongodb://mongos-host:27017/admin" --username admin
```

For MongoDB Atlas:
```bash
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/admin" --username admin
```

### Step 2: Enable Sharding on Database

Enable sharding for the HMS database:

```javascript
sh.enableSharding("hms")
```

**Expected Output**:
```javascript
{
  ok: 1,
  '$clusterTime': { ... }
}
```

### Step 3: Create Indexes for Shard Keys

Before sharding collections, create indexes on shard keys:

```javascript
use hms

// Patients - hashed index on _id (usually exists by default)
db.patients.createIndex({ "_id": "hashed" })

// Appointments - compound index
db.appointments.createIndex({ "doctor": 1, "appointmentDate": 1 })

// Medical Records - compound index
db.medicalRecords.createIndex({ "patient": 1, "createdAt": 1 })

// Inventory - hashed index on itemCode
db.inventory.createIndex({ "itemCode": "hashed" })

// Bills - compound index
db.bills.createIndex({ "patient": 1, "createdAt": 1 })
```

### Step 4: Shard Collections

Shard each collection with its designated shard key:

```javascript
// Patients: Hashed _id for even distribution
sh.shardCollection("hms.patients", { "_id": "hashed" })

// Appointments: Compound key on doctor and date
sh.shardCollection("hms.appointments", { "doctor": 1, "appointmentDate": 1 })

// Medical Records: Compound key on patient and creation time
sh.shardCollection("hms.medicalRecords", { "patient": 1, "createdAt": 1 })

// Inventory: Hashed itemCode for even distribution
sh.shardCollection("hms.inventory", { "itemCode": "hashed" })

// Bills: Compound key on patient and creation time
sh.shardCollection("hms.bills", { "patient": 1, "createdAt": 1 })
```

**Expected Output** (for each command):
```javascript
{
  collectionsharded: 'hms.patients',
  ok: 1,
  '$clusterTime': { ... }
}
```

### Step 5: Enable Sharding in Application

Update your application's environment variables:

```bash
# .env file
ENABLE_SHARDING=true
```

The application will automatically use the sharding configuration defined in `backend/src/database/sharding-config.js`.

## Verification

### Check Sharding Status

```javascript
sh.status()
```

This displays:
- Sharded collections
- Shard key for each collection
- Chunk distribution across shards
- Balancer status

### Check Collection Sharding

```javascript
db.patients.getShardDistribution()
```

**Expected Output**:
```
Shard shard0 at shard0/host1:27017,host2:27017,host3:27017
 data : 45.2MiB docs : 12543 chunks : 4
 estimated data per chunk : 11.3MiB
 estimated docs per chunk : 3135

Shard shard1 at shard1/host4:27017,host5:27017,host6:27017
 data : 43.8MiB docs : 12187 chunks : 4
 estimated data per chunk : 10.95MiB
 estimated docs per chunk : 3046

Totals
 data : 89MiB docs : 24730 chunks : 8
 Shard shard0 contains 50.67% data, 50.71% docs in cluster
 Shard shard1 contains 49.32% data, 49.28% docs in cluster
```

### Verify Targeted Queries

Use `explain()` to verify queries are targeted:

```javascript
// Should show "SINGLE_SHARD" for targeted queries
db.patients.find({ _id: ObjectId("...") }).explain("executionStats")

// Should show "SHARD_MERGE" for scatter-gather queries
db.patients.find({ name: "John" }).explain("executionStats")
```

Look for:
- `"shards"` field showing which shards were queried
- `"SINGLE_SHARD"` stage for targeted queries
- `"SHARD_MERGE"` stage for scatter-gather queries

## Query Optimization

### Best Practices

1. **Always Include Shard Key in Queries**
   ```javascript
   // Good: Targeted query
   db.appointments.find({ doctor: doctorId, appointmentDate: date })
   
   // Bad: Scatter-gather query
   db.appointments.find({ appointmentDate: date })
   ```

2. **Use Shard Key Prefix for Compound Keys**
   ```javascript
   // Good: Uses shard key prefix (doctor)
   db.appointments.find({ doctor: doctorId })
   
   // Bad: Doesn't use prefix
   db.appointments.find({ appointmentDate: date })
   ```

3. **Avoid Queries Without Shard Key**
   - These hit all shards (scatter-gather)
   - Acceptable for infrequent admin queries
   - Problematic for high-frequency operations

4. **Update Application Queries**
   ```javascript
   // Before sharding
   const appointments = await Appointment.find({ appointmentDate: date })
   
   // After sharding (include doctor)
   const appointments = await Appointment.find({ 
     doctor: doctorId, 
     appointmentDate: date 
   })
   ```

### Query Patterns to Avoid

```javascript
// ❌ Avoid: No shard key
db.appointments.find({ status: "scheduled" })

// ❌ Avoid: Only non-prefix fields
db.appointments.find({ appointmentDate: date })

// ✅ Good: Includes shard key prefix
db.appointments.find({ doctor: doctorId, status: "scheduled" })
```

## Monitoring

### Key Metrics to Monitor

1. **Chunk Distribution**
   ```javascript
   sh.status()
   ```
   - Ensure chunks are evenly distributed
   - Watch for imbalanced shards

2. **Balancer Activity**
   ```javascript
   sh.getBalancerState()
   sh.isBalancerRunning()
   ```
   - Balancer should be enabled
   - Monitor chunk migrations

3. **Query Performance**
   ```javascript
   db.patients.find({ _id: id }).explain("executionStats")
   ```
   - Check `executionTimeMillis`
   - Verify targeted vs scatter-gather

4. **Shard Metrics**
   ```javascript
   db.serverStatus().sharding
   ```
   - Monitor chunk migration count
   - Track failed migrations

### MongoDB Atlas Monitoring

If using Atlas:
- Navigate to **Metrics** tab
- Monitor **Shard Distribution**
- Check **Query Targeting** percentage
- Review **Chunk Migration** activity

## Troubleshooting

### Issue: Uneven Shard Distribution

**Symptoms**: One shard has significantly more data than others

**Solutions**:
1. Check shard key cardinality:
   ```javascript
   db.patients.aggregate([
     { $group: { _id: "$_id", count: { $sum: 1 } } },
     { $group: { _id: null, uniqueKeys: { $sum: 1 } } }
   ])
   ```

2. Verify balancer is running:
   ```javascript
   sh.getBalancerState()
   sh.startBalancer()
   ```

3. Consider resharding with different shard key (MongoDB 5.0+)

### Issue: Slow Queries After Sharding

**Symptoms**: Queries slower than before sharding

**Solutions**:
1. Check if queries include shard key:
   ```javascript
   db.collection.find({ ... }).explain("executionStats")
   ```

2. Look for `SHARD_MERGE` indicating scatter-gather

3. Update queries to include shard key

4. Add indexes on frequently queried fields

### Issue: Cannot Shard Collection

**Symptoms**: `sh.shardCollection()` fails

**Solutions**:
1. Ensure index exists on shard key:
   ```javascript
   db.collection.getIndexes()
   ```

2. Check if collection is already sharded:
   ```javascript
   db.collection.getShardDistribution()
   ```

3. Verify database sharding is enabled:
   ```javascript
   sh.status()
   ```

### Issue: Chunk Migration Failures

**Symptoms**: Chunks not balancing across shards

**Solutions**:
1. Check balancer logs:
   ```javascript
   db.getSiblingDB("config").changelog.find({ what: "moveChunk.error" })
   ```

2. Verify network connectivity between shards

3. Check disk space on target shard

4. Temporarily stop balancer during high-traffic periods:
   ```javascript
   sh.stopBalancer()
   // Perform maintenance
   sh.startBalancer()
   ```

## Additional Resources

- [MongoDB Sharding Documentation](https://docs.mongodb.com/manual/sharding/)
- [Shard Key Selection Guide](https://docs.mongodb.com/manual/core/sharding-shard-key/)
- [Sharding Best Practices](https://docs.mongodb.com/manual/core/sharding-data-partitioning/)
- HMS Sharding Configuration: `backend/src/database/sharding-config.js`

## Support

For issues or questions:
1. Review this documentation
2. Check MongoDB logs for errors
3. Consult MongoDB Atlas support (if using Atlas)
4. Contact your database administrator

---

**Last Updated**: 2024
**Version**: 1.0
**Maintained By**: HMS Development Team
