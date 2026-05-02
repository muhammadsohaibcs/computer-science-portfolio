# 🔐 Security Policy — HMS Backend

This backend is designed with enterprise-level security:

## ✔ OWASP Best Practices Implemented

- HTTP Security Headers (`helmet`)
- Input Sanitization (`sanitize`, NoSQL Injection prevention)
- Strong Password Hashing (Argon2id)
- Refresh Token Rotation (hashed in DB)
- CSRF protection (optional if using cookies)
- Rate Limiting for DDoS/Bruteforce protection
- CORS strict configuration
- Role-Based Access Control (RBAC)
- Logging (pino) with request trace IDs
- Field-level validation (express-validator)

## ✔ Secrets Management

Never commit `.env`.
Use environment variables.

## ✔ Database Security

- MongoDB user with least privileges
- No client-side direct DB exposure
- Sanitization to block operators like `$ne`, `$gt`, `$regex`, `$where`
- Optimistic locking for concurrent update protection
- Pessimistic locking for critical operations
- Role-based database views for data access control
- Replica set configuration for high availability
- Sharding support for horizontal scalability

## ✔ Authentication Rules

- Access token: short lifetime (10 minutes)
- Refresh token: long lifetime (30 days), hashed, stored server-side
- Forced rotation on every refresh

## ✔ Password Requirements

- Minimum 8 characters
- Strong hashing with Argon2id

## ✔ Logging

- No sensitive data in logs
- Error logs sent to `/logs/error.log`

## ✔ API Security

- Every route protected by `auth.middleware.js`
- Every domain protected by permissions middleware

---

## 🔒 Advanced Database Security Features

### Optimistic Locking

**Purpose**: Prevents concurrent updates from overwriting each other's changes without detection.

**How It Works**:
- Each document in critical collections (patients, appointments, inventory, bills) has a version field (`__v`)
- Version field is automatically incremented on every update
- Updates must include the expected version number
- If the version doesn't match, the update is rejected with a 409 Conflict error

**Benefits**:
- ✅ Detects concurrent modifications immediately
- ✅ Minimal performance overhead
- ✅ No locking required for most operations
- ✅ Scales well in high-concurrency environments

**Usage Example**:
```javascript
// Fetch document with current version
const patient = await Patient.findById(patientId);
const currentVersion = patient.__v;

// Attempt update with version check
try {
  const updated = await Patient.updateWithVersion(
    patientId,
    currentVersion,
    { name: 'Updated Name' }
  );
} catch (err) {
  if (err instanceof VersionConflictError) {
    // Handle conflict - refresh and retry
    console.log('Document was modified by another user');
  }
}
```

**When to Use**:
- Standard CRUD operations on critical data
- Operations where conflicts are rare
- Read-heavy workloads with occasional updates

**Documentation**: See `backend/docs/LOCKING_GUIDE.md` for detailed usage patterns.

---

### Pessimistic Locking

**Purpose**: Explicitly locks documents to prevent concurrent modifications during complex multi-step transactions.

**How It Works**:
- Dedicated `document_locks` collection stores active locks
- Lock includes resource ID, lock holder, acquisition time, and expiration
- TTL index automatically cleans up expired locks
- Only one lock holder can hold a lock on a resource at a time

**Benefits**:
- ✅ Guarantees exclusive access during critical operations
- ✅ Prevents race conditions in multi-step workflows
- ✅ Automatic cleanup of expired locks
- ✅ Clear error messages when locks are held

**Usage Example**:
```javascript
const lockingService = require('./services/locking.service');

// Acquire lock before critical operation
await lockingService.acquireLock(
  resourceId,
  userId,
  30000 // 30 second timeout
);

try {
  // Perform multi-step operation
  await step1();
  await step2();
  await step3();
} finally {
  // Always release lock
  await lockingService.releaseLock(resourceId, userId);
}

// Or use the convenience wrapper
await lockingService.withLock(resourceId, userId, async () => {
  // Critical operation here
  await complexTransaction();
}, 30000);
```

**When to Use**:
- Multi-step transactions requiring consistency
- Operations that must not be interrupted
- Critical financial or medical record updates
- Operations where conflicts would be costly

**Documentation**: See `backend/docs/LOCKING_GUIDE.md` for detailed usage patterns.

---

### Database Views (Role-Based Data Access)

**Purpose**: Provides role-based data filtering at the database level, ensuring users only access data appropriate to their role.

**How It Works**:
- MongoDB views are virtual collections with aggregation pipelines
- Each view filters and projects fields based on role requirements
- Views are queried like regular collections
- Sensitive fields are automatically excluded

**Available Views**:
- `patients_receptionist_view` - Excludes medical records and emergency contacts
- `patients_nurse_view` - Includes emergency contacts but not full medical history
- `appointments_patient_view` - Shows only essential appointment information
- `inventory_pharmacist_view` - Excludes cost and pricing details
- `medical_records_summary_view` - Summary for dashboards without detailed notes

**Benefits**:
- ✅ Defense-in-depth security layer
- ✅ Prevents accidental exposure of sensitive data
- ✅ Centralized data access control
- ✅ Reduces code complexity in application layer

**Usage Example**:
```javascript
// Query through role-specific view
const patients = await mongoose.connection
  .collection('patients_receptionist_view')
  .find({ primaryDoctor: doctorId })
  .toArray();

// Sensitive fields are automatically excluded
// No risk of accidentally exposing medical records
```

