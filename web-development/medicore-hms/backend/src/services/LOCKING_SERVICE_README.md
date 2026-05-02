# Locking Service Implementation

## Overview

The pessimistic locking service has been successfully implemented as part of the advanced database security features. This service provides thread-safe document locking capabilities using MongoDB's unique index constraints.

## Implementation Details

### File Location
`backend/src/services/locking.service.js`

### Core Methods

1. **acquireLock(resourceId, lockHolder, timeout)**
   - Acquires an exclusive lock on a resource
   - Creates a lock record with expiration timestamp
   - Throws `LockConflictError` if resource is already locked
   - Validates Requirements: 2.1, 2.2, 2.5

2. **releaseLock(resourceId, lockHolder)**
   - Releases a lock held by the specified lock holder
   - Returns true if lock was released, false otherwise
   - Validates lock holder identity before releasing
   - Validates Requirements: 2.4

3. **withLock(resourceId, lockHolder, callback, timeout)**
   - Executes a callback function while holding a lock
   - Automatically acquires lock before execution
   - Guarantees lock release even if callback throws error
   - Validates Requirements: 2.1, 2.2, 2.4

4. **cleanupExpiredLocks()**
   - Manually removes expired locks from the database
   - Returns count of locks removed
   - Note: MongoDB TTL index handles automatic cleanup
   - Validates Requirements: 2.3

### Additional Helper Methods

5. **getLockInfo(resourceId)**
   - Retrieves information about an existing lock
   - Returns null if no lock exists
   - Used internally for conflict error details

6. **isLocked(resourceId)**
   - Checks if a resource is currently locked
   - Automatically cleans up expired locks
   - Returns boolean indicating lock status

7. **forceReleaseLock(resourceId)**
   - Admin operation to forcefully release any lock
   - Bypasses lock holder validation
   - Use with caution - logs warning

## Error Handling

The service properly handles:
- **Duplicate Key Errors (E11000)**: Converted to `LockConflictError` with lock holder information
- **Lock Conflicts**: Includes existing lock details in error response
- **Lock Timeouts**: Automatic cleanup via MongoDB TTL index

## Logging

All lock operations are logged with appropriate levels:
- **INFO**: Successful lock acquisitions and releases
- **WARN**: Lock conflicts, failed releases, force releases
- **ERROR**: Unexpected errors during lock operations
- **DEBUG**: Callback execution with lock held

## Usage Example

```javascript
const lockingService = require('./services/locking.service');

// Simple lock/unlock
await lockingService.acquireLock('patient-123', 'user-456', 30000);
try {
  // Perform critical operation
} finally {
  await lockingService.releaseLock('patient-123', 'user-456');
}

// Using withLock wrapper (recommended)
const result = await lockingService.withLock('patient-123', 'user-456', async () => {
  // Perform critical operation
  return someResult;
}, 30000);
```

## Testing

Comprehensive unit tests have been created in `backend/tests/locking.service.test.js` covering:
- Lock acquisition and conflict scenarios
- Lock release with holder validation
- withLock wrapper functionality
- Expired lock cleanup
- Lock information retrieval
- Force release operations

## Requirements Validation

✅ **Requirement 2.1**: Lock record creation with expiration timestamp
✅ **Requirement 2.2**: Lock exclusivity - prevents concurrent lock acquisition
✅ **Requirement 2.4**: Explicit lock release functionality
✅ **Requirement 2.5**: Lock conflict errors include lock holder information

## Integration

The locking service is exported as a singleton instance and can be imported throughout the application:

```javascript
const lockingService = require('./services/locking.service');
```

It will be integrated into the base repository in subsequent tasks to provide lock-aware database operations.
