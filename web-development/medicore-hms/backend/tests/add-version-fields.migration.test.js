/**
 * Tests for add-version-fields migration
 * 
 * These tests verify the migration logic for adding version fields
 * to critical collections.
 * 
 * Note: These tests require a running MongoDB instance.
 * Set TEST_MONGO_URI environment variable or use default connection.
 */

const { expect } = require('chai');
const mongoose = require('mongoose');
const migration = require('../src/database/migrations/add-version-fields');

describe('Version Field Migration', function() {
  this.timeout(10000); // Increase timeout for database operations
  
  let testCollection;
  const TEST_DB_NAME = 'hms_migration_test';

  before(async function() {
    // Use test database URI or default
    const testUri = process.env.TEST_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/' + TEST_DB_NAME;
    
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testUri);
    }
  });

  after(async function() {
    // Clean up and disconnect
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  beforeEach(async function() {
    // Create test collection
    testCollection = mongoose.connection.collection('patients');
    await testCollection.deleteMany({});
  });

  afterEach(async function() {
    // Clean up test data
    if (testCollection) {
      await testCollection.deleteMany({});
    }
  });

  describe('addVersionField', function() {
    it('should add __v: 0 to documents without version field', async function() {
      // Insert test documents without __v field
      await testCollection.insertMany([
        { name: 'Patient 1', dob: new Date('1990-01-01') },
        { name: 'Patient 2', dob: new Date('1985-05-15') },
        { name: 'Patient 3', dob: new Date('2000-12-25') }
      ]);

      // Run migration
      const result = await migration.addVersionField('patients');

      // Verify results
      expect(result.modified).to.equal(3);
      expect(result.collection).to.equal('patients');

      // Verify documents have __v field
      const documents = await testCollection.find({}).toArray();
      expect(documents).to.have.lengthOf(3);
      documents.forEach(doc => {
        expect(doc.__v).to.equal(0);
      });
    });

    it('should not modify documents that already have version field', async function() {
      // Insert documents with __v field
      await testCollection.insertMany([
        { name: 'Patient 1', __v: 5 },
        { name: 'Patient 2', __v: 3 }
      ]);

      // Run migration
      const result = await migration.addVersionField('patients');

      // Verify no modifications
      expect(result.modified).to.equal(0);

      // Verify __v values unchanged
      const documents = await testCollection.find({}).toArray();
      expect(documents[0].__v).to.equal(5);
      expect(documents[1].__v).to.equal(3);
    });

    it('should handle mixed documents (some with, some without version)', async function() {
      // Insert mixed documents
      await testCollection.insertMany([
        { name: 'Patient 1', __v: 2 },
        { name: 'Patient 2' },
        { name: 'Patient 3', __v: 7 },
        { name: 'Patient 4' }
      ]);

      // Run migration
      const result = await migration.addVersionField('patients');

      // Verify only documents without __v were modified
      expect(result.modified).to.equal(2);

      // Verify all documents now have __v
      const documents = await testCollection.find({}).toArray();
      expect(documents).to.have.lengthOf(4);
      
      const patient1 = documents.find(d => d.name === 'Patient 1');
      const patient2 = documents.find(d => d.name === 'Patient 2');
      const patient3 = documents.find(d => d.name === 'Patient 3');
      const patient4 = documents.find(d => d.name === 'Patient 4');
      
      expect(patient1.__v).to.equal(2); // Unchanged
      expect(patient2.__v).to.equal(0); // Added
      expect(patient3.__v).to.equal(7); // Unchanged
      expect(patient4.__v).to.equal(0); // Added
    });

    it('should handle empty collection', async function() {
      // Run migration on empty collection
      const result = await migration.addVersionField('patients');

      // Verify no modifications
      expect(result.modified).to.equal(0);
      expect(result.total).to.equal(0);
    });
  });

  describe('removeVersionField', function() {
    it('should remove __v field from all documents', async function() {
      // Insert documents with __v field
      await testCollection.insertMany([
        { name: 'Patient 1', __v: 0 },
        { name: 'Patient 2', __v: 5 },
        { name: 'Patient 3', __v: 10 }
      ]);

      // Run rollback
      const result = await migration.removeVersionField('patients');

      // Verify results
      expect(result.modified).to.equal(3);
      expect(result.collection).to.equal('patients');

      // Verify __v field removed
      const documents = await testCollection.find({}).toArray();
      expect(documents).to.have.lengthOf(3);
      documents.forEach(doc => {
        expect(doc.__v).to.be.undefined;
      });
    });

    it('should not modify documents without version field', async function() {
      // Insert documents without __v field
      await testCollection.insertMany([
        { name: 'Patient 1' },
        { name: 'Patient 2' }
      ]);

      // Run rollback
      const result = await migration.removeVersionField('patients');

      // Verify no modifications
      expect(result.modified).to.equal(0);
    });

    it('should handle empty collection', async function() {
      // Run rollback on empty collection
      const result = await migration.removeVersionField('patients');

      // Verify no modifications
      expect(result.modified).to.equal(0);
      expect(result.total).to.equal(0);
    });
  });

  describe('Migration idempotency', function() {
    it('running migration twice should be safe', async function() {
      // Insert test documents
      await testCollection.insertMany([
        { name: 'Patient 1' },
        { name: 'Patient 2' }
      ]);

      // Run migration first time
      const result1 = await migration.addVersionField('patients');
      expect(result1.modified).to.equal(2);

      // Run migration second time
      const result2 = await migration.addVersionField('patients');
      expect(result2.modified).to.equal(0);

      // Verify documents still have __v: 0
      const documents = await testCollection.find({}).toArray();
      documents.forEach(doc => {
        expect(doc.__v).to.equal(0);
      });
    });

    it('migration up then down should restore original state', async function() {
      // Insert test documents without version
      await testCollection.insertMany([
        { name: 'Patient 1', dob: new Date('1990-01-01') },
        { name: 'Patient 2', dob: new Date('1985-05-15') }
      ]);

      // Get original documents
      const originalDocs = await testCollection.find({}).toArray();
      expect(originalDocs[0].__v).to.be.undefined;

      // Run migration up
      await migration.addVersionField('patients');

      // Verify __v added
      const migratedDocs = await testCollection.find({}).toArray();
      expect(migratedDocs[0].__v).to.equal(0);

      // Run migration down
      await migration.removeVersionField('patients');

      // Verify __v removed
      const rolledBackDocs = await testCollection.find({}).toArray();
      expect(rolledBackDocs[0].__v).to.be.undefined;
      expect(rolledBackDocs[0].name).to.equal('Patient 1');
    });
  });
});
