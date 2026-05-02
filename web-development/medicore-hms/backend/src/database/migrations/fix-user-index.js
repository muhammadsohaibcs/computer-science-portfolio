/**
 * Migration: Fix user index to be sparse
 * Drops the old unique index on user field and recreates it as sparse
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function fixUserIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Drop old indexes
    try {
      await db.collection('doctors').dropIndex('user_1');
      console.log('Dropped doctors.user_1 index');
    } catch (error) {
      console.log('doctors.user_1 index does not exist or already dropped');
    }

    try {
      await db.collection('staff').dropIndex('user_1');
      console.log('Dropped staff.user_1 index');
    } catch (error) {
      console.log('staff.user_1 index does not exist or already dropped');
    }

    // Create new sparse unique indexes
    await db.collection('doctors').createIndex({ user: 1 }, { unique: true, sparse: true });
    console.log('Created sparse unique index on doctors.user');

    await db.collection('staff').createIndex({ user: 1 }, { unique: true, sparse: true });
    console.log('Created sparse unique index on staff.user');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
fixUserIndex();