**Security Considerations**:
- Views are NOT a replacement for application-level authorization
- Always validate user roles before querying views
- Combine with RBAC middleware for complete security
- Views prevent accidental exposure but not intentional bypass

**Documentation**: See `backend/docs/VIEWS_SETUP.md` for setup instructions and view definitions.

---

### Replica Set Configuration

**Purpose**: Provides high availability, automatic failover, and read scalability through MongoDB replica sets.

**How It Works**:
- Primary node handles all writes
- Secondary nodes replicate data from primary
- Automatic failover if primary fails
- Read operations can be distributed to secondaries

**Architecture**:
```
┌─────────────────────────────────────────┐
│   MongoDB Atlas (Cloud) - PRIMARY       │
│   - All writes                          │
│   - Strong consistency reads            │
└──────────────┬──────────────────────────┘
               │ Replication (Oplog)
               ▼
┌─────────────────────────────────────────┐
│   Local MongoDB - SECONDARY             │
│   - Read-only replica                   │
│   - Eventual consistency reads          │
│   - Local development fallback          │
└─────────────────────────────────────────┘
```

**Benefits**:
- ✅ High availability with automatic failover
- ✅ Data redundancy and disaster recovery
- ✅ Read scalability by distributing queries
- ✅ Zero-downtime maintenance
- ✅ Transaction support (requires replica set)

**Read Preferences**:
- `primary` - Strong consistency, all reads from primary
- `secondaryPreferred` - Eventual consistency, reads from secondaries when available
- `nearest` - Lowest latency, reads from nearest node

**Write Concerns**:
- `majority` - Write acknowledged by majority of replicas (safest)
- `acknowledged` - Write acknowledged by primary only (faster)
- `unacknowledged` - Fire-and-forget (fastest, least safe)

**Usage Example**:
```javascript
// Strong consistency read (from primary)
const patient = await patientRepo.findWithReadPreference(
  { _id: patientId },
  'primary'
);

// Eventual consistency read (from secondary)
const appointments = await appointmentRepo.findWithReadPreference(
  { doctor: doctorId },
  'secondaryPreferred'
);

// Critical write with majority concern
await patientRepo.updateWithWriteConcern(
  patientId,
  updateData,
  'majority'
);
```

**Monitoring**:
- Replica health monitoring service tracks replication lag
- Automatic warnings for unhealthy replica members
- Connection event handlers for topology changes

**Documentation**: See `backend/docs/REPLICATION_SETUP.md` for setup instructions.

---

### Sharding Configuration

**Purpose**: Enables horizontal scaling by distributing data across multiple servers based on shard keys.

**How It Works**:
- Data is partitioned across multiple shards
- Shard key determines which shard stores each document
- Queries including shard key are routed to specific shards
- Queries without shard key hit all shards (scatter-gather)

**Shard Key Strategy**:
- `patients` - Hashed `_id` for even distribution
- `appointments` - Compound key `{doctor: 1, appointmentDate: 1}` for query optimization
- `medicalRecords` - Compound key `{patient: 1, createdAt: 1}` for range queries
- `inventory` - Hashed `itemCode` for even distribution
- `bills` - Compound key `{patient: 1, createdAt: 1}` for patient-based queries

**Benefits**:
- ✅ Horizontal scalability for large datasets
- ✅ Improved query performance with targeted routing
- ✅ Distributed storage across multiple servers
- ✅ No single point of failure for data storage

**Performance Considerations**:
- Always include shard key in queries for targeted routing
- Avoid scatter-gather queries when possible
- Monitor shard distribution for hotspots
- Choose shard keys based on access patterns

**Security Implications**:
- Sharding is transparent to application security
- All security features (locking, views, RBAC) work with sharding
- Ensure shard keys don't expose sensitive patterns
- Monitor query patterns for security anomalies

**Documentation**: See `backend/docs/SHARDING_SETUP.md` for setup instructions and shard key rationale.

---

## 🛡️ Conflict Handling

The system includes specialized middleware for handling database conflicts:

**Version Conflicts** (HTTP 409):
```json
{
  "error": "Conflict",
  "message": "The document has been modified by another user. Please refresh and try again.",
  "code": "VERSION_CONFLICT",
  "currentVersion": 5
}
```

**Lock Conflicts** (HTTP 409):
```json
{
  "error": "Conflict",
  "message": "The resource is currently locked by another operation. Please try again later.",
  "code": "LOCK_CONFLICT",
  "lockInfo": {
    "lockHolder": "user123",
    "acquiredAt": "2025-11-24T10:30:00Z"
  }
}
```

**Lock Timeouts** (HTTP 408):
```json
{
  "error": "Timeout",
  "message": "Operation timed out while waiting for lock.",
  "code": "LOCK_TIMEOUT"
}
```

**Client Retry Strategy**:
- Implement exponential backoff for conflict retries
- Refresh document data before retry
- Limit retry attempts to prevent infinite loops
- Display user-friendly messages for persistent conflicts

---

## 📚 Additional Documentation

For detailed implementation guides and usage examples:

- **Locking Guide**: `backend/docs/LOCKING_GUIDE.md`
- **Replication Setup**: `backend/docs/REPLICATION_SETUP.md`
- **Sharding Setup**: `backend/docs/SHARDING_SETUP.md`
- **Views Setup**: `backend/docs/VIEWS_SETUP.md`

---

