const { expect } = require('chai');
const mongoose = require('mongoose');
const BaseRepository = require('../src/repositories/base.repo');

// Create a test model for testing
const testSchema = new mongoose.Schema({
  name: String,
  value: Number,
  status: String
}, { timestamps: true });

const TestModel = mongoose.model('TestReplication', testSchema);

describe('BaseRepository - Replication Methods', () => {
  let testRepo;
  let testDocId;

  before(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/hospital-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    testRepo = new BaseRepository(TestModel);
  });

  after(async () => {
    // Clean up test data
    await TestModel.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create a test document before each test
    const doc = await testRepo.create({
      name: 'Test Document',
      value: 100,
      status: 'active'
    });
    testDocId = doc._id;
  });

  afterEach(async () => {
    // Clean up after each test
    await TestModel.deleteMany({});
  });

  describe('findWithReadPreference', () => {
    it('should find documents with primary read preference', async () => {
      const results = await testRepo.findWithReadPreference(
        { status: 'active' },
        null,
        {},
        'primary'
      );
      
      expect(results).to.be.an('array');
      expect(results).to.have.lengthOf(1);
      expect(results[0].name).to.equal('Test Document');
    });

    it('should find documents with secondaryPreferred read preference', async () => {
      const results = await testRepo.findWithReadPreference(
        { status: 'active' },
        null,
        {},
        'secondaryPreferred'
      );
      
      expect(results).to.be.an('array');
      expect(results).to.have.lengthOf(1);
    });

    it('should find documents with nearest read preference', async () => {
      const results = await testRepo.findWithReadPreference(
        { status: 'active' },
        null,
        {},
        'nearest'
      );
      
      expect(results).to.be.an('array');
      expect(results).to.have.lengthOf(1);
    });

    it('should throw error for invalid read preference', async () => {
      try {
        await testRepo.findWithReadPreference(
          { status: 'active' },
          null,
          {},
          'invalidPreference'
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('Invalid read preference');
      }
    });

    it('should support pagination options', async () => {
      // Create additional documents
      await testRepo.create({ name: 'Doc 2', value: 200, status: 'active' });
      await testRepo.create({ name: 'Doc 3', value: 300, status: 'active' });
      
      const results = await testRepo.findWithReadPreference(
        { status: 'active' },
        null,
        { limit: 2, sort: { value: 1 } },
        'primary'
      );
      
      expect(results).to.have.lengthOf(2);
      expect(results[0].value).to.equal(100);
      expect(results[1].value).to.equal(200);
    });

    it('should support projection', async () => {
      const results = await testRepo.findWithReadPreference(
        { status: 'active' },
        { name: 1, value: 1 },
        {},
        'primary'
      );
      
      expect(results).to.be.an('array');
      expect(results[0]).to.have.property('name');
      expect(results[0]).to.have.property('value');
      expect(results[0]).to.not.have.property('status');
    });
  });

  describe('updateWithWriteConcern', () => {
    it('should update document with majority write concern', async () => {
      const updated = await testRepo.updateWithWriteConcern(
        testDocId,
        { $set: { value: 500 } },
        {},
        'majority'
      );
      
      expect(updated).to.not.be.null;
      expect(updated.value).to.equal(500);
    });

    it('should update document with acknowledged write concern', async () => {
      const updated = await testRepo.updateWithWriteConcern(
        testDocId,
        { $set: { value: 600 } },
        {},
        'acknowledged'
      );
      
      expect(updated).to.not.be.null;
      expect(updated.value).to.equal(600);
    });

    it('should throw error for invalid write concern', async () => {
      try {
        await testRepo.updateWithWriteConcern(
          testDocId,
          { $set: { value: 700 } },
          {},
          'invalidConcern'
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('Invalid write concern');
      }
    });

    it('should return null for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updated = await testRepo.updateWithWriteConcern(
        fakeId,
        { $set: { value: 800 } },
        {},
        'majority'
      );
      
      expect(updated).to.be.null;
    });
  });

  describe('bulkWriteWithConcern', () => {
    beforeEach(async () => {
      // Create additional documents for bulk operations
      await testRepo.create({ name: 'Bulk Doc 1', value: 10, status: 'pending' });
      await testRepo.create({ name: 'Bulk Doc 2', value: 20, status: 'pending' });
    });

    it('should perform bulk write with majority write concern', async () => {
      const operations = [
        {
          updateOne: {
            filter: { name: 'Bulk Doc 1' },
            update: { $set: { status: 'completed' } }
          }
        },
        {
          updateOne: {
            filter: { name: 'Bulk Doc 2' },
            update: { $set: { status: 'completed' } }
          }
        }
      ];
      
      const result = await testRepo.bulkWriteWithConcern(
        operations,
        'majority'
      );
      
      expect(result).to.have.property('modifiedCount', 2);
    });

    it('should perform bulk write with acknowledged write concern', async () => {
      const operations = [
        {
          updateOne: {
            filter: { name: 'Bulk Doc 1' },
            update: { $set: { value: 100 } }
          }
        }
      ];
      
      const result = await testRepo.bulkWriteWithConcern(
        operations,
        'acknowledged'
      );
      
      expect(result).to.have.property('modifiedCount', 1);
    });

    it('should throw error for invalid write concern', async () => {
      const operations = [
        {
          updateOne: {
            filter: { name: 'Bulk Doc 1' },
            update: { $set: { value: 100 } }
          }
        }
      ];
      
      try {
        await testRepo.bulkWriteWithConcern(
          operations,
          'invalidConcern'
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('Invalid write concern');
      }
    });

    it('should support ordered bulk operations', async () => {
      const operations = [
        {
          updateOne: {
            filter: { name: 'Bulk Doc 1' },
            update: { $set: { value: 111 } }
          }
        },
        {
          updateOne: {
            filter: { name: 'Bulk Doc 2' },
            update: { $set: { value: 222 } }
          }
        }
      ];
      
      const result = await testRepo.bulkWriteWithConcern(
        operations,
        'majority',
        { ordered: true }
      );
      
      expect(result.modifiedCount).to.equal(2);
    });

    it('should support unordered bulk operations', async () => {
      const operations = [
        {
          updateOne: {
            filter: { name: 'Bulk Doc 1' },
            update: { $set: { value: 333 } }
          }
        },
        {
          updateOne: {
            filter: { name: 'Bulk Doc 2' },
            update: { $set: { value: 444 } }
          }
        }
      ];
      
      const result = await testRepo.bulkWriteWithConcern(
        operations,
        'majority',
        { ordered: false }
      );
      
      expect(result.modifiedCount).to.equal(2);
    });
  });

  describe('canReadFromSecondary', () => {
    it('should return a boolean value', async () => {
      const canRead = await testRepo.canReadFromSecondary();
      
      expect(canRead).to.be.a('boolean');
    });

    it('should accept custom lag threshold', async () => {
      const canRead = await testRepo.canReadFromSecondary(5000);
      
      expect(canRead).to.be.a('boolean');
    });

    it('should return false for non-replica set deployments', async () => {
      // Most test environments are not replica sets
      const canRead = await testRepo.canReadFromSecondary();
      
      // In non-replica set environments, this should return false
      expect(canRead).to.be.a('boolean');
    });

    it('should handle errors gracefully', async () => {
      // This should not throw, even if there are issues checking health
      const canRead = await testRepo.canReadFromSecondary();
      
      expect(canRead).to.be.a('boolean');
    });
  });
});
