const { expect } = require('chai');
const replicaHealthService = require('../src/services/replica-health.service');
const mongoose = require('mongoose');

describe('Replica Health Service', () => {
  before(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/hospital-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  after(async () => {
    // Stop monitoring and disconnect
    replicaHealthService.stopMonitoring();
    await mongoose.connection.close();
  });

  afterEach(() => {
    // Ensure monitoring is stopped after each test
    if (replicaHealthService.getMonitoringStatus().isMonitoring) {
      replicaHealthService.stopMonitoring();
    }
  });

  describe('getMonitoringStatus', () => {
    it('should return monitoring status with correct properties', () => {
      const status = replicaHealthService.getMonitoringStatus();
      
      expect(status).to.have.property('isMonitoring');
      expect(status).to.have.property('checkIntervalMs');
      expect(status).to.have.property('lagThresholdMs');
      expect(status.isMonitoring).to.be.a('boolean');
      expect(status.checkIntervalMs).to.be.a('number');
      expect(status.lagThresholdMs).to.be.a('number');
    });

    it('should show isMonitoring as false initially', () => {
      const status = replicaHealthService.getMonitoringStatus();
      
      expect(status.isMonitoring).to.be.false;
    });
  });

  describe('startMonitoring', () => {
    it('should start monitoring and update status', () => {
      replicaHealthService.startMonitoring(60000);
      
      const status = replicaHealthService.getMonitoringStatus();
      expect(status.isMonitoring).to.be.true;
      
      replicaHealthService.stopMonitoring();
    });

    it('should not start monitoring twice', () => {
      replicaHealthService.startMonitoring(60000);
      
      // Try to start again
      replicaHealthService.startMonitoring(60000);
      
      const status = replicaHealthService.getMonitoringStatus();
      expect(status.isMonitoring).to.be.true;
      
      replicaHealthService.stopMonitoring();
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring and update status', () => {
      replicaHealthService.startMonitoring(60000);
      expect(replicaHealthService.getMonitoringStatus().isMonitoring).to.be.true;
      
      replicaHealthService.stopMonitoring();
      
      const status = replicaHealthService.getMonitoringStatus();
      expect(status.isMonitoring).to.be.false;
    });

    it('should handle stopping when not monitoring', () => {
      // Should not throw error
      replicaHealthService.stopMonitoring();
      
      const status = replicaHealthService.getMonitoringStatus();
      expect(status.isMonitoring).to.be.false;
    });
  });

  describe('checkHealth', () => {
    it('should return health status object', async () => {
      const health = await replicaHealthService.checkHealth();
      
      expect(health).to.be.an('object');
      expect(health).to.have.property('isReplicaSet');
      expect(health).to.have.property('healthy');
      expect(health.isReplicaSet).to.be.a('boolean');
      expect(health.healthy).to.be.a('boolean');
    });

    it('should handle non-replica set deployments gracefully', async () => {
      const health = await replicaHealthService.checkHealth();
      
      // Most test environments are not replica sets
      if (!health.isReplicaSet) {
        expect(health.message).to.equal('Not a replica set deployment');
        expect(health.healthy).to.be.true;
      }
    });
  });

  describe('calculateReplicationLag', () => {
    it('should return zero lag when no primary', () => {
      const result = replicaHealthService.calculateReplicationLag(null, []);
      
      expect(result).to.have.property('maxLagMs', 0);
      expect(result).to.have.property('lagDetails');
      expect(result.lagDetails).to.be.an('array').that.is.empty;
    });

    it('should calculate lag for secondary members', () => {
      const primaryOptime = new Date('2024-01-01T12:00:00Z');
      const secondaryOptime1 = new Date('2024-01-01T11:59:55Z'); // 5 seconds behind
      const secondaryOptime2 = new Date('2024-01-01T11:59:50Z'); // 10 seconds behind
      
      const primary = {
        _id: 0,
        name: 'primary:27017',
        stateStr: 'PRIMARY',
        optimeDate: primaryOptime
      };
      
      const secondaries = [
        {
          _id: 1,
          name: 'secondary1:27018',
          stateStr: 'SECONDARY',
          optimeDate: secondaryOptime1
        },
        {
          _id: 2,
          name: 'secondary2:27019',
          stateStr: 'SECONDARY',
          optimeDate: secondaryOptime2
        }
      ];
      
      const result = replicaHealthService.calculateReplicationLag(primary, secondaries);
      
      expect(result.maxLagMs).to.equal(10000); // 10 seconds
      expect(result.lagDetails).to.have.lengthOf(2);
      expect(result.lagDetails[0].lagMs).to.equal(5000);
      expect(result.lagDetails[1].lagMs).to.equal(10000);
    });

    it('should handle secondaries without optime', () => {
      const primary = {
        _id: 0,
        name: 'primary:27017',
        stateStr: 'PRIMARY',
        optimeDate: new Date()
      };
      
      const secondaries = [
        {
          _id: 1,
          name: 'secondary1:27018',
          stateStr: 'SECONDARY',
          optimeDate: null // No optime
        }
      ];
      
      const result = replicaHealthService.calculateReplicationLag(primary, secondaries);
      
      expect(result.lagDetails).to.have.lengthOf(1);
      expect(result.lagDetails[0].lagMs).to.be.null;
      expect(result.lagDetails[0].status).to.equal('No optime available');
    });
  });
});
