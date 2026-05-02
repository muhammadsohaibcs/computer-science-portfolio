const { expect } = require('chai');
const idGeneratorService = require('../src/services/id-generator.service');
const Counter = require('../src/models/counter.model');
const mongoose = require('mongoose');

describe('ID Generator Service', () => {
  before(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/hospital-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  after(async () => {
    // Clean up and disconnect
    await Counter.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear counters before each test
    await Counter.deleteMany({});
  });

  describe('generateId', () => {
    it('should generate ID with correct format', async () => {
      const id = await idGeneratorService.generateId('DOC', 'Doctor ID');
      expect(id).to.equal('DOC001');
    });

    it('should increment sequence for subsequent calls', async () => {
      const id1 = await idGeneratorService.generateId('PAT', 'Patient ID');
      const id2 = await idGeneratorService.generateId('PAT', 'Patient ID');
      const id3 = await idGeneratorService.generateId('PAT', 'Patient ID');
      
      expect(id1).to.equal('PAT001');
      expect(id2).to.equal('PAT002');
      expect(id3).to.equal('PAT003');
    });

    it('should handle concurrent requests atomically', async () => {
      // Generate 10 IDs concurrently
      const promises = Array(10).fill(null).map(() => 
        idGeneratorService.generateId('APT', 'Appointment ID')
      );
      
      const ids = await Promise.all(promises);
      
      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).to.equal(10);
      
      // IDs should be in sequence (though order may vary)
      const sequences = ids.map(id => parseInt(id.replace('APT', '')));
      sequences.sort((a, b) => a - b);
      expect(sequences).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should pad sequence numbers with zeros', async () => {
      // Generate 9 IDs to get to 009
      for (let i = 0; i < 9; i++) {
        await idGeneratorService.generateId('LAB', 'Lab ID');
      }
      
      const id = await idGeneratorService.generateId('LAB', 'Lab ID');
      expect(id).to.equal('LAB010');
    });

    it('should handle different prefixes independently', async () => {
      const docId = await idGeneratorService.generateId('DOC', 'Doctor ID');
      const patId = await idGeneratorService.generateId('PAT', 'Patient ID');
      const docId2 = await idGeneratorService.generateId('DOC', 'Doctor ID');
      
      expect(docId).to.equal('DOC001');
      expect(patId).to.equal('PAT001');
      expect(docId2).to.equal('DOC002');
    });
  });

  describe('Entity-specific ID generators', () => {
    it('should generate Doctor ID', async () => {
      const id = await idGeneratorService.generateDoctorId();
      expect(id).to.match(/^DOC\d{3}$/);
    });

    it('should generate Patient ID', async () => {
      const id = await idGeneratorService.generatePatientId();
      expect(id).to.match(/^PAT\d{3}$/);
    });

    it('should generate Staff ID', async () => {
      const id = await idGeneratorService.generateStaffId();
      expect(id).to.match(/^STF\d{3}$/);
    });

    it('should generate Appointment ID', async () => {
      const id = await idGeneratorService.generateAppointmentId();
      expect(id).to.match(/^APT\d{3}$/);
    });

    it('should generate Lab Order ID', async () => {
      const id = await idGeneratorService.generateLabOrderId();
      expect(id).to.match(/^LAB\d{3}$/);
    });

    it('should generate Prescription ID', async () => {
      const id = await idGeneratorService.generatePrescriptionId();
      expect(id).to.match(/^PRX\d{3}$/);
    });

    it('should generate Room ID', async () => {
      const id = await idGeneratorService.generateRoomId();
      expect(id).to.match(/^ROM\d{3}$/);
    });

    it('should generate Bill ID', async () => {
      const id = await idGeneratorService.generateBillId();
      expect(id).to.match(/^BIL\d{3}$/);
    });

    it('should generate Department ID', async () => {
      const id = await idGeneratorService.generateDepartmentId();
      expect(id).to.match(/^DEP\d{3}$/);
    });
  });

  describe('getCurrentSequence', () => {
    it('should return 0 for non-existent prefix', async () => {
      const sequence = await idGeneratorService.getCurrentSequence('NEW');
      expect(sequence).to.equal(0);
    });

    it('should return current sequence without incrementing', async () => {
      await idGeneratorService.generateId('DOC', 'Doctor ID');
      await idGeneratorService.generateId('DOC', 'Doctor ID');
      
      const sequence = await idGeneratorService.getCurrentSequence('DOC');
      expect(sequence).to.equal(2);
      
      // Verify it didn't increment
      const sequenceAgain = await idGeneratorService.getCurrentSequence('DOC');
      expect(sequenceAgain).to.equal(2);
    });
  });

  describe('resetCounter', () => {
    it('should reset counter to 0', async () => {
      await idGeneratorService.generateId('DOC', 'Doctor ID');
      await idGeneratorService.generateId('DOC', 'Doctor ID');
      
      await idGeneratorService.resetCounter('DOC');
      
      const sequence = await idGeneratorService.getCurrentSequence('DOC');
      expect(sequence).to.equal(0);
      
      const newId = await idGeneratorService.generateId('DOC', 'Doctor ID');
      expect(newId).to.equal('DOC001');
    });
  });
});
