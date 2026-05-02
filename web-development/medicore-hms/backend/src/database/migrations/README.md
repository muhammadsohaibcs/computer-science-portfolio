# Database Migrations

This directory contains database migration scripts for the Hospital Management System.

## Version Field Migration

### Overview

The `add-version-fields.js` migration adds optimistic locking support to existing documents in critical collections by adding a `__v` (version) field initialized to 0.

### Critical Collections

The following collections are updated by this migration:
- `patients`
- `appointments`
- `inventories`
- `bills`

### Usage

#### Running the Migration (Add Version Fields)

```bash
node backend/src/database/migrations/add-version-fields.js up
```

This will:
1. Connect to the MongoDB database using configuration from `db.config.js`
2. Find all documents in critical collections that don't have a `__v` field
3. Add `__v: 0` to those documents
4. Display a summary of the migration results

#### Rolling Back the Migration (Remove Version Fields)

```bash
node backend/src/database/migrations/add-version-fields.js down
```

This will:
1. Connect to the MongoDB database
2. Find all documents in critical collections that have a `__v` field
3. Remove the `__v` field from those documents
4. Display a summary of the rollback results

### Requirements

- Node.js environment with access to the backend dependencies
- Valid MongoDB connection configuration in `.env` file
- Appropriate database permissions to update documents

### Safety Features

- **Idempotent**: Running the migration multiple times is safe - it only updates documents that don't already have the version field
- **Rollback Support**: The `down` command provides a clean rollback mechanism
- **Logging**: All operations are logged to both console and log files
- **Error Handling**: Errors in one collection don't prevent processing of other collections
- **Summary Reports**: Detailed summary of affected documents after each run

### Example Output

```
=== Migration Summary (UP) ===
Total collections processed: 4
Total documents modified: 1523
Total errors: 0

Details:
  - patients: 450 documents updated
  - appointments: 823 documents updated
  - inventories: 125 documents updated
  - bills: 125 documents updated
==============================
```

### When to Run

Run this migration:
- **Before** deploying code that uses optimistic locking features
- **After** setting up a new environment with existing data
- **Before** enabling version-based conflict detection in the application

### Troubleshooting

**Connection Errors**: Ensure your `.env` file has the correct `MONGO_URI` configuration.

**Permission Errors**: Ensure your database user has write permissions on the collections.

**Partial Failures**: If some collections fail, check the logs for specific error messages. You can safely re-run the migration after fixing issues.

### Testing

The migration can be tested in a development environment:

1. Create test data without version fields
2. Run the migration with `up`
3. Verify documents have `__v: 0`
4. Run the rollback with `down`
5. Verify `__v` fields are removed

### Related Documentation

- See `backend/docs/LOCKING_GUIDE.md` for information on using optimistic locking
- See `backend/src/database/plugins/optimistic-locking.plugin.js` for the plugin implementation
- See Requirements 1.1 in `.kiro/specs/advanced-database-security/requirements.md`
