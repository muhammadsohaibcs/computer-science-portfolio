# Retry Helper Usage Guide

The retry helper utility provides automatic retry logic for database operations that may encounter version conflicts or lock conflicts. It implements exponential backoff with jitter to prevent thundering herd problems.

## Basic Usage

### Simple Retry

```javascript
const { retryOnConflict } = require('./utils/retry-helper');

// Wrap any async operation that might throw VersionConflictError or LockConflictError
const result = await retryOnConflict(async () => {
  return await repository.optimisticUpdate(id, version, updateData);
});
```

### With Custom Configuration

```javascript
const result = await retryOnConflict(
  async () => await repository.optimisticUpdate(id, version, updateData),
  {
    maxRetries: 5,              // Maximum number of retry attempts (default: 3)
    initialDelayMs: 200,        // Initial delay in milliseconds (default: 100)
    maxDelayMs: 10000,          // Maximum delay cap (default: 5000)
    backoffMultiplier: 2,       // Exponential backoff multiplier (default: 2)
    jitterFactor: 0.1,          // Jitter factor 0-1 (default: 0.1)
    operationName: 'updatePatient' // Name for logging (default: 'operation')
  }
);
```

### With Retry Callback

```javascript
const result = await retryOnConflict(
  async () => await repository.optimisticUpdate(id, version, updateData),
  {
    maxRetries: 5,
    onRetry: async (error, attempt, delay) => {
      // Called before each retry
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      console.log(`Error: ${error.message}`);
      
      // You can refresh data here before retry
      const freshDoc = await repository.findById(id);
      version = freshDoc.__v;
    }
  }
);
```

## Creating Reusable Retry Wrappers

For operations that need consistent retry behavior, create a wrapper:

```javascript
const { createRetryWrapper } = require('./utils/retry-helper');

// Create a wrapper with specific configuration
const retryWithAggressiveBackoff = createRetryWrapper({
  maxRetries: 10,
  initialDelayMs: 50,
  maxDelayMs: 2000
});

// Use it for multiple operations
const result1 = await retryWithAggressiveBackoff(async () => {
  return await operation1();
});

const result2 = await retryWithAggressiveBackoff(async () => {
  return await operation2();
});
```

## Common Use Cases

### 1. Optimistic Locking Updates

```javascript
async function updatePatient(patientId, updates) {
  return await retryOnConflict(async () => {
    const patient = await Patient.findById(patientId);
    const currentVersion = patient.__v;
    
    return await Patient.updateWithVersion(
      patientId,
      currentVersion,
      updates
    );
  }, {
    maxRetries: 5,
    operationName: 'updatePatient'
  });
}
```

### 2. Lock Acquisition with Retry

```javascript
async function performCriticalOperation(resourceId) {
  return await retryOnConflict(async () => {
    const lockHolder = `user-${userId}`;
    
    // Try to acquire lock
    await lockingService.acquireLock(resourceId, lockHolder);
    
    try {
      // Perform critical operation
      const result = await criticalOperation(resourceId);
      return result;
    } finally {
      // Always release lock
      await lockingService.releaseLock(resourceId, lockHolder);
    }
  }, {
    maxRetries: 3,
    initialDelayMs: 500, // Longer initial delay for locks
    operationName: 'criticalOperation'
  });
}
```

### 3. Bulk Updates with Retry

```javascript
async function bulkUpdateWithRetry(documents) {
  const results = [];
  
  for (const doc of documents) {
    const result = await retryOnConflict(async () => {
      return await repository.optimisticUpdate(
        doc._id,
        doc.__v,
        doc.updates
      );
    }, {
      maxRetries: 3,
      operationName: `bulkUpdate-${doc._id}`
    });
    
    results.push(result);
  }
  
  return results;
}
```

### 4. Service Layer Integration

```javascript
class PatientService {
  constructor() {
    // Create a reusable retry wrapper for this service
    this.retry = createRetryWrapper({
      maxRetries: 5,
      initialDelayMs: 100,
      operationName: 'PatientService'
    });
  }
  
  async updatePatient(id, updates) {
    return await this.retry(async () => {
      const patient = await this.repository.findById(id);
      return await this.repository.optimisticUpdate(
        id,
        patient.__v,
        updates
      );
    });
  }
  
  async deletePatient(id) {
    return await this.retry(async () => {
      const patient = await this.repository.findById(id);
      return await this.repository.optimisticDelete(id, patient.__v);
    });
  }
}
```

## Error Handling

The retry helper only retries on specific errors:
- `VersionConflictError` - Optimistic locking conflicts
- `LockConflictError` - Pessimistic locking conflicts

All other errors are thrown immediately without retry.

```javascript
try {
  const result = await retryOnConflict(async () => {
    return await someOperation();
  });
} catch (error) {
  if (error instanceof VersionConflictError) {
    // All retries exhausted, still have conflict
    console.error('Unable to complete operation due to conflicts');
  } else if (error instanceof LockConflictError) {
    // Resource is locked and retries exhausted
    console.error('Resource is locked, try again later');
  } else {
    // Non-retryable error
    console.error('Operation failed:', error.message);
  }
}
```

## Exponential Backoff Behavior

The retry helper uses exponential backoff with jitter:

1. **Exponential Growth**: Each retry waits longer than the previous one
   - Attempt 0: 100ms
   - Attempt 1: 200ms
   - Attempt 2: 400ms
   - Attempt 3: 800ms
   - etc.

2. **Maximum Cap**: Delays are capped at `maxDelayMs` (default 5000ms)

3. **Jitter**: Random variation (±10% by default) prevents thundering herd

## Best Practices

1. **Set Appropriate Max Retries**: 
   - Use 3-5 retries for most operations
   - Use fewer retries (1-2) for user-facing operations
   - Use more retries (5-10) for background jobs

2. **Use Operation Names**: 
   - Always provide descriptive operation names for better logging
   - Include entity IDs in operation names for debugging

3. **Handle Exhausted Retries**:
   - Always catch errors and provide user-friendly messages
   - Log conflicts for monitoring and analysis

4. **Avoid Nested Retries**:
   - Don't wrap retry logic inside retry logic
   - Keep retry logic at the service layer

5. **Monitor Conflict Rates**:
   - High conflict rates indicate design issues
   - Consider redesigning data models or access patterns

## Configuration Recommendations

### User-Facing Operations
```javascript
{
  maxRetries: 2,
  initialDelayMs: 100,
  maxDelayMs: 1000,
  operationName: 'userOperation'
}
```

### Background Jobs
```javascript
{
  maxRetries: 10,
  initialDelayMs: 500,
  maxDelayMs: 30000,
  operationName: 'backgroundJob'
}
```

### Critical Operations
```javascript
{
  maxRetries: 5,
  initialDelayMs: 200,
  maxDelayMs: 5000,
  operationName: 'criticalOperation'
}
```

## Logging

The retry helper automatically logs:
- Retry attempts with error details
- Success after retries
- Exhausted retries (warnings)

All logs include:
- Operation name
- Attempt number
- Error type
- Current version (for version conflicts)
- Lock info (for lock conflicts)
- Next retry delay

Monitor these logs to identify:
- High-conflict operations
- Slow operations requiring many retries
- Operations that consistently fail
