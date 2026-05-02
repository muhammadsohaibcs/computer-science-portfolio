/**
 * Replica Set Health Monitoring Service
 * 
 * This service monitors the health of MongoDB replica set members and tracks
 * replication lag to ensure data consistency and availability.
 * 
 * Features:
 * - Periodic health checks of replica set members
 * - Replication lag calculation
 * - Automatic warnings for unhealthy members
 * - Configurable monitoring intervals
 * 
 * Requirements: 10.3, 10.2
 */

'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');

class ReplicaHealthService {
  constructor() {
    this.monitoringInterval = null;
    this.checkIntervalMs = parseInt(process.env.REPLICA_HEALTH_CHECK_INTERVAL) || 30000; // 30 seconds default
    this.lagThresholdMs = parseInt(process.env.REPLICA_LAG_THRESHOLD) || 10000; // 10 seconds default
    this.isMonitoring = false;
  }

  /**
   * Start monitoring replica set health
   * 
   * @param {number} intervalMs - Optional custom interval in milliseconds
   */
  startMonitoring(intervalMs) {
    if (this.isMonitoring) {
      logger.warn('Replica health monitoring is already running');
      return;
    }

    const interval = intervalMs || this.checkIntervalMs;
    
    logger.info({ 
      intervalMs: interval, 
      lagThresholdMs: this.lagThresholdMs 
    }, 'Starting replica set health monitoring');

    // Perform initial health check
    this.checkHealth().catch(err => {
      logger.error({ err }, 'Initial replica health check failed');
    });

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.checkHealth().catch(err => {
        logger.error({ err }, 'Replica health check failed');
      });
    }, interval);

    this.isMonitoring = true;
  }

  /**
   * Stop monitoring replica set health
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      logger.warn('Replica health monitoring is not running');
      return;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    logger.info('Stopped replica set health monitoring');
  }

  /**
   * Check replica set health and log warnings for issues
   * 
   * @returns {Promise<Object>} Health status object
   */
  async checkHealth() {
    try {
      // Check if connected to a replica set
      const isMaster = await mongoose.connection.db.command({ ismaster: 1 });
      
      if (!isMaster.setName) {
        logger.debug('Not connected to a replica set, skipping health check');
        return {
          isReplicaSet: false,
          healthy: true,
          message: 'Not a replica set deployment'
        };
      }

      // Get replica set status
      const admin = mongoose.connection.db.admin();
      const replStatus = await admin.command({ replSetGetStatus: 1 });

      if (!replStatus || !replStatus.members) {
        logger.warn('Unable to retrieve replica set status');
        return {
          isReplicaSet: true,
          healthy: false,
          message: 'Unable to retrieve replica set status'
        };
      }

      // Analyze member health
      const members = replStatus.members;
      const primaryMember = members.find(m => m.stateStr === 'PRIMARY');
      const secondaryMembers = members.filter(m => m.stateStr === 'SECONDARY');
      const unhealthyMembers = members.filter(m => 
        m.health !== 1 || (m.stateStr !== 'PRIMARY' && m.stateStr !== 'SECONDARY' && m.stateStr !== 'ARBITER')
      );

      // Calculate replication lag
      const replicationLag = this.calculateReplicationLag(primaryMember, secondaryMembers);

      // Log warnings for unhealthy members
      if (unhealthyMembers.length > 0) {
        unhealthyMembers.forEach(member => {
          logger.warn({
            memberId: member._id,
            name: member.name,
            state: member.stateStr,
            health: member.health,
            lastHeartbeat: member.lastHeartbeat
          }, 'Unhealthy replica set member detected');
        });
      }

      // Log warnings for high replication lag
      if (replicationLag.maxLagMs > this.lagThresholdMs) {
        logger.warn({
          maxLagMs: replicationLag.maxLagMs,
          maxLagSeconds: (replicationLag.maxLagMs / 1000).toFixed(2),
          threshold: this.lagThresholdMs,
          affectedMembers: replicationLag.lagDetails
            .filter(d => d.lagMs > this.lagThresholdMs)
            .map(d => ({ name: d.name, lagMs: d.lagMs }))
        }, 'High replication lag detected');
      }

      // Determine overall health
      const healthy = unhealthyMembers.length === 0 && 
                     replicationLag.maxLagMs <= this.lagThresholdMs &&
                     primaryMember !== undefined;

      const healthStatus = {
        isReplicaSet: true,
        healthy,
        setName: replStatus.set,
        members: {
          total: members.length,
          primary: primaryMember ? 1 : 0,
          secondary: secondaryMembers.length,
          unhealthy: unhealthyMembers.length
        },
        replicationLag: {
          maxLagMs: replicationLag.maxLagMs,
          maxLagSeconds: (replicationLag.maxLagMs / 1000).toFixed(2),
          details: replicationLag.lagDetails
        },
        timestamp: new Date()
      };

      // Log health status
      if (healthy) {
        logger.debug({ healthStatus }, 'Replica set health check passed');
      } else {
        logger.warn({ healthStatus }, 'Replica set health check detected issues');
      }

      return healthStatus;
    } catch (err) {
      logger.error({ err }, 'Error during replica set health check');
      return {
        isReplicaSet: false,
        healthy: false,
        error: err.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Calculate replication lag for secondary members
   * 
   * @param {Object} primary - Primary member object
   * @param {Array} secondaries - Array of secondary member objects
   * @returns {Object} Replication lag information
   */
  calculateReplicationLag(primary, secondaries) {
    if (!primary || !primary.optimeDate) {
      return {
        maxLagMs: 0,
        lagDetails: []
      };
    }

    const primaryOptime = primary.optimeDate.getTime();
    const lagDetails = [];
    let maxLagMs = 0;

    secondaries.forEach(secondary => {
      if (secondary.optimeDate) {
        const secondaryOptime = secondary.optimeDate.getTime();
        const lagMs = primaryOptime - secondaryOptime;
        
        lagDetails.push({
          memberId: secondary._id,
          name: secondary.name,
          lagMs: lagMs,
          lagSeconds: (lagMs / 1000).toFixed(2)
        });

        if (lagMs > maxLagMs) {
          maxLagMs = lagMs;
        }
      } else {
        // Secondary has no optime (possibly initializing or down)
        lagDetails.push({
          memberId: secondary._id,
          name: secondary.name,
          lagMs: null,
          lagSeconds: null,
          status: 'No optime available'
        });
      }
    });

    return {
      maxLagMs,
      lagDetails
    };
  }

  /**
   * Get current monitoring status
   * 
   * @returns {Object} Monitoring status
   */
  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      checkIntervalMs: this.checkIntervalMs,
      lagThresholdMs: this.lagThresholdMs
    };
  }
}

// Export singleton instance
module.exports = new ReplicaHealthService();
