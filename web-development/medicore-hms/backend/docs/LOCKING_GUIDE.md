# Locking Guide for Hospital Management System

## Table of Contents

1. [Introduction](#introduction)
2. [When to Use Locking](#when-to-use-locking)
3. [Optimistic Locking](#optimistic-locking)
4. [Pessimistic Locking](#pessimistic-locking)
5. [Trade-offs and Comparison](#trade-offs-and-comparison)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

## Introduction

The Hospital Management System implements two concurrency control mechanisms to ensure data integrity in multi-user environments:

- **Optimistic Locking**: Uses version numbers to detect conflicts after they occur
- **Pessimistic Locking**: Prevents conflicts by explicitly locking resources before modification

This guide helps you choose the right locking strategy and implement it correctly.

## When to Use Locking

### Use Optimistic Locking When:

✅ **Conflicts are rare** - Most updates succeed without interference  
✅ **Read-heavy workloads** - Many reads, few writes  
✅ **Simple updates** - Single-step operations that can be retried easily  
✅ **Performance is critical** - Minimal overhead is required  
✅ **User-driven updates** - Users editing forms with save buttons

**Examples:**
- Updating patient contact information
- Modifying appointment details
- Updating inventory quantities
- Editing doctor schedules

### Use Pessimistic Locking When:

✅ **Conflicts are likely** - Multiple users frequently modify the same data  
✅ **Multi-step operations** - Complex transactions requiring consistency  
✅ **Critical operations** - Data integrity is paramount  
✅ **Long-running operations** - Operations that take significant time  
✅ **System-driven updates** - Automated processes that must succeed

**Examples:**
- Processing billing transactions with multiple steps
- Allocating limited resources (rooms, equipment)
- Batch operations on shared data
- Critical inventory adjustments

### Don't Use Locking When:

❌ **Append-only operations** - Creating new records  
❌ **Independent data** - No concurrent access expected  
❌ **Read-only operations** - No modifications occur  
❌ **Idempotent operations** - Safe to execute multiple times

## Optimistic Locking

### How It Works

Optimistic locking uses a version field (`__v`) that increments with each update. When updating, you provide the expected version. If the version doesn't match, the update fails with a conflict error.

```
User A reads document (version: 5)
User B reads document (version: 5)
User A updates document (version: 5 → 6) ✓ Success
User B updates document (version: 5 → 6) ✗ Conflict! Current version is 6
```

### Implementation

#### 1. Model Setup

Models with optimistic locking are already configured:

```javascript
// backend/src/models/patient.model.js
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // ... other fields
}, { 
  timestamps: true,
  optimisticConcurrency: true
});

// Apply optimistic locking plugin
patientSchema.plugin(optimisticLockingPlugin);
```

#### 2. Repository Usage

```javascript
// backend/src/services/patients.service.js
const PatientsRepository = require('../repositories/patients.repo');

class PatientsService {
  async updatePatientWithVersion(id, version, updateData) {
    try {
      // Use optimisticUpdate method from base repository
      const updated = await PatientsRepository.optimisticUpdate(
        id,
        version,
        updateData
      );
      
      return {
        success: true,
        data: updated
      };
    } catch (error) {
      if (error.name === 'VersionConflictError') {
        // Handle conflict - return current version to client
        return {
          success: false,
          error: 'CONFLICT',
          message: 'Document was modified by another user',
          currentVersion: error.currentVersion
        };
      }
      throw error;
    }
  }
}
```

#### 3. Controller Implementation

```javascript
// backend/src/controllers/patients.controller.js
async function updatePatient(req, res, next) {
  try {
    const { id } = req.params;
    const { __v: version, ...updateData } = req.body;
    
    // Validate version is provided
    if (version === undefined) {
      return res.status(400).json({
        error: 'Version field (__v) is required for updates'
      });
    }
    
    const result = await PatientsService.updatePatientWithVersion(
      id,
      version,
      updateData
    );
    
    if (!result.success) {
      return res.status(409).json({
        error: result.error,
        message: result.message,
        currentVersion: result.currentVersion
      });
    }
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}
```

#### 4. Frontend Integration

```javascript
// Frontend: Handling optimistic locking
async function updatePatient(patientId, patientData) {
  try {
    const response = await fetch(`/api/patients/${patientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData) // Include __v field
    });
    
    if (response.status === 409) {
      // Conflict detected
      const error = await response.json();
      
      // Option 1: Notify user and refresh
      alert('This record was modified by another user. Please refresh and try again.');
      
      // Option 2: Auto-retry with latest version
      const latest = await fetchPatient(patientId);
      return updatePatient(patientId, { ...patientData, __v: latest.__v });
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
}
```

### Retry Strategy

Implement exponential backoff for automatic retries:

```javascript
async function updateWithRetry(id, version, data, maxRetries = 3) {
  let attempt = 0;
  let delay = 100; // Start with 100ms
  
  while (attempt < maxRetries) {
    try {
      return await PatientsRepository.optimisticUpdate(id, version, data);
    } catch (error) {
      if (error.name === 'VersionConflictError' && attempt < maxRetries - 1) {
        attempt++;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        
        // Fetch latest version
        const latest = await PatientsRepository.findById(id);
        version = latest.__v;
        
        continue;
      }
      throw error;
    }
  }
}
```

## Pessimistic Locking

### How It Works

Pessimistic locking explicitly locks a resource before modification. Other operations must wait until the lock is released.

```
User A acquires lock on document ✓
User B tries to acquire lock ✗ Blocked (lock conflict)
User A performs operations
User A releases lock ✓
User B acquires lock ✓
```

### Implementation

#### 1. Basic Lock Acquisition

```javascript
// backend/src/services/bills.service.js
const LockingService = require('./locking.service');
const BillsRepository = require('../repositories/bills.repo');

class BillsService {
  async processBillWithLock(billId, userId) {
    const lockHolder = `user:${userId}`;
    const timeout = 30000; // 30 seconds
    
    try {
      // Acquire lock
      await LockingService.acquireLock(billId, lockHolder, timeout);
      
      // Perform operations while holding lock
      const bill = await BillsRepository.findById(billId);
      
      // Calculate totals
      const subtotal = bill.items.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.1;
      const total = subtotal + tax;
      
      // Update bill
      bill.subtotal = subtotal;
      bill.tax = tax;
      bill.total = total;
      bill.status = 'processed';
      
      await bill.save();
      
      // Release lock
      await LockingService.releaseLock(billId, lockHolder);
      
      return bill;
    } catch (error) {
      // Ensure lock is released even on error
      try {
        await LockingService.releaseLock(billId, lockHolder);
      } catch (releaseError) {
        // Lock might have expired or not been acquired
      }
      throw error;
    }
  }
}
```

#### 2. Using withLock Helper

The `withLock` method automatically handles lock acquisition and release:

```javascript
async function allocateRoom(roomId, patientId, userId) {
  const lockHolder = `user:${userId}`;
  
  return await LockingService.withLock(
    roomId,
    lockHolder,
    async () => {
      // This code runs while holding the lock
      const room = await RoomsRepository.findById(roomId);
      
      if (room.status !== 'available') {
        throw new Error('Room is not available');
      }
      
      room.status = 'occupied';
      room.currentPatient = patientId;
      room.occupiedAt = new Date();
      
      await room.save();
      
      return room;
    },
    30000 // 30 second timeout
  );
}
```

#### 3. Repository-Level Locking

```javascript
// Using repository methods directly
async function updateInventoryWithLock(itemId, quantity, userId) {
  const lockHolder = `user:${userId}`;
  
  try {
    // Find and lock in one operation
    const item = await InventoryRepository.findByIdWithLock(
      itemId,
      lockHolder,
      30000
    );
    
    // Perform updates
    if (item.quantity < quantity) {
      throw new Error('Insufficient inventory');
    }
    
    item.quantity -= quantity;
    item.lastUpdated = new Date();
    await item.save();
    
    // Release lock
    await InventoryRepository.releaseLock(itemId, lockHolder);
    
    return item;
  } catch (error) {
    // Cleanup on error
    try {
      await InventoryRepository.releaseLock(itemId, lockHolder);
    } catch (e) {
      // Ignore release errors
    }
    throw error;
  }
}
```

#### 4. Handling Lock Conflicts

```javascript
async function tryAllocateRoom(roomId, patientId, userId) {
  try {
    return await allocateRoom(roomId, patientId, userId);
  } catch (error) {
    if (error.name === 'LockConflictError') {
      // Lock is held by another operation
      return {
        success: false,
        error: 'LOCKED',
        message: 'Room is currently being allocated by another user',
        lockHolder: error.lockInfo.lockHolder,
        lockedSince: error.lockInfo.acquiredAt
      };
    }
    
    if (error.name === 'LockTimeoutError') {
      // Operation took too long
      return {
        success: false,
        error: 'TIMEOUT',
        message: 'Operation timed out'
      };
    }
    
    throw error;
  }
}
```

### Lock Cleanup

Locks automatically expire based on TTL, but you can manually clean up expired locks:

```javascript
// Run periodically (e.g., via cron job)
async function cleanupExpiredLocks() {
  const count = await LockingService.cleanupExpiredLocks();
  console.log(`Cleaned up ${count} expired locks`);
}

// Schedule cleanup every 5 minutes
setInterval(cleanupExpiredLocks, 5 * 60 * 1000);
```

## Trade-offs and Comparison

| Aspect | Optimistic Locking | Pessimistic Locking |
|--------|-------------------|---------------------|
| **Performance** | ✅ High - No lock overhead | ⚠️ Moderate - Lock management overhead |
| **Scalability** | ✅ Excellent - No blocking | ⚠️ Good - Can cause contention |
| **Complexity** | ✅ Simple - Version field only | ⚠️ Complex - Lock management required |
| **Conflict Handling** | ⚠️ After-the-fact detection | ✅ Prevention before operation |
| **User Experience** | ⚠️ May require retry | ✅ Guaranteed success once locked |
| **Database Load** | ✅ Minimal | ⚠️ Additional lock collection |
| **Deadlock Risk** | ✅ None | ⚠️ Possible with multiple locks |
| **Best For** | High-read, low-conflict | High-conflict, critical operations |

### Performance Impact

**Optimistic Locking:**
- Read: No overhead
- Write: +1 field increment (~1% overhead)
- Conflict: Requires retry (user-initiated)

**Pessimistic Locking:**
- Lock acquisition: ~5-10ms
- Lock release: ~5-10ms
- Total overhead: ~10-20ms per operation
- Conflict: Blocks until lock available

### Scalability Considerations

**Optimistic Locking:**
- Scales linearly with load
- No contention points
- Suitable for distributed systems

**Pessimistic Locking:**
- Can create bottlenecks under high contention
- Lock collection becomes hot spot
- Consider sharding lock collection for scale

## Best Practices

### General Guidelines

1. **Default to Optimistic Locking**
   - Use optimistic locking as the default strategy
   - Only use pessimistic locking when necessary

2. **Always Include Version in Updates**
   ```javascript
   // ✅ Good
   await repository.optimisticUpdate(id, version, data);
   
   // ❌ Bad - bypasses version check
   await repository.update(id, data);
   ```

3. **Handle Conflicts Gracefully**
   ```javascript
   // ✅ Good - Inform user and provide options
   if (error.name === 'VersionConflictError') {
     return res.status(409).json({
       message: 'Record was modified. Please refresh and try again.',
       currentVersion: error.currentVersion
     });
   }
   
   // ❌ Bad - Generic error
   throw error;
   ```

4. **Set Appropriate Lock Timeouts**
   ```javascript
   // ✅ Good - Reasonable timeout
   await LockingService.acquireLock(id, holder, 30000); // 30s
   
   // ❌ Bad - Too long, blocks others
   await LockingService.acquireLock(id, holder, 300000); // 5min
   ```

5. **Always Release Locks**
   ```javascript
   // ✅ Good - Use try/finally or withLock
   try {
     await LockingService.acquireLock(id, holder);
     // ... operations
   } finally {
     await LockingService.releaseLock(id, holder);
   }
   
   // ✅ Better - Use withLock helper
   await LockingService.withLock(id, holder, async () => {
     // ... operations
   });
   ```

### Optimistic Locking Best Practices

1. **Fetch Before Update**
   ```javascript
   // ✅ Good - Get current version first
   const patient = await repository.findById(id);
   const updated = await repository.optimisticUpdate(
     id,
     patient.__v,
     updateData
   );
   ```

2. **Implement Retry Logic**
   ```javascript
   // ✅ Good - Retry with exponential backoff
   async function updateWithRetry(id, data, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         const doc = await repository.findById(id);
         return await repository.optimisticUpdate(id, doc.__v, data);
       } catch (error) {
         if (error.name === 'VersionConflictError' && i < maxRetries - 1) {
           await sleep(Math.pow(2, i) * 100);
           continue;
         }
         throw error;
       }
     }
   }
   ```

3. **Return Version to Client**
   ```javascript
   // ✅ Good - Include version in response
   res.json({
     data: patient,
     __v: patient.__v // Client needs this for next update
   });
   ```

### Pessimistic Locking Best Practices

1. **Use Descriptive Lock Holders**
   ```javascript
   // ✅ Good - Identifiable lock holder
   const lockHolder = `user:${userId}:operation:${operationType}`;
   
   // ❌ Bad - Generic holder
   const lockHolder = 'user';
   ```

2. **Keep Lock Duration Short**
   ```javascript
   // ✅ Good - Minimal lock duration
   await LockingService.withLock(id, holder, async () => {
     const data = await fetchData(id);
     const processed = processData(data); // Fast operation
     await saveData(id, processed);
   });
   
   // ❌ Bad - Long-running operation under lock
   await LockingService.withLock(id, holder, async () => {
     await sendEmail(); // Slow external call
     await generateReport(); // CPU-intensive
   });
   ```

3. **Avoid Nested Locks**
   ```javascript
   // ❌ Bad - Risk of deadlock
   await LockingService.withLock(id1, holder, async () => {
     await LockingService.withLock(id2, holder, async () => {
       // Nested locks can deadlock
     });
   });
   
   // ✅ Good - Lock multiple resources at once
   await Promise.all([
     LockingService.acquireLock(id1, holder),
     LockingService.acquireLock(id2, holder)
   ]);
   try {
     // ... operations
   } finally {
     await Promise.all([
       LockingService.releaseLock(id1, holder),
       LockingService.releaseLock(id2, holder)
     ]);
   }
   ```

4. **Monitor Lock Metrics**
   ```javascript
   // Log lock operations for monitoring
   const startTime = Date.now();
   await LockingService.acquireLock(id, holder);
   
   try {
     // ... operations
   } finally {
     const duration = Date.now() - startTime;
     logger.info({ resourceId: id, duration }, 'Lock held');
     await LockingService.releaseLock(id, holder);
   }
   ```

## Common Patterns

### Pattern 1: Read-Modify-Write with Optimistic Locking

```javascript
async function incrementInventory(itemId, quantity) {
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Read
      const item = await InventoryRepository.findById(itemId);
      
      // Modify
      const newQuantity = item.quantity + quantity;
      
      // Write with version check
      return await InventoryRepository.optimisticUpdate(
        itemId,
        item.__v,
        { quantity: newQuantity }
      );
    } catch (error) {
      if (error.name === 'VersionConflictError' && attempt < maxRetries - 1) {
        // Retry on conflict
        await sleep(Math.pow(2, attempt) * 100);
        continue;
      }
      throw error;
    }
  }
}
```

### Pattern 2: Batch Operations with Pessimistic Locking

```javascript
async function processBatchBills(billIds, userId) {
  const lockHolder = `user:${userId}:batch`;
  const results = [];
  
  for (const billId of billIds) {
    try {
      const result = await LockingService.withLock(
        billId,
        lockHolder,
        async () => {
          const bill = await BillsRepository.findById(billId);
          // Process bill
          bill.status = 'processed';
          await bill.save();
          return bill;
        },
        10000 // 10 second timeout per bill
      );
      
      results.push({ billId, success: true, data: result });
    } catch (error) {
      results.push({ billId, success: false, error: error.message });
    }
  }
  
  return results;
}
```

### Pattern 3: Hybrid Approach

Use pessimistic locking for critical sections, optimistic for the rest:

```javascript
async function transferInventory(fromId, toId, quantity, userId) {
  const lockHolder = `user:${userId}`;
  
  // Lock both items to prevent race conditions
  await Promise.all([
    LockingService.acquireLock(fromId, lockHolder),
    LockingService.acquireLock(toId, lockHolder)
  ]);
  
  try {
    // Use optimistic locking within the locked section
    const fromItem = await InventoryRepository.findById(fromId);
    const toItem = await InventoryRepository.findById(toId);
    
    if (fromItem.quantity < quantity) {
      throw new Error('Insufficient quantity');
    }
    
    // Update both with version checks
    await InventoryRepository.optimisticUpdate(
      fromId,
      fromItem.__v,
      { quantity: fromItem.quantity - quantity }
    );
    
    await InventoryRepository.optimisticUpdate(
      toId,
      toItem.__v,
      { quantity: toItem.quantity + quantity }
    );
    
    return { success: true };
  } finally {
    // Release both locks
    await Promise.all([
      LockingService.releaseLock(fromId, lockHolder),
      LockingService.releaseLock(toId, lockHolder)
    ]);
  }
}
```

### Pattern 4: Conditional Locking

```javascript
async function updateAppointment(appointmentId, updates, userId) {
  const appointment = await AppointmentsRepository.findById(appointmentId);
  
  // Use pessimistic locking only for status changes
  if (updates.status && updates.status !== appointment.status) {
    const lockHolder = `user:${userId}`;
    
    return await LockingService.withLock(
      appointmentId,
      lockHolder,
      async () => {
        // Verify status transition is valid
        const current = await AppointmentsRepository.findById(appointmentId);
        validateStatusTransition(current.status, updates.status);
        
        // Update with optimistic locking
        return await AppointmentsRepository.optimisticUpdate(
          appointmentId,
          current.__v,
          updates
        );
      }
    );
  }
  
  // Use optimistic locking for other updates
  return await AppointmentsRepository.optimisticUpdate(
    appointmentId,
    appointment.__v,
    updates
  );
}
```

## Troubleshooting

### Issue: High Conflict Rate

**Symptoms:**
- Frequent `VersionConflictError` exceptions
- Users reporting "document modified" errors
- Retry logic executing often

**Solutions:**
1. Analyze conflict patterns - which documents/operations?
2. Consider pessimistic locking for high-conflict resources
3. Implement better retry strategies with backoff
4. Reduce update frequency (batch updates)
5. Partition data to reduce contention

### Issue: Lock Timeouts

**Symptoms:**
- `LockTimeoutError` exceptions
- Operations taking too long
- Users experiencing delays

**Solutions:**
1. Increase lock timeout for legitimate long operations
2. Optimize operations to complete faster
3. Move slow operations (external calls) outside lock
4. Check for deadlocks (circular lock dependencies)
5. Monitor lock hold duration

### Issue: Orphaned Locks

**Symptoms:**
- Resources permanently locked
- Lock cleanup not working
- Manual intervention required

**Solutions:**
1. Verify TTL index exists on locks collection:
   ```javascript
   db.document_locks.getIndexes()
   ```
2. Ensure lock expiration times are set correctly
3. Run manual cleanup:
   ```javascript
   await LockingService.cleanupExpiredLocks()
   ```
4. Check application crashes during lock hold
5. Implement proper error handling with finally blocks

### Issue: Version Field Missing

**Symptoms:**
- `optimisticUpdate` fails with validation error
- Version field undefined

**Solutions:**
1. Verify model has optimistic locking plugin applied
2. Run migration to add version fields to existing documents:
   ```javascript
   db.patients.updateMany(
     { __v: { $exists: false } },
     { $set: { __v: 0 } }
   )
   ```
3. Ensure client includes version in update requests

### Issue: Deadlocks

**Symptoms:**
- Operations hang indefinitely
- Multiple locks waiting on each other
- Timeout errors

**Solutions:**
1. Avoid nested locks when possible
2. Always acquire multiple locks in consistent order:
   ```javascript
   // ✅ Good - Consistent order
   const ids = [id1, id2].sort();
   await LockingService.acquireLock(ids[0], holder);
   await LockingService.acquireLock(ids[1], holder);
   ```
3. Use shorter timeouts to detect deadlocks faster
4. Implement deadlock detection and retry logic

### Debugging Tips

1. **Enable Lock Logging:**
   ```javascript
   // In locking.service.js
   logger.debug({
     resourceId,
     lockHolder,
     action: 'acquire'
   }, 'Lock operation');
   ```

2. **Monitor Active Locks:**
   ```javascript
   async function getActiveLocks() {
     return await mongoose.connection
       .collection('document_locks')
       .find({ expiresAt: { $gt: new Date() } })
       .toArray();
   }
   ```

3. **Track Version Conflicts:**
   ```javascript
   // In conflict-handler.middleware.js
   logger.warn({
     resourceId: req.params.id,
     attemptedVersion: req.body.__v,
     currentVersion: err.currentVersion,
     user: req.user.id
   }, 'Version conflict');
   ```

## Summary

- **Default to optimistic locking** for most operations
- **Use pessimistic locking** for critical, high-conflict operations
- **Always handle conflicts gracefully** with clear user feedback
- **Implement retry logic** for optimistic locking
- **Keep locks short** and always release them
- **Monitor metrics** to identify issues early
- **Test under load** to validate locking strategy

For more information, see:
- [Optimistic Locking Plugin](../src/database/plugins/optimistic-locking.plugin.js)
- [Locking Service](../src/services/locking.service.js)
- [Base Repository](../src/repositories/base.repo.js)
- [Conflict Handler Middleware](../src/middleware/conflict-handler.middleware.js)
